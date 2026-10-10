"""DataUpdateCoordinator for ChargeController."""

from __future__ import annotations

import logging
import math
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_UNIT_OF_MEASUREMENT,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    UnitOfElectricCurrent,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import (
    CHARGER_PHASES,
    DOMAIN,
    HH_PHASE_ENTITIES,
    MODE_IDLE,
    PHASES,
    UPDATE_INTERVAL,
)

_LOGGER = logging.getLogger(__name__)

# Factor to convert a current sensor's unit to ampere
_CURRENT_UNIT_FACTORS = {
    UnitOfElectricCurrent.AMPERE: 1.0,
    UnitOfElectricCurrent.MILLIAMPERE: 0.001,
}


class ChargeControllerCoordinator(DataUpdateCoordinator):
    """Central coordinator for ChargeController for charger data, state and load balancing."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.entry = entry
        self._unit_warned: set[str] = set()

    def read_current_a(self, entity_id: str | None) -> float | None:
        """Return the current in ampere of a sensor, or None if it cannot be trusted."""
        if not entity_id:
            return None

        state = self.hass.states.get(entity_id)
        if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return None

        try:
            value = float(state.state)
        except (ValueError, TypeError):
            return None
        if not math.isfinite(value):
            return None

        unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
        factor = _CURRENT_UNIT_FACTORS.get(unit)
        if factor is None:
            if entity_id not in self._unit_warned:
                self._unit_warned.add(entity_id)
                _LOGGER.warning(
                    "Sensor %s has unit %s, expected A or mA; ignoring its value",
                    entity_id,
                    unit,
                )
            return None

        return value * factor

    async def _async_update_data(self) -> dict[str, Any]:
        """Read household loads and compute charger state."""
        store = self.hass.data[DOMAIN]["store"]

        households = {
            household_id: {
                phase: self.read_current_a(household.get(HH_PHASE_ENTITIES[phase]))
                for phase in PHASES
            }
            for household_id, household in store.get_households().items()
        }

        # Load balancing is added in a later step; chargers stay idle without targets
        chargers = {
            charger_id: {
                "mode": MODE_IDLE,
                **{f"target_current_{phase}": None for phase in CHARGER_PHASES},
            }
            for charger_id in store.get_chargers()
        }

        return {"households": households, "chargers": chargers}
