"""DataUpdateCoordinator for RoomMind."""

from __future__ import annotations

import logging
import time
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .utils.history_store import HistoryStore

from .loadbalancer.core import DynamicLoadBalancer

from .const import (
    UPDATE_INTERVAL, DOMAIN
)
# from .const import CLIMATE_MODE_COOL_ONLY, CLIMATE_MODE_HEAT_ONLY, DEFAULT_COMFORT_COOL, DEFAULT_COMFORT_HEAT, DEFAULT_ECO_COOL, DEFAULT_ECO_HEAT, DOMAIN, EKF_UPDATE_MIN_DT, HEATING_BOOST_TARGET, HISTORY_ROTATE_CYCLES, HISTORY_WRITE_CYCLES, MAX_PREDICTION_DELTA, MODE_COOLING, MODE_HEATING, MODE_IDLE, SCHEDULE_STATE_ON, THERMAL_SAVE_CYCLES, TargetTemps, UPDATE_INTERVAL, VALVE_PROTECTION_CHECK_CYCLES, build_override_live
# from .utils.history_store import HistoryStore
# from .control.mpc_controller import DEFAULT_OUTDOOR_TEMP_FALLBACK, MPCController, check_acs_can_heat, get_can_heat_cool, is_mpc_active
# from .utils.sensor_utils import read_sensor_value
# from .control.solar import compute_q_solar_norm
# from .utils.temp_utils import celsius_delta_to_ha, ha_temp_to_celsius, ha_temp_unit_str
# from .control.thermal_model import RoomModelManager
# from .managers.mold_manager import MoldManager
# from .managers.weather_manager import WeatherManager
# from .managers.residual_heat_tracker import ResidualHeatTracker
# from .managers.valve_manager import ValveManager
# from .managers.window_manager import WindowManager

_LOGGER = logging.getLogger(__name__)


def _get_area_name(hass: HomeAssistant, area_id: str) -> str:
    """Get human-readable area name from area registry."""
    try:
        area_reg = ar.async_get(hass)
        area = area_reg.async_get_area(area_id)
        return area.name if area else area_id
    except Exception:  # noqa: BLE001
        return area_id


class ChargeControllerCoordinator(DataUpdateCoordinator):
    """Central coordinator for ChargeController for charger data, state and load balancing."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=UPDATE_INTERVAL),
        )
        self.entry = entry
        self.chargers: dict = {}
        self._loadbalancer: DynamicLoadBalancer | None = None
        self._last_measurements: dict = {}
        self._history_store = None
        # Track which charger entities have been created to avoid duplicates on config reload
        self._charger_sensors: set[str] = set()

    async def _async_update_data(self) -> dict:
        """Fetch and compute state for all chargers.

        This is the central loop that:
        1. Reads current measurements from charger entities
        2. Evaluates charging state for each charger
        3. Determines balancing action per charger
        4. Applies charging control commands
        5. Returns state dict consumed by charger entities
        """
        store = self.hass.data[DOMAIN]["store"]
        chargers = store.get_chargers()

        # Read outdoor sensors from global settings
        # settings = store.get_settings()

        # Initialize history store (once)
        if self._history_store is None:
            self._history_store = HistoryStore(
                self.hass.config.path(".storage/roommind_history")
            )

        return {"chargers": chargers }

    async def _async_process_charger(
        self, charger: dict, settings: dict, outdoor_forecast: list[dict]
    ) -> dict:
        """Process a single charger: read sensor, evaluate schedule, apply control."""
        charger_id = charger.get("charger_id", "unknown")

        _LOGGER.info("Processing charger '%s'", charger_id)

        # # Fallback: read current_temperature from first thermostat/AC if no external sensor
        # if current_temp is None and not has_external_sensor:
        #     raw_dev = self._read_device_temp(room)
        #     current_temp = ha_temp_to_celsius(
        #         self.hass, raw_dev) if raw_dev is not None else None

        # current_humidity = read_sensor_value(
        #     self.hass, room.get("humidity_sensor"), charger_id, "humidity"
        # )

        # # --- Mold risk calculation ---
        # mold = await self._mold_manager.evaluate(
        #     charger_id,
        #     _get_area_name(self.hass, charger_id),
        #     current_temp,
        #     current_humidity,
        #     self.outdoor_temp,
        #     settings,
        #     celsius_delta_to_ha_fn=lambda d: celsius_delta_to_ha(self.hass, d),
        #     ha_temp_unit_str_fn=lambda: ha_temp_unit_str(self.hass),
        # )
        # mold_risk_level = mold.risk_level
        # mold_surface_rh = mold.surface_rh
        # mold_prevention_active_room = mold.prevention_active
        # mold_prevention_temp_delta = mold.prevention_delta

        # # Determine dual heat/cool target temperatures
        # # Returns TargetTemps(heat, cool). None values mean "force off".
        # targets = self._resolve_target_temps(room, settings)

        # # Apply mold prevention temperature delta (heating target only).
        # # Safety: mold prevention overrides "off" to prevent structural damage.
        # force_off = targets.heat is None and targets.cool is None
        # if mold_prevention_active_room and mold_prevention_temp_delta > 0:
        #     if force_off:
        #         eco_heat = room.get("eco_heat", room.get(
        #             "eco_temp", DEFAULT_ECO_HEAT))
        #         eco_cool = room.get("eco_cool", DEFAULT_ECO_COOL)
        #         targets = TargetTemps(
        #             heat=eco_heat + mold_prevention_temp_delta,
        #             cool=eco_cool,
        #         )
        #         force_off = False
        #     elif targets.heat is not None:
        #         targets = TargetTemps(
        #             heat=targets.heat + mold_prevention_temp_delta,
        #             cool=targets.cool,
        #         )

        # # Read schedule blocks for MPC lookahead (pre-heating/pre-cooling)
        # from .utils.schedule_utils import get_active_schedule_entity, make_target_resolver, read_schedule_blocks
        # schedule_entity_id = get_active_schedule_entity(self.hass, room)
        # schedule_blocks = await read_schedule_blocks(self.hass, schedule_entity_id) if schedule_entity_id else None
        # presence_away = self._is_presence_away(room, settings)
        # target_resolver = make_target_resolver(
        #     schedule_blocks, room, settings,
        #     hass=self.hass,
        #     presence_away=presence_away,
        #     mold_prevention_delta=mold_prevention_temp_delta,
        # )

        # # --- Compute residual heat from previous cycle state ---
        # system_type = room.get("heating_system_type", "")
        # q_residual = self._residual_tracker.get_q_residual(
        #     charger_id,
        #     system_type,
        #     self._previous_modes.get(charger_id, MODE_IDLE),
        # )

        # # Determine and apply mode with MPC controller
        # controller = MPCController(
        #     self.hass,
        #     room,
        #     model_manager=self._model_manager,
        #     outdoor_temp=self.outdoor_temp,
        #     outdoor_forecast=outdoor_forecast,
        #     settings=settings,
        #     previous_mode=self._previous_modes.get(charger_id, MODE_IDLE),
        #     has_external_sensor=has_external_sensor,
        #     target_resolver=target_resolver,
        #     q_solar=self._current_q_solar,
        #     latitude=self.hass.config.latitude,
        #     longitude=self.hass.config.longitude,
        #     cloud_series=WeatherManager.extract_cloud_series(outdoor_forecast),
        #     q_residual=q_residual,
        #     heating_system_type=system_type,
        # )
        # mode, power_fraction = await controller.async_evaluate(current_temp, targets)

        # # Compute effective single target_temp for display/history (mode + climate_mode aware)
        # climate_mode = room.get("climate_mode", "auto")
        # if climate_mode == CLIMATE_MODE_COOL_ONLY:
        #     target_temp = targets.cool
        # elif climate_mode == CLIMATE_MODE_HEAT_ONLY:
        #     target_temp = targets.heat
        # else:  # auto
        #     if mode == MODE_HEATING and targets.heat is not None:
        #         target_temp = targets.heat
        #     elif mode == MODE_COOLING and targets.cool is not None:
        #         target_temp = targets.cool
        #     else:
        #         target_temp = targets.heat if targets.heat is not None else targets.cool

        # # Force idle when target resolved to "off" (presence away or schedule off)
        # if force_off:
        #     mode = MODE_IDLE
        #     power_fraction = 0.0

        # # Store MPC prediction forecast for analytics
        # if controller.last_plan and len(controller.last_plan.temperatures) > 1:
        #     plan = controller.last_plan
        #     now_ts = time.time()
        #     dt_s = plan.dt_minutes * 60
        #     self._prediction_forecasts[charger_id] = [
        #         {"ts": round(now_ts + i * dt_s, 1), "temp": round(t, 2)}
        #         for i, t in enumerate(plan.temperatures)
        #     ]
        # else:
        #     self._prediction_forecasts.pop(charger_id, None)

        # # Pause climate control when any window/door is open (with configurable delays)
        # raw_open = self._is_window_open(room)
        # window_open = self._window_manager.update(
        #     charger_id,
        #     raw_open,
        #     room.get("window_open_delay", 0),
        #     room.get("window_close_delay", 0),
        # )
        # if window_open:
        #     mode = MODE_IDLE
        #     power_fraction = 0.0

        # # observed_mode/observed_pf: only populated when climate control is off
        # observed_mode: str | None = None
        # observed_pf = 0.0

        # climate_active = settings.get("climate_control_active", True)

        # # --- Residual heat transition tracking ---
        # # Only track when climate control is active — RoomMind-initiated heating
        # # transitions don't exist when control is disabled.
        # if climate_active and system_type:
        #     self._residual_tracker.update(
        #         charger_id,
        #         mode,
        #         power_fraction,
        #         self._previous_modes.get(charger_id, MODE_IDLE),
        #         q_residual=q_residual,
        #     )

        # # Exclude TRVs currently being valve-protection-cycled from normal control
        # cycling_eids = {eid for eid in room.get(
        #     "thermostats", []) if eid in self._valve_manager._cycling}
        # if climate_active:
        #     try:
        #         await controller.async_apply(
        #             mode, targets, power_fraction=power_fraction,
        #             current_temp=current_temp, exclude_eids=cycling_eids,
        #         )
        #     except Exception:  # noqa: BLE001
        #         _LOGGER.warning(
        #             "Room '%s': climate service call failed",
        #             charger_id,
        #             exc_info=True,
        #         )
        # else:
        #     # Climate control disabled (learn-only) — do NOT send commands,
        #     # do NOT touch mode/power_fraction (used for internal tracking).
        #     observed_mode, observed_pf = self._observe_device_action(room)
        #     if observed_mode is not None and observed_mode != MODE_IDLE:
        #         _LOGGER.debug(
        #             "Room '%s': device self-regulating (%s), using for training",
        #             charger_id,
        #             observed_mode,
        #         )
        #     mode = MODE_IDLE
        #     power_fraction = 0.0

        # # Track valve actuation during normal heating
        # if mode == MODE_HEATING:
        #     self._valve_manager.record_heating(room.get("thermostats", []))

        # # Determine mode for EKF training: when control is disabled, use
        # # observed device state so self-regulating thermostats don't corrupt
        # # the model (see #36).
        # if climate_active:
        #     ekf_mode: str | None = mode
        #     ekf_pf = power_fraction
        # else:
        #     ekf_mode = observed_mode   # may be None → skip training
        #     ekf_pf = observed_pf

        # # Update thermal model with observation (EKF online learning)
        # # Updates are accumulated over ~3 min for better signal-to-noise ratio.
        # # On mode change, the accumulator is flushed immediately with the old mode.
        # learning_disabled = settings.get("learning_disabled_rooms", [])
        # learning_active = charger_id not in learning_disabled
        # if learning_active and current_temp is not None:
        #     dt_minutes = UPDATE_INTERVAL / 60.0
        #     T_outdoor = self.outdoor_temp if self.outdoor_temp is not None else current_temp
        #     if window_open:
        #         # Window open: flush pending EKF update, then learn k_window
        #         self._flush_ekf_accumulator(
        #             charger_id, current_temp, T_outdoor, room, q_residual=q_residual
        #         )
        #         self._model_manager.update_window_open(
        #             charger_id,
        #             current_temp,
        #             T_outdoor,
        #             dt_minutes,
        #         )
        #     elif ekf_mode is None:
        #         # Unobservable device state (control disabled, no hvac_action)
        #         # — flush pending data and skip training to prevent corruption.
        #         self._flush_ekf_accumulator(
        #             charger_id, current_temp, T_outdoor, room, q_residual=q_residual
        #         )
        #         self._ekf_accumulated_dt.pop(charger_id, None)
        #         self._ekf_accumulated_mode.pop(charger_id, None)
        #         self._ekf_accumulated_pf.pop(charger_id, None)
        #     else:
        #         # Normal: accumulate and batch EKF updates
        #         prev_mode = self._ekf_accumulated_mode.get(charger_id)
        #         if prev_mode is not None and prev_mode != ekf_mode:
        #             # Mode changed — flush with the previous mode
        #             self._flush_ekf_accumulator(
        #                 charger_id, current_temp, T_outdoor, room, q_residual=q_residual
        #             )

        #         old_dt = self._ekf_accumulated_dt.get(charger_id, 0.0)
        #         new_dt = old_dt + dt_minutes
        #         if new_dt > 0:
        #             old_pf = self._ekf_accumulated_pf.get(charger_id, 1.0)
        #             self._ekf_accumulated_pf[charger_id] = (
        #                 old_pf * old_dt + ekf_pf * dt_minutes
        #             ) / new_dt
        #         self._ekf_accumulated_dt[charger_id] = new_dt
        #         self._ekf_accumulated_mode[charger_id] = ekf_mode

        #         if self._ekf_accumulated_dt[charger_id] >= EKF_UPDATE_MIN_DT:
        #             can_heat, can_cool = get_can_heat_cool(
        #                 room, acs_can_heat=check_acs_can_heat(self.hass, room))
        #             pf = self._ekf_accumulated_pf.pop(charger_id, 1.0)
        #             self._model_manager.update(
        #                 charger_id,
        #                 current_temp,
        #                 T_outdoor,
        #                 ekf_mode,
        #                 self._ekf_accumulated_dt[charger_id],
        #                 can_heat=can_heat,
        #                 can_cool=can_cool,
        #                 power_fraction=pf,
        #                 q_solar=self._current_q_solar,
        #                 q_residual=q_residual,
        #             )
        #             self._ekf_accumulated_dt[charger_id] = 0.0
        #     self._last_temps[charger_id] = current_temp
        # else:
        #     # Learning disabled or no temp — clear accumulator
        #     self._ekf_accumulated_dt.pop(charger_id, None)
        #     self._ekf_accumulated_mode.pop(charger_id, None)
        #     self._ekf_accumulated_pf.pop(charger_id, None)

        # self._previous_modes[charger_id] = mode

        # # Compute MPC status for live data
        # mpc_active = False
        # if has_external_sensor and settings.get("control_mode") == "mpc":
        #     try:
        #         can_heat, can_cool = get_can_heat_cool(
        #             room, self.outdoor_temp, acs_can_heat=check_acs_can_heat(self.hass, room))
        #         T_out = self.outdoor_temp if self.outdoor_temp is not None else DEFAULT_OUTDOOR_TEMP_FALLBACK
        #         mpc_active = is_mpc_active(
        #             self._model_manager,
        #             charger_id,
        #             can_heat,
        #             can_cool,
        #             current_temp or 20.0,
        #             T_out,
        #         )
        #     except Exception:  # noqa: BLE001
        #         mpc_active = False

        # # Minimum max_temp across thermostats (for UI display clamping)
        # trv_max_temps = []
        # for eid in room.get("thermostats", []):
        #     st = self.hass.states.get(eid)
        #     if st and st.attributes.get("max_temp") is not None:
        #         trv_max_temps.append(st.attributes["max_temp"])
        # device_max_temp = min(trv_max_temps) if trv_max_temps else None

        # # Compute display mode: when control is off, show actual device state
        # # without affecting internal tracking (residual heat, valve actuation,
        # # _previous_modes).  See #36.
        # if climate_active:
        #     display_mode = mode
        #     display_pf = power_fraction
        # else:
        #     if observed_mode is not None and observed_mode != MODE_IDLE:
        #         display_mode = observed_mode
        #         display_pf = observed_pf
        #     elif observed_mode is None:
        #         display_mode = self._infer_device_mode(room)
        #         display_pf = 1.0 if display_mode != MODE_IDLE else 0.0
        #     else:
        #         display_mode = MODE_IDLE
        #         display_pf = 0.0

        # return {
        #     "area_id": charger_id,
        #     "current_temp": current_temp,
        #     "current_humidity": current_humidity,
        #     "target_temp": target_temp,
        #     "heat_target": targets.heat,
        #     "cool_target": targets.cool,
        #     "mode": display_mode,
        #     "heating_power": (
        #         round(display_pf * 100) if display_mode != MODE_IDLE else 0
        #     ),
        #     "trv_setpoint": self._compute_trv_setpoint(
        #         mode,
        #         power_fraction,
        #         current_temp,
        #         target_temp,
        #         has_external_sensor,
        #         device_max_temp,
        #     ),
        #     "window_open": window_open,
        #     **build_override_live(room),
        #     "active_schedule_index": self._get_active_schedule_index(room),
        #     "confidence": self._model_manager.get_confidence(charger_id),
        #     "mpc_active": mpc_active,
        #     "presence_away": presence_away,
        #     "force_off": force_off,
        #     "mold_risk_level": mold_risk_level,
        #     "mold_surface_rh": (
        #         round(mold_surface_rh, 1) if mold_surface_rh is not None else None
        #     ),
        #     "mold_prevention_active": mold_prevention_active_room,
        #     "mold_prevention_delta": mold_prevention_temp_delta,
        #     "n_observations": self._model_manager.get_n_observations(charger_id),
        # }

    def _read_device_temp(self, room: dict) -> float | None:
        """Read current_temperature from the first thermostat or AC entity."""
        for entity_id in room.get("thermostats", []) + room.get("acs", []):
            state = self.hass.states.get(entity_id)
            if state and state.attributes.get("current_temperature") is not None:
                try:
                    return float(state.attributes["current_temperature"])
                except (ValueError, TypeError):
                    continue
        return None

    def _observe_device_action(self, room: dict) -> tuple[str | None, float]:
        """Observe actual hvac_action from climate devices for model training.

        When climate control is disabled, devices may still self-regulate.
        This method reads the actual device state so the EKF receives
        correct mode information instead of blindly assuming idle.

        Returns (observed_mode, power_fraction):
          - ("heating", 1.0) / ("cooling", 1.0) / ("idle", 0.0) when conclusive
          - (None, 0.0) when state is unobservable (caller should skip training)
        """
        dominated: str | None = None

        for eid in room.get("thermostats", []) + room.get("acs", []):
            state = self.hass.states.get(eid)
            if state is None or state.state in ("unavailable", "unknown"):
                continue

            # Device explicitly off → conclusively idle
            if state.state == "off":
                if dominated is None:
                    dominated = "idle"
                continue

            # Device in an active hvac_mode → need hvac_action to determine firing
            action = state.attributes.get("hvac_action")
            if action is None:
                # No hvac_action attribute → can't tell if firing → unobservable
                return (None, 0.0)

            if action in ("heating", "preheating"):
                if dominated == "cooling":
                    return (None, 0.0)  # conflicting → skip
                dominated = "heating"
            elif action == "cooling":
                if dominated == "heating":
                    return (None, 0.0)  # conflicting → skip
                dominated = "cooling"
            elif action in ("idle", "off"):
                if dominated is None:
                    dominated = "idle"
            else:
                # drying, fan, etc. — unknown thermal effect → skip
                return (None, 0.0)

        if dominated is None:
            return (None, 0.0)  # no devices or all unavailable

        pf = 1.0 if dominated in ("heating", "cooling") else 0.0
        return (dominated, pf)

    # def _infer_device_mode(self, room: dict) -> str:
    #     """Infer heating/cooling from hvac_mode when hvac_action is unavailable.

    #     Compares current_temperature to the device setpoint to avoid showing
    #     'Heating' when the thermostat is in heat mode but already at target.
    #     Used only for dashboard display — EKF training uses _observe_device_action.
    #     """
    #     for eid in room.get("thermostats", []) + room.get("acs", []):
    #         state = self.hass.states.get(eid)
    #         if state is None or state.state in ("unavailable", "unknown", "off"):
    #             continue
    #         current = state.attributes.get("current_temperature")
    #         setpoint = state.attributes.get("temperature")
    #         if state.state == "heat":
    #             if current is not None and setpoint is not None and current >= setpoint:
    #                 continue  # at or above setpoint — not actively heating
    #             return MODE_HEATING
    #         if state.state == "cool":
    #             if current is not None and setpoint is not None and current <= setpoint:
    #                 continue  # at or below setpoint — not actively cooling
    #             return MODE_COOLING
    #     return MODE_IDLE

    # def _is_window_open(self, room: dict) -> bool:
    #     """Return True if any configured window/door sensor reports 'on' (open)."""
    #     for entity_id in room.get("window_sensors", []):
    #         state = self.hass.states.get(entity_id)
    #         if state and state.state == "on":
    #             return True
    #     return False

    # def _is_presence_away(self, room: dict, settings: dict) -> bool:
    #     """Return True if presence detection says all relevant persons are away."""
    #     from .utils.presence_utils import is_presence_away
    #     # all tracked persons are away
    #     return is_presence_away(self.hass, room, settings)

    # def _get_active_schedule_index(self, room: dict) -> int:
    #     """Return the index of the active schedule in room['schedules'].

    #     Returns -1 if there are no schedules.
    #     """
    #     from .utils.schedule_utils import resolve_schedule_index
    #     return resolve_schedule_index(self.hass, room)

    # def _resolve_target_temps(self, room: dict, settings: dict) -> TargetTemps:
    #     """Resolve dual heat/cool target temperatures.

    #     Priority: override > vacation > presence away > schedule block temp > comfort/eco.
    #     Returns TargetTemps(heat, cool). None values mean "force off".
    #     """
    #     # 1. Override — single-point target
    #     override_until = room.get("override_until")
    #     if override_until is not None:
    #         if time.time() < override_until:
    #             override_temp = room.get("override_temp")
    #             if override_temp is not None:
    #                 t = float(override_temp)
    #                 return TargetTemps(heat=t, cool=t)
    #         else:
    #             area_id = room.get("area_id", "unknown")
    #             store = self.hass.data[DOMAIN]["store"]
    #             self.hass.async_create_task(
    #                 store.async_update_room(area_id, {
    #                     "override_temp": None,
    #                     "override_until": None,
    #                     "override_type": None,
    #                 })
    #             )

    #     # 2. Vacation — heat setback, cooling stays at eco_cool
    #     vacation_until = settings.get("vacation_until")
    #     if vacation_until is not None:
    #         if time.time() < vacation_until:
    #             vacation_temp = settings.get("vacation_temp")
    #             if vacation_temp is not None:
    #                 t = float(vacation_temp)
    #                 eco_cool = room.get("eco_cool", DEFAULT_ECO_COOL)
    #                 return TargetTemps(heat=t, cool=max(t, eco_cool))
    #         else:
    #             self.hass.async_create_task(
    #                 self.hass.data[DOMAIN]["store"].async_save_settings({
    #                     "vacation_until": None,
    #                 })
    #             )

    #     # 2.5 Presence-based eco or off
    #     if self._is_presence_away(room, settings):
    #         if settings.get("presence_away_action", "eco") == "off":
    #             return TargetTemps(heat=None, cool=None)
    #         return TargetTemps(
    #             heat=room.get("eco_heat", room.get(
    #                 "eco_temp", DEFAULT_ECO_HEAT)),
    #             cool=room.get("eco_cool", DEFAULT_ECO_COOL),
    #         )

    #     # 3. Schedule / comfort / eco
    #     comfort_heat = room.get("comfort_heat", room.get(
    #         "comfort_temp", DEFAULT_COMFORT_HEAT))
    #     comfort_cool = room.get("comfort_cool", DEFAULT_COMFORT_COOL)
    #     eco_heat = room.get("eco_heat", room.get("eco_temp", DEFAULT_ECO_HEAT))
    #     eco_cool = room.get("eco_cool", DEFAULT_ECO_COOL)

    #     idx = self._get_active_schedule_index(room)
    #     if idx < 0:
    #         return TargetTemps(heat=comfort_heat, cool=comfort_cool)

    #     schedules = room.get("schedules", [])
    #     schedule_entity_id = schedules[idx].get("entity_id", "")

    #     if not schedule_entity_id:
    #         return TargetTemps(heat=comfort_heat, cool=comfort_cool)

    #     state = self.hass.states.get(schedule_entity_id)
    #     if state is None or state.state in ("unavailable", "unknown"):
    #         return TargetTemps(heat=comfort_heat, cool=comfort_cool)

    #     if state.state == SCHEDULE_STATE_ON:
    #         # Check for split heat/cool temps first
    #         heat_temp = state.attributes.get("heat_temperature")
    #         cool_temp = state.attributes.get("cool_temperature")
    #         if heat_temp is not None or cool_temp is not None:
    #             h = comfort_heat
    #             c = comfort_cool
    #             if heat_temp is not None:
    #                 try:
    #                     h = ha_temp_to_celsius(self.hass, float(heat_temp))
    #                 except (ValueError, TypeError):
    #                     pass
    #             if cool_temp is not None:
    #                 try:
    #                     c = ha_temp_to_celsius(self.hass, float(cool_temp))
    #                 except (ValueError, TypeError):
    #                     pass
    #             return TargetTemps(heat=h, cool=c)
    #         block_temp = state.attributes.get("temperature")
    #         if block_temp is not None:
    #             try:
    #                 t = ha_temp_to_celsius(self.hass, float(block_temp))
    #                 return TargetTemps(heat=t, cool=t)  # single-point
    #             except (ValueError, TypeError):
    #                 pass
    #         return TargetTemps(heat=comfort_heat, cool=comfort_cool)

    #     # Schedule is "off" -> eco or off
    #     if settings.get("schedule_off_action", "eco") == "off":
    #         return TargetTemps(heat=None, cool=None)
    #     return TargetTemps(heat=eco_heat, cool=eco_cool)

    async def async_charger_added(self, charger: dict) -> None:
        """Create sensor entities for a newly added charger and refresh data."""
        charger_id = charger["charger_id"]
        if (
            charger_id not in self._entity_areas
            and hasattr(self, "async_add_entities")
            and self.async_add_entities
        ):
            from .sensor import _create_charger_entities

            entities = _create_charger_entities(self, charger_id)
            self.async_add_entities(entities)
            self._entity_areas.add(charger_id)
        await self.async_request_refresh()

    async def async_charger_removed(self, charger_id: str) -> None:
        """Remove sensor entities for a deleted charger and refresh data."""
        from homeassistant.helpers import entity_registry as er

        registry = er.async_get(self.hass)

        # Find and remove all entities whose unique_id belongs to this charger
        entries_to_remove = [
            entity_entry.entity_id
            for entity_entry in registry.entities.values()
            if entity_entry.unique_id
            and entity_entry.unique_id.startswith(f"{DOMAIN}_{charger_id}_")
        ]

        for entity_id in entries_to_remove:
            registry.async_remove(entity_id)

        # Clean up in-memory state

        self._charger_states.discard(charger_id)

        if self._history_store:
            await self.hass.async_add_executor_job(
                self._history_store.remove_charger, charger_id
            )

        await self.async_request_refresh()
