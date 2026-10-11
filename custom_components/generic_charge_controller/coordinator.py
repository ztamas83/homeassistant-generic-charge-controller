"""DataUpdateCoordinator for ChargeController."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers.debounce import Debouncer
from homeassistant.helpers.event import async_call_later, async_track_state_change_event
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
    OVERLOAD_DURATION_S,
    OVERLOAD_FACTOR,
    PHASES,
    REFRESH_COOLDOWN_S,
    SETTING_CHARGER_UPDATE_INTERVAL,
    UPDATE_INTERVAL,
)
from .control import LimitSender, OverloadDetector
from .loadbalancer.balancer import BalancerConfig, PhaseLoad, SafeLoadBalancer
from .readings import read_current_a

_LOGGER = logging.getLogger(__name__)


class ChargeControllerCoordinator(DataUpdateCoordinator):
    """Central coordinator for ChargeController for charger data, state and load balancing.

    Targets are always calculated and exposed as sensors. They are sent to a charger
    only while its "load balancing active" switch is on and a car is connected.
    """

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
            request_refresh_debouncer=Debouncer(
                hass, _LOGGER, cooldown=REFRESH_COOLDOWN_S, immediate=True
            ),
        )
        self.entry = entry
        self.stale_after = timedelta(seconds=DEFAULT_STALE_AFTER_S)
        self._balancers: dict[str, SafeLoadBalancer] = {}
        self._started_at = dt_util.utcnow()
        self._active: dict[str, bool] = {}
        self._senders: dict[str, LimitSender] = {}
        self._overload_detectors: dict[str, OverloadDetector] = {}
        self._recheck_cancel: CALLBACK_TYPE | None = None
        self._recheck_at: datetime | None = None

    def _charger_update_interval(self) -> timedelta:
        settings = self.hass.data[DOMAIN]["store"].get_settings()
        return timedelta(seconds=settings[SETTING_CHARGER_UPDATE_INTERVAL])

    @callback
    def _schedule_recheck(self, delay_s: float, now: datetime) -> None:
        """Recalculate after delay_s, unless an earlier recalculation is scheduled.

        Used when limits are held back by the update interval, or an overload is
        about to count as sustained, while input sensors might not change.
        """
        when = now + timedelta(seconds=delay_s)
        if self._recheck_cancel is not None and self._recheck_at is not None:
            if self._recheck_at <= when:
                return
            self._recheck_cancel()

        @callback
        def _async_recheck(_now: datetime) -> None:
            self._recheck_cancel = None
            self._recheck_at = None
            self.hass.async_create_task(self.async_request_refresh())

        self._recheck_cancel = async_call_later(self.hass, delay_s, _async_recheck)
        self._recheck_at = when

    async def async_shutdown(self) -> None:
        """Cancel a scheduled recalculation."""
        if self._recheck_cancel is not None:
            self._recheck_cancel()
            self._recheck_cancel = None
        await super().async_shutdown()

    @callback
    def async_track_inputs(self) -> CALLBACK_TYPE:
        """Recalculate when a household phase sensor or a charger entity changes.

        Returns a function that stops tracking.
        """
        store = self.hass.data[DOMAIN]["store"]
        entity_ids = {
            entity_id
            for household in store.get_households().values()
            for key in HH_PHASE_ENTITIES.values()
            if (entity_id := household.get(key))
        }
        for charger_id, config in store.get_chargers().items():
            entity_ids.update(create_charger(self.hass, charger_id, config).tracked_entity_ids())

        _LOGGER.debug("Tracking %s", sorted(entity_ids))

        @callback
        def _async_input_changed(event: Event[EventStateChangedData]) -> None:
            self.hass.async_create_task(self.async_request_refresh())

        return async_track_state_change_event(
            self.hass, sorted(entity_ids), _async_input_changed
        )

    def is_active(self, charger_id: str) -> bool:
        """Whether limits are sent to the charger."""
        return self._active.get(charger_id, False)

    def restore_active(self, charger_id: str, active: bool) -> None:
        """Set the active flag from restored state, without touching the charger."""
        self._active[charger_id] = active

    async def async_set_active(self, charger_id: str, active: bool) -> None:
        """Start or stop sending limits to a charger.

        Stopping sets the charger back to its circuit rated current.
        """
        self._active[charger_id] = active
        if not active:
            self._senders.pop(charger_id, None)
            config = self.hass.data[DOMAIN]["store"].get_charger(charger_id)
            if config is not None:
                await create_charger(self.hass, charger_id, config).async_release()
        await self.async_request_refresh()

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
            chargers[charger_id] = await self._async_update_charger(
                charger_id, config, household, households[household_id], now
            )

        return {"households": households, "chargers": chargers}

    async def _async_update_charger(
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

        targets_by_charger_phase = {
            phase_map[phase]: target for phase, target in result.targets.items()
        }
        reasons = list(result.reasons)

        overload, overload_pending_s = self._overload_detectors.setdefault(
            config[CH_HOUSEHOLD], OverloadDetector()
        ).update(household_loads, float(household[HH_FUSE]), now)
        if overload:
            reasons.append(
                f"Household load above {OVERLOAD_FACTOR:.0%} of the fuse "
                f"for more than {OVERLOAD_DURATION_S} s"
            )
        elif overload_pending_s is not None:
            self._schedule_recheck(overload_pending_s + 0.5, now)

        active = self.is_active(charger_id)
        if active:
            if charger.is_connected():
                sender = self._senders.get(charger_id)
                if sender is None:
                    sender = self._senders[charger_id] = LimitSender(
                        self._started_at, self._charger_update_interval()
                    )
                pending, send_reasons = await sender.async_apply(
                    charger,
                    {p: int(v) for p, v in targets_by_charger_phase.items()},
                    result.failsafe,
                    overload,
                    now,
                )
                reasons += send_reasons
                if pending and (due := sender.seconds_until_due(now)) is not None:
                    self._schedule_recheck(due + 0.5, now)
            else:
                reasons.append("No car connected, limits not sent")

        for reason in reasons:
            _LOGGER.debug("Charger %s: %s", charger_id, reason)

        sender = self._senders.get(charger_id)
        return {
            "mode": mode,
            "reasons": reasons,
            "control_active": active,
            "overload": overload,
            "last_sent": sender.last_sent if sender else None,
            "last_sent_at": sender.last_sent_at.isoformat()
            if sender and sender.last_sent_at
            else None,
            **{
                f"target_current_{phase}": targets_by_charger_phase[phase]
                for phase in CHARGER_PHASES
            },
            **{
                f"charger_current_{phase}": charger_currents[phase]
                for phase in CHARGER_PHASES
            },
        }
