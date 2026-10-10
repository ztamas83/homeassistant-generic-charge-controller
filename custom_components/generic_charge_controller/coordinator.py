"""DataUpdateCoordinator for ChargeController."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .charger_factory import create_charger
from .const import (
    CH_HOUSEHOLD,
    CH_PHASE_MAP,
    CHARGER_PHASES,
    DEFAULT_RAMP_UP_A_PER_MIN,
    DEFAULT_SAFETY_MARGIN_A,
    DEFAULT_STALE_AFTER_S,
    DOMAIN,
    HH_FUSE,
    HH_PHASE_ENTITIES,
    MIN_CHARGING_CURRENT_A,
    MODE_CHARGING,
    MODE_FAILSAFE,
    MODE_IDLE,
    MODE_LIMITED,
    PHASES,
    UPDATE_INTERVAL,
)
from .loadbalancer.balancer import BalancerConfig, PhaseLoad, SafeLoadBalancer
from .readings import read_current_a

_LOGGER = logging.getLogger(__name__)


class ChargeControllerCoordinator(DataUpdateCoordinator):
    """Central coordinator for ChargeController for charger data, state and load balancing.

    Targets are calculated and exposed as sensors only; nothing is sent to chargers.
    """

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
        self.stale_after = timedelta(seconds=DEFAULT_STALE_AFTER_S)
        self._balancers: dict[str, SafeLoadBalancer] = {}

    def _balancer(self, charger_id: str, fuse_a: float) -> SafeLoadBalancer:
        """Return the balancer of a charger; it keeps state between updates."""
        config = BalancerConfig(
            fuse_a=fuse_a,
            safety_margin_a=DEFAULT_SAFETY_MARGIN_A,
            min_current_a=MIN_CHARGING_CURRENT_A,
            ramp_up_a_per_min=DEFAULT_RAMP_UP_A_PER_MIN,
        )
        balancer = self._balancers.get(charger_id)
        if balancer is None or balancer.config != config:
            balancer = SafeLoadBalancer(config)
            self._balancers[charger_id] = balancer
        return balancer

    async def _async_update_data(self) -> dict[str, Any]:
        """Read household loads and calculate charger targets."""
        store = self.hass.data[DOMAIN]["store"]
        now = dt_util.utcnow()
        stored_households = store.get_households()

        households = {
            household_id: {
                phase: read_current_a(
                    self.hass,
                    household.get(HH_PHASE_ENTITIES[phase]),
                    stale_after=self.stale_after,
                    now=now,
                )
                for phase in PHASES
            }
            for household_id, household in stored_households.items()
        }

        chargers = {}
        for charger_id, config in store.get_chargers().items():
            household_id = config.get(CH_HOUSEHOLD)
            household = stored_households.get(household_id)
            if household is None:
                continue
            chargers[charger_id] = self._update_charger(
                charger_id, config, household, households[household_id], now
            )

        return {"households": households, "chargers": chargers}

    def _update_charger(
        self,
        charger_id: str,
        config: dict,
        household: dict,
        household_loads: dict[str, float | None],
        now: datetime,
    ) -> dict[str, Any]:
        """Calculate targets and mode for one charger."""
        charger = create_charger(
            self.hass, charger_id, config, stale_after=self.stale_after, now=now
        )
        phase_map: dict[str, str] = config[CH_PHASE_MAP]  # household phase -> charger phase
        charger_currents = charger.phase_currents()

        result = self._balancer(charger_id, float(household[HH_FUSE])).calculate(
            {
                phase: PhaseLoad(
                    household_a=household_loads[phase],
                    charger_a=charger_currents[phase_map[phase]],
                )
                for phase in PHASES
            },
            charger.max_current(),
            now,
        )

        if result.failsafe:
            mode = MODE_FAILSAFE
        elif not charger.is_charging():
            mode = MODE_IDLE
        elif result.limited:
            mode = MODE_LIMITED
        else:
            mode = MODE_CHARGING

        for reason in result.reasons:
            _LOGGER.debug("Charger %s: %s", charger_id, reason)

        targets_by_charger_phase = {
            phase_map[phase]: target for phase, target in result.targets.items()
        }
        return {
            "mode": mode,
            "reasons": result.reasons,
            **{
                f"target_current_{phase}": targets_by_charger_phase[phase]
                for phase in CHARGER_PHASES
            },
            **{
                f"charger_current_{phase}": charger_currents[phase]
                for phase in CHARGER_PHASES
            },
        }
