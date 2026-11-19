"""Smart charging: plans EV charging into the cheapest hours and gates the charger."""

from __future__ import annotations

import asyncio
import hashlib
import logging
from dataclasses import dataclass, field
from datetime import datetime, time, timedelta
from typing import Any, Callable

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers.event import async_track_state_change_event, async_track_time_change
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from ..const import (
    CH_HOUSEHOLD,
    DOMAIN,
    EV_BATTERY_KWH,
    EV_CHARGER_ID,
    EV_DEFAULT_FALLBACK_POWER_KW,
    EV_DEFAULT_MODEL,
    EV_DEFAULT_MAX_BLOCKS,
    EV_DEFAULT_TARGET_SOC,
    EV_FALLBACK_POWER_KW,
    EV_MAX_BLOCKS,
    EV_MODEL,
    EV_POWER_ENTITY,
    EV_READY_BY,
    EV_SOC_ENTITY,
    EV_TARGET_SOC_ENTITY,
    HH_PRICE_AREA,
    HH_PRICE_CONFIG_ENTRY,
    MODE_CHARGING,
    MODE_LIMITED,
    STATUS_CHARGING,
    STATUS_COMPLETED,
    STATUS_DISABLED,
    STATUS_INSUFFICIENT_TIME,
    STATUS_NO_CHARGING_NEEDED,
    STATUS_NO_PRICE_SOURCE,
    STATUS_PLANNED,
    STATUS_WAITING_FOR_PRICES,
)
from ..store import ChargeControllerStore
from .learning.manager import LearningManager
from .models import ChargeEstimate, ChargePlan, PriceSlot
from .planner import plan_cheapest
from .prices import NordPoolPriceProvider

_LOGGER = logging.getLogger(__name__)

PLANS_STORAGE_VERSION = 1
ENERGY_EPSILON_KWH = 0.05
SESSION_KEY = "_session_completed"  # plans file key: EV ids whose plug session has completed
PAUSED_KEY = "_paused_chargers"  # plans file key: charger ids paused by us
MAX_TICK_GAP_S = 90  # longer gaps are not integrated into the SOC estimate
MIN_ESTIMATE_POWER_KW = 0.2
SOC_WRITE_STEP = 0.1
SAVE_DELAY_S = 5


@dataclass
class EvState:
    """Runtime state of one EV."""

    config: dict[str, Any]
    manual_soc: float = 0.0
    target_soc: float = float(EV_DEFAULT_TARGET_SOC)
    smart_enabled: bool = True
    control_enabled: bool = True
    charger_active: bool = False  # the charger is delivering power (from the charger ticks)
    plan: ChargePlan | None = None
    status: str = STATUS_DISABLED
    estimate: ChargeEstimate | None = None
    energy_needed_kwh: float = 0.0
    soc: float = 0.0
    slots: list[PriceSlot] = field(default_factory=list)
    slots_end: datetime | None = None  # end of the last known price slot at plan time
    price_key: tuple[str, str] | None = None
    dirty: bool = True  # inputs changed, replan on next update
    allowed: bool | None = None
    # Plug session: None until the first charger tick, then follows the charger.
    connected: bool | None = None
    # A plan completed (or its target was reached) in this plug session: stay paused until unplug.
    session_completed: bool = False
    # Manual SOC estimate from delivered energy
    last_tick: datetime | None = None
    soc_written: float = 0.0


class SmartChargingManager:
    """Per EV plan, status and the decision whether the charger may charge now."""

    def __init__(
        self,
        hass: HomeAssistant,
        store: ChargeControllerStore,
        learning: LearningManager,
        coordinator: Any,
    ) -> None:
        self.hass = hass
        self._store = store
        self._learning = learning
        self._coordinator = coordinator
        self._plans_store: Store = Store(hass, PLANS_STORAGE_VERSION, f"{DOMAIN}_plans")
        self._persisted: dict[str, dict] = {}
        self._paused: set[str] = set()
        self.paused_loaded = False  # persisted pause state is available
        self._providers: dict[tuple[str, str], NordPoolPriceProvider] = {}
        self._listeners: list[Callable[[], None]] = []
        self._lock = asyncio.Lock()
        self._states: dict[str, EvState] = {
            ev_id: EvState(config=config) for ev_id, config in store.get_evs().items()
        }

    # Listener API for entities

    @callback
    def async_add_listener(self, update_callback: Callable[[], None]) -> CALLBACK_TYPE:
        """Call update_callback after every update. Returns the unsubscribe function."""
        self._listeners.append(update_callback)

        @callback
        def _remove() -> None:
            if update_callback in self._listeners:
                self._listeners.remove(update_callback)

        return _remove

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    # Setup

    async def async_start(self, entry: ConfigEntry) -> None:
        """Load persisted plans, make the first plan and start the timers."""
        data = await self._plans_store.async_load()
        self._persisted = dict(data) if isinstance(data, dict) else {}
        completed = self._persisted.pop(SESSION_KEY, [])
        for ev_id in completed if isinstance(completed, list) else []:
            if st := self._states.get(ev_id):
                st.session_completed = True

        paused = self._persisted.pop(PAUSED_KEY, [])
        self._paused = {c for c in paused if isinstance(c, str)} if isinstance(paused, list) else set()
        self.paused_loaded = True

        entry.async_on_unload(
            async_track_time_change(
                self.hass, self._async_tick, minute=[0, 15, 30, 45], second=5
            )
        )
        watched: dict[str, list[str]] = {}
        for ev_id, st in self._states.items():
            for key in (EV_SOC_ENTITY, EV_TARGET_SOC_ENTITY):
                if entity_id := st.config.get(key):
                    watched.setdefault(entity_id, []).append(ev_id)
        if watched:

            @callback
            def _soc_changed(event: Event[EventStateChangedData]) -> None:
                for ev_id in watched.get(event.data["entity_id"], []):
                    self._mark_dirty(self._states[ev_id])
                self.hass.async_create_task(self.async_update())

            entry.async_on_unload(
                async_track_state_change_event(self.hass, list(watched), _soc_changed)
            )

        for ev_id, st in self._states.items():
            if power_entity := st.config.get(EV_POWER_ENTITY):
                self.hass.async_create_background_task(
                    self._learning.async_backfill(
                        ev_id, power_entity, self._model_type(st)
                    ),
                    f"{DOMAIN}_backfill_{ev_id}",
                )
        await self.async_update()

    async def _async_tick(self, _now: datetime) -> None:
        await self.async_update()

    # State set by entities

    @callback
    def restore_current_soc(self, ev_id: str, value: float) -> None:
        if st := self._states.get(ev_id):
            st.manual_soc = value
            st.soc_written = value

    @callback
    def restore_target_soc(self, ev_id: str, value: float) -> None:
        if st := self._states.get(ev_id):
            st.target_soc = value

    @callback
    def restore_smart_enabled(self, ev_id: str, value: bool) -> None:
        if st := self._states.get(ev_id):
            st.smart_enabled = value

    @callback
    def restore_control_enabled(self, ev_id: str, value: bool) -> None:
        if st := self._states.get(ev_id):
            st.control_enabled = value

    async def async_set_current_soc(self, ev_id: str, value: float) -> None:
        if st := self._states.get(ev_id):
            st.manual_soc = value
            st.soc_written = value
            self._mark_dirty(st)
            await self.async_update()

    async def async_set_target_soc(self, ev_id: str, value: float) -> None:
        if st := self._states.get(ev_id):
            st.target_soc = value
            self._mark_dirty(st)
            await self.async_update()

    async def async_set_smart_enabled(self, ev_id: str, value: bool) -> None:
        if st := self._states.get(ev_id):
            if value:
                self._mark_dirty(st)  # replan from now with the current inputs
            st.smart_enabled = value
            # Pause (on) or release (off) the charger in the same cycle
            await self.async_update(immediate_ev=ev_id)

    async def async_set_control_enabled(self, ev_id: str, value: bool) -> None:
        if st := self._states.get(ev_id):
            st.control_enabled = value
            await self.async_update()

    async def async_start_charging(self, ev_id: str) -> None:
        """Charge now: smart charging off, which releases the charger at once."""
        await self.async_set_smart_enabled(ev_id, False)

    @staticmethod
    def _mark_dirty(st: EvState) -> None:
        """Inputs changed by the user or a SOC sensor: replan and drop the completed flag."""
        st.dirty = True
        st.session_completed = False

    # Read access

    def ev_ids(self) -> list[str]:
        return list(self._states)

    def currency(self, ev_id: str) -> str | None:
        """Currency of the EV's price source, None when unknown."""
        st = self._states.get(ev_id)
        if st is None or st.price_key is None:
            return None
        provider = self._providers.get(st.price_key)
        if provider is None:
            provider = self._providers[st.price_key] = NordPoolPriceProvider(
                self.hass, *st.price_key
            )
        return provider.currency

    def state(self, ev_id: str) -> EvState | None:
        return self._states.get(ev_id)

    def in_block(self, ev_id: str, now: datetime | None = None) -> bool:
        st = self._states.get(ev_id)
        if st is None or st.plan is None:
            return False
        now = now or dt_util.utcnow()
        return any(b.start <= now < b.end for b in st.plan.blocks)

    def next_block_start(self, ev_id: str, now: datetime | None = None) -> datetime | None:
        """Start of the running or next block."""
        st = self._states.get(ev_id)
        if st is None or st.plan is None:
            return None
        now = now or dt_util.utcnow()
        return next((b.start for b in st.plan.blocks if b.end > now), None)

    def deadline(self, ev_id: str, now: datetime | None = None) -> datetime | None:
        st = self._states.get(ev_id)
        return self._deadline(st.config, now or dt_util.utcnow()) if st else None

    def ev_for_charger(self, charger_id: str) -> str | None:
        return next(
            (
                ev_id
                for ev_id, st in self._states.items()
                if st.config.get(EV_CHARGER_ID) == charger_id
            ),
            None,
        )

    def charging_allowed(self, charger_id: str, now: datetime | None = None) -> bool | None:
        """True inside a planned block, False when the charger should pause, None for no opinion."""
        ev_id = self.ev_for_charger(charger_id)
        st = self._states.get(ev_id) if ev_id else None
        if st is None or not st.smart_enabled or not st.control_enabled:
            return None
        if st.connected is False:
            return None  # unplugged: release
        if st.session_completed:
            return False  # plan completed or target reached in this plug session
        if st.energy_needed_kwh <= ENERGY_EPSILON_KWH or st.plan is None:
            return None  # nothing to plan (fail-open)
        return self.in_block(ev_id, now)  # type: ignore[arg-type]

    # Calculation

    @staticmethod
    def _deadline(config: dict, now: datetime) -> datetime | None:
        ready_by = config.get(EV_READY_BY)
        if not ready_by:
            return None
        try:
            hour, minute = (int(part) for part in ready_by.split(":")[:2])
        except ValueError:
            return None
        local_now = dt_util.as_local(now)
        day = local_now.date()
        deadline = datetime.combine(day, time(hour, minute), tzinfo=local_now.tzinfo)
        if deadline <= local_now:
            deadline = datetime.combine(
                day + timedelta(days=1), time(hour, minute), tzinfo=local_now.tzinfo
            )
        return dt_util.as_utc(deadline)

    def effective_soc(self, ev_id: str) -> float:
        st = self._states.get(ev_id)
        return self._effective_soc(st) if st else 0.0

    def effective_target_soc(self, ev_id: str) -> float:
        st = self._states.get(ev_id)
        return self._effective_target(st) if st else 0.0

    def _effective_target(self, st: EvState) -> float:
        entity_id = st.config.get(EV_TARGET_SOC_ENTITY)
        if entity_id and (state := self.hass.states.get(entity_id)) is not None:
            try:
                value = float(state.state)
            except ValueError:
                value = None
            if value is not None and value == value:
                return min(100.0, max(0.0, value))
        return st.target_soc

    def _effective_soc(self, st: EvState) -> float:
        entity_id = st.config.get(EV_SOC_ENTITY)
        if entity_id and (state := self.hass.states.get(entity_id)) is not None:
            try:
                value = float(state.state)
            except ValueError:
                value = None
            if value is not None and 0 <= value <= 100:
                return value
        return st.manual_soc

    def _price_key(self, st: EvState) -> tuple[str, str] | None:
        charger = self._store.get_charger(st.config.get(EV_CHARGER_ID) or "")
        household = self._store.get_household(charger.get(CH_HOUSEHOLD)) if charger else None
        if not household:
            return None
        entry, area = household.get(HH_PRICE_CONFIG_ENTRY), household.get(HH_PRICE_AREA)
        return (entry, area) if entry and area else None

    @staticmethod
    def _model_type(st: EvState) -> str:
        """Model type of an EV. The panel always saves "average" (the former only
        model), so that value is treated as the default."""
        model = st.config.get(EV_MODEL)
        return EV_DEFAULT_MODEL if not model or model == "average" else model

    def _fallback_power(self, st: EvState) -> float:
        return float(st.config.get(EV_FALLBACK_POWER_KW) or EV_DEFAULT_FALLBACK_POWER_KW)

    def _inputs_key(self, st: EvState, soc: float, estimate: ChargeEstimate) -> str:
        cfg = st.config
        raw = repr(
            (
                round(soc, 3),
                round(self._effective_target(st), 3),
                cfg.get(EV_BATTERY_KWH),
                cfg.get(EV_READY_BY),
                cfg.get(EV_MAX_BLOCKS, EV_DEFAULT_MAX_BLOCKS),
                tuple(None if v is None else round(v, 1) for v in estimate.hourly_kw),
                round(estimate.power_kw, 1) if estimate.source == "fallback" else None,
            )
        )
        return hashlib.sha1(raw.encode()).hexdigest()

    def _replan(self, ev_id: str, st: EvState, now: datetime) -> None:
        """Make a new plan (or none) for the current inputs."""
        st.dirty = False
        st.plan = None
        if (
            not st.smart_enabled
            or st.connected is False
            or st.energy_needed_kwh <= ENERGY_EPSILON_KWH
        ):
            return
        if st.price_key is None or st.estimate is None:
            return
        deadline = self._deadline(st.config, now)
        slots = st.slots
        if not slots or (deadline is not None and slots[-1].end < deadline):
            return  # waiting for prices
        key = self._inputs_key(st, st.soc, st.estimate)
        persisted = self._persisted.pop(ev_id, None)
        plan: ChargePlan | None = None
        if persisted and persisted.get("inputs_key") == key:
            try:
                plan = ChargePlan.from_dict(persisted)
            except (KeyError, ValueError, TypeError):
                plan = None
        if plan is None:
            plan = plan_cheapest(
                slots,
                now,
                deadline,
                st.energy_needed_kwh,
                int(st.config.get(EV_MAX_BLOCKS, EV_DEFAULT_MAX_BLOCKS)),
                lambda at: self._learning.power_at(
                    ev_id,
                    at,
                    self._fallback_power(st),
                    st.soc,
                    self._model_type(st),
                ),
                key,
            )
        if plan.blocks:
            st.plan = plan
            st.slots_end = slots[-1].end

    def _block_started(self, st: EvState, now: datetime) -> bool:
        return st.plan is not None and any(b.start <= now for b in st.plan.blocks)

    def _status(self, st: EvState, now: datetime) -> str:
        if not st.smart_enabled:
            return STATUS_DISABLED
        if st.session_completed:
            return STATUS_COMPLETED
        if st.connected is False or st.energy_needed_kwh <= ENERGY_EPSILON_KWH:
            return STATUS_NO_CHARGING_NEEDED
        if st.price_key is None:
            return STATUS_NO_PRICE_SOURCE
        plan = st.plan
        if plan is None:
            return STATUS_WAITING_FOR_PRICES
        if any(b.start <= now < b.end for b in plan.blocks):
            return STATUS_CHARGING
        if plan.blocks and plan.blocks[-1].end <= now:
            return STATUS_COMPLETED
        if plan.insufficient_time:
            return STATUS_INSUFFICIENT_TIME
        return STATUS_PLANNED

    async def async_update(
        self, force_refresh: bool = False, immediate_ev: str | None = None
    ) -> None:
        """Refresh prices, replan where the rules say so and update statuses."""
        async with self._lock:
            now = dt_util.utcnow()
            old_allowed = {ev_id: st.allowed for ev_id, st in self._states.items()}
            plans_changed = False

            for ev_id, st in self._states.items():
                st.price_key = self._price_key(st)
                st.slots = []
                if st.price_key is not None:
                    provider = self._providers.get(st.price_key)
                    if provider is None:
                        provider = self._providers[st.price_key] = NordPoolPriceProvider(
                            self.hass, *st.price_key
                        )
                    st.slots = await provider.async_get_slots(now)

                battery = float(st.config.get(EV_BATTERY_KWH) or 0)
                st.soc = self._effective_soc(st)
                st.energy_needed_kwh = max(0.0, battery * (self._effective_target(st) - st.soc) / 100)
                deadline = self._deadline(st.config, now)
                st.estimate = self._learning.estimate(
                    ev_id,
                    st.energy_needed_kwh,
                    self._fallback_power(st),
                    st.soc,
                    self._model_type(st),
                    [
                        sl.start
                        for sl in st.slots
                        if sl.end > now and (deadline is None or sl.end <= deadline)
                    ],
                    now,
                )

                had_plan = st.plan
                new_prices = (
                    bool(st.slots)
                    and st.slots_end is not None
                    and st.slots[-1].end > st.slots_end
                    and not self._block_started(st, now)
                )
                if st.connected is not False and (
                    st.dirty or (not st.session_completed and (st.plan is None or new_prices))
                ):
                    self._replan(ev_id, st, now)
                    plans_changed = plans_changed or st.plan is not had_plan
                if (
                    st.plan is not None
                    and st.connected is not False
                    and not st.session_completed
                    and (
                        st.energy_needed_kwh <= ENERGY_EPSILON_KWH
                        or (st.plan.blocks and st.plan.blocks[-1].end <= now)
                    )
                ):
                    st.session_completed = True
                    plans_changed = True
                st.status = self._status(st, now)
                st.allowed = self.charging_allowed(st.config.get(EV_CHARGER_ID) or "", now)

            if plans_changed:
                self._plans_store.async_delay_save(self._plans_data, SAVE_DELAY_S)

            changed = force_refresh or any(
                old_allowed[ev_id] != st.allowed for ev_id, st in self._states.items()
            )

        self._notify()
        immediate_state = self._states.get(immediate_ev) if immediate_ev else None
        if immediate_state is not None:
            await self._coordinator.async_refresh_now(
                immediate_state.config.get(EV_CHARGER_ID) or ""
            )
        elif changed:
            await self._coordinator.async_request_refresh()

    def is_paused(self, charger_id: str) -> bool:
        """Whether we paused the charger's session (kept across restarts)."""
        return charger_id in self._paused

    def set_paused(self, charger_id: str, paused: bool) -> None:
        """Record that we paused (or resumed, or lost) the charger's session."""
        if paused == (charger_id in self._paused):
            return
        self._paused.add(charger_id) if paused else self._paused.discard(charger_id)
        self._plans_store.async_delay_save(self._plans_data, SAVE_DELAY_S)

    def _plans_data(self) -> dict[str, dict]:
        data: dict[str, Any] = {
            ev_id: st.plan.to_dict() for ev_id, st in self._states.items() if st.plan is not None
        }
        if completed := [ev_id for ev_id, st in self._states.items() if st.session_completed]:
            data[SESSION_KEY] = completed
        if self._paused:
            data[PAUSED_KEY] = sorted(self._paused)
        return data

    # Charger tick: plug session, SOC estimate and learning
    #
    # Plug session: per EV, follows the `connected` value of the charger ticks. Once a plan
    # completed (or the target was reached while a plan was active) the EV stays paused until
    # it is unplugged. Unplugging clears the plan and releases the charger; plugging in plans
    # again. The completed flag is persisted with the plans so a restart keeps the pause.

    def feed_learning(
        self, charger_id: str, now: datetime, mode: str, connected: bool
    ) -> None:
        """Handle a charger tick of the linked EV: plug session, SOC estimate, learning."""
        ev_id = self.ev_for_charger(charger_id)
        st = self._states.get(ev_id) if ev_id else None
        if st is None:
            return
        power_kw = self._power_kw(st)
        st.charger_active = mode in (MODE_CHARGING, MODE_LIMITED)
        self._track_session(st, connected)
        self._estimate_soc(st, now, connected, power_kw)
        self._learning.feed(
            ev_id,  # type: ignore[arg-type]
            now,
            power_kw,
            mode,
            connected,
            self._model_type(st),
        )

    def _track_session(self, st: EvState, connected: bool) -> None:
        previous, st.connected = st.connected, connected
        if connected == previous:
            return
        if not connected:
            # Unplugged: drop the plan and release the charger
            changed = st.plan is not None or st.session_completed
            st.plan = None
            st.slots_end = None
            st.session_completed = False
            if changed:
                self._plans_store.async_delay_save(self._plans_data, SAVE_DELAY_S)
                self.hass.async_create_task(self.async_update(force_refresh=True))
        elif previous is False:
            # Plugged in: new session, plan with the current inputs
            self._mark_dirty(st)
            self.hass.async_create_task(self.async_update())

    def _estimate_soc(
        self, st: EvState, now: datetime, connected: bool, power_kw: float | None
    ) -> None:
        """Estimate the manual SOC from delivered energy (only without a SOC sensor)."""
        last, st.last_tick = st.last_tick, now
        battery = float(st.config.get(EV_BATTERY_KWH) or 0)
        if (
            st.config.get(EV_SOC_ENTITY)
            or not connected
            or last is None
            or power_kw is None
            or power_kw < MIN_ESTIMATE_POWER_KW
            or battery <= 0
        ):
            return
        dt = (now - last).total_seconds()
        cap = min(100.0, self._effective_target(st))
        if not 0 < dt <= MAX_TICK_GAP_S or st.manual_soc >= cap:
            return
        st.manual_soc = min(cap, st.manual_soc + power_kw * dt / 3600 / battery * 100)
        reached = st.manual_soc >= cap
        if reached or abs(st.manual_soc - st.soc_written) >= SOC_WRITE_STEP:
            st.soc_written = st.manual_soc
            self._notify()
        if reached:
            self.hass.async_create_task(self.async_update())  # complete without waiting

    def _power_kw(self, st: EvState) -> float | None:
        entity_id = st.config.get(EV_POWER_ENTITY)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None:
            return None
        try:
            value = float(state.state)
        except ValueError:
            return None
        factor = {"W": 0.001, "kW": 1.0, "MW": 1000.0}.get(
            state.attributes.get("unit_of_measurement")
        )
        return value * factor if factor is not None else None

    # Websocket

    async def async_get_plan_info(self, ev_id: str) -> dict[str, Any]:
        """Status, estimate, plan and prices of an EV for the panel."""
        st = self._states.get(ev_id)
        if st is None:
            return {}
        now = dt_util.utcnow()
        today = dt_util.as_local(now).date()
        estimate = st.estimate
        deadline = self._deadline(st.config, now)
        return {
            "status": st.status,
            "soc": st.soc,
            "target_soc": self._effective_target(st),
            "energy_needed_kwh": st.energy_needed_kwh,
            "estimate": {
                "power_kw": estimate.power_kw,
                "duration_min": estimate.duration.total_seconds() / 60,
                "source": estimate.source,
                "confidence": estimate.confidence,
                "n_samples": estimate.n_samples,
                "hourly_kw": estimate.hourly_kw,
            }
            if estimate
            else None,
            "plan": st.plan.to_dict() if st.plan else None,
            "prices": [
                {"start": s.start.isoformat(), "end": s.end.isoformat(), "price": s.price}
                for s in st.slots
                if dt_util.as_local(s.start).date() >= today
            ],
            "currency": self.currency(ev_id),
            "deadline": deadline.isoformat() if deadline else None,
            "control_enabled": st.control_enabled,
            "smart_enabled": st.smart_enabled,
        }
