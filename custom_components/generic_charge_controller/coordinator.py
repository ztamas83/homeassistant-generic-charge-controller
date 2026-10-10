"""DataUpdateCoordinator for ChargeController."""

from __future__ import annotations

import logging
import re
from collections import deque
from datetime import timedelta, datetime
from typing import Dict, Any, List, Tuple

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    UPDATE_INTERVAL, DOMAIN
)
from .loadbalancer.abstract_loadbalancer import AbstractLoadBalancer
from .loadbalancer.logging_calculator import LoggingCalculator

_LOGGER = logging.getLogger(__name__)


class ChargeControllerCoordinator(DataUpdateCoordinator):
    """Central coordinator for ChargeController for charger data, state and load balancing."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        load_balancer: AbstractLoadBalancer | None = None,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.entry = entry
        self.load_balancer = load_balancer or LoggingCalculator(_LOGGER)
        # Store phase load samples: {household_id: {phase: deque[(timestamp, value)]}}
        self._phase_load_history: Dict[str, Dict[str, deque[Tuple[datetime, float]]]] = {}
        self._max_history_age = timedelta(minutes=5)

    def _get_sensor_value(self, config_str: str) -> float:
        """Fetch value from entity_id or entity_id.state.attributes[attr]."""
        if not config_str:
            return 0.0

        # Matches pattern entity_id.state.attributes[attr_name]
        match = re.match(r"(.*?)\.state\.attributes\[(.*?)\]", config_str)
        if match:
            entity_id, attr_name = match.groups()
            state = self.hass.states.get(entity_id)
            if state and state.state not in ("unavailable", "unknown"):
                try:
                    return float(state.attributes.get(attr_name, 0.0))
                except (ValueError, TypeError):
                    return 0.0
        else:
            # Simple entity_id
            state = self.hass.states.get(config_str)
            if state and state.state not in ("unavailable", "unknown"):
                try:
                    return float(state.state)
                except (ValueError, TypeError):
                    return 0.0
        
        return 0.0

    async def _async_update_data(self) -> dict:
        """Fetch and compute state for all chargers."""
        store = self.hass.data[DOMAIN]["store"]
        chargers = store.get_chargers()
        households = store.get_households()

        charger_data: Dict[str, Dict[str, Any]] = {}

        for charger_id, charger_config in chargers.items():
            household_id = charger_config.get("household_id")
            if not household_id or household_id not in households:
                continue

            household_config = households[household_id]
            now = datetime.now()

            # 1. Prepare household total loads and store in history
            current_load = {}
            if household_id not in self._phase_load_history:
                self._phase_load_history[household_id] = {
                    "L1": deque(), "L2": deque(), "L3": deque()
                }

            for phase in ["L1", "L2", "L3"]:
                sensor_id = household_config.get(phase)
                val = self._get_sensor_value(sensor_id)
                current_load[phase] = val
                
                # Store sample
                history = self._phase_load_history[household_id][phase]
                history.append((now, val))
                
                # Prune old samples
                while history and (now - history[0][0]) > self._max_history_age:
                    history.popleft()

            charger_data[charger_id] = {
                "charger_id": charger_id,
                "mode": "idle",
                "target_current_P1": None,
                "target_current_P2": None,
                "target_current_P3": None,
            }

            # 2. Prepare charger loads per household phase
            # Mapping here is implicit: the charger config stores sensors by HOUSEHOLD phase.
            charger_load_on_house = {}
            for phase in ["L1", "L2", "L3"]:
                sensor_info = charger_config.get(phase)
                charger_load_on_house[phase] = self._get_sensor_value(sensor_info)

            # Fetch rated current (main fuse limit)
            rated_current = float(charger_config.get("rated_current", 16))

            # 3. Calculate target current per HOUSEHOLD phase
            targets = self.load_balancer.calculate_target_current(
                charger_id, 
                {}, # phase_mapping no longer needed inside calculator
                current_load, 
                charger_load_on_house, 
                rated_current
            )

            # If targets is None, it means the calculator wants us to skip updates (MVP)
            if targets is None:
                continue

            # 4. Map targets back to charger phases
            for house_phase, target_val in targets.items():
                sensor_info = charger_config.get(house_phase, "")
                
                # Check for attribute hint or fallback
                match = re.search(r"attributes\[.*?(\d)\]", sensor_info)
                if match:
                    internal_phase = f"P{match.group(1)}"
                else:
                    internal_phase = house_phase.replace("L", "P")

                charger_data[charger_id][f"target_current_{internal_phase}"] = target_val

            # Set mode based on targets
            if any(val > 0 for val in targets.values()):
                charger_data[charger_id]["mode"] = "balancing"

        return {"chargers": charger_data}
