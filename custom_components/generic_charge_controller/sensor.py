"""Support for MQTT sensors."""
from __future__ import annotations
import logging

from .coordinator import (
    ChargeControllerCoordinator,
)
from .store import ChargeControllerStore

from .abstract_charger import AbstractCharger
from .easee.charger import EaseeCharger
import voluptuous as vol

from homeassistant.components import sensor
from homeassistant.components.sensor import PLATFORM_SCHEMA, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_NAME,
    CONF_UNIQUE_ID,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_OFF,
    UnitOfTemperature,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.components.sensor import SensorStateClass
from homeassistant.exceptions import HomeAssistantError, PlatformNotReady
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.device_registry import async_get as async_get_dev_reg
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.entity_registry import async_get as async_get_entity_reg
from homeassistant.helpers.event import (
    async_track_time_interval,
    async_track_state_change,
)
from homeassistant.helpers.update_coordinator import CoordinatorEntity


from .loadbalancer.calculator import Calculator
from .const import (
    CONF_CHRG_DOMAIN,
    CONF_CHRG_ID,
    CONF_ENTITYID_CURR_L1,
    CONF_ENTITYID_CURR_L2,
    CONF_ENTITYID_CURR_L3,
    CONF_RATED_CURRENT,
    DOMAIN,
    PHASE1,
    PHASE2,
    PHASE3,
    ATTR_LIMIT_Px,
)
from .exceptions import NoSensorsError


class _ChargeControllerBaseSensor(CoordinatorEntity, SensorEntity):
    """Base class for all ChargeController sensors."""

    _attr_has_entity_name = True
    _data_key: str  # Key in the charger state dict (e.g. "current_temp")

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        charger_id: str,
        suffix: str,
        name_label: str,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._charger_id = charger_id
        self._attr_unique_id = f"{DOMAIN}_{charger_id}_{suffix}"
        self._attr_name = f"{charger_id} {name_label}"
        self.entity_id = f"sensor.{DOMAIN}_{charger_id}_{suffix}"

    @property
    def native_value(self) -> float | str | None:
        """Return the sensor value from the coordinator data."""
        charger = self.coordinator.data.get("chargers", {}).get(self._charger_id)
        if charger:
            return charger.get(self._data_key)
        return None


class ChargeControllerTargetCurrentsSensor(_ChargeControllerBaseSensor):
    """Sensor showing the target current for a ChargeController charger phase."""

    def __init__(
        self, coordinator: ChargeControllerCoordinator, charger_id: str, phase_id: str
    ) -> None:
        self._data_key = f"target_current_{phase_id}"
        super().__init__(
            coordinator,
            charger_id,
            f"target_current_{phase_id}",
            f"Target Current {phase_id}",
        )


class ChargeControllerModeSensor(_ChargeControllerBaseSensor):
    """Sensor showing the current mode for a ChargeController charger."""

    _data_key = "mode"

    def __init__(
        self, coordinator: ChargeControllerCoordinator, charger_id: str
    ) -> None:
        super().__init__(coordinator, charger_id, self._data_key, "Mode")

    @property
    def native_value(self) -> str | None:
        """Return the current mode, defaulting to 'idle'."""
        charger = self.coordinator.data.get("chargers", {}).get(self._charger_id)
        if charger:
            return charger.get("mode", "idle")
        return "idle"


DEFAULT_SAMPLE_INTERVAL_SEC = 5

_LOGGER = logging.getLogger(__name__)


def _create_charger_entities(
    coordinator: ChargeControllerCoordinator, charger_id: str
) -> list[SensorEntity]:
    """Create the standard set of sensor entities for a charger."""
    return [
        ChargeControllerTargetCurrentsSensor(coordinator, charger_id, PHASE1),
        ChargeControllerTargetCurrentsSensor(coordinator, charger_id, PHASE2),
        ChargeControllerTargetCurrentsSensor(coordinator, charger_id, PHASE3),
        ChargeControllerModeSensor(coordinator, charger_id),
    ]


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the charger sensor(s) from a config entry."""

    _LOGGER.debug("Setting up sensor platform for entry %s", entry.entry_id)

    coordinator: ChargeControllerCoordinator = hass.data[DOMAIN][entry.entry_id]

    _LOGGER.debug("Got coordinator for entry %s: %s", entry.entry_id, coordinator)

    store: ChargeControllerStore = hass.data[DOMAIN]["store"]

    _LOGGER.debug("Got store for entry %s: %s", entry.entry_id, store)

    coordinator.async_add_entities = async_add_entities

    chargers = store.get_chargers()

    _LOGGER.debug("Got chargers for entry %s: %s", entry.entry_id, chargers)

    entities: list[SensorEntity] = []

    for charger_id in chargers:
        entities.extend(_create_charger_entities(coordinator, charger_id))
        coordinator._charger_sensors.add(charger_id)

    if entities:
        async_add_entities(entities)

    _LOGGER.info(
        "Sensor platform setup complete for entry %s with %d entities",
        entry.entry_id,
        len(entities),
    )

# class ElectricalPhase:
#     """Holds data for each phase"""

#     def __init__(self, phase: str, entity_id: str, target_current: float) -> None:
#         self._phase = phase
#         self._entity_id = entity_id
#         self._target_current = target_current
#         self._samples = collections.deque(
#             [], 60
#         )  # 60 x 5 seconds => 5 minutes of samples

#     @property
#     def phase_id(self):
#         """Phase ID"""
#         return self._phase

#     @property
#     def entity_id(self):
#         """Entity ID"""
#         return self._entity_id

#     @property
#     def target_current(self):
#         """Target current on the phase"""
#         return self._target_current

#     @property
#     def samples(self) -> collections.deque:
#         """Samples"""
#         return self._samples

#     def add_sample(self, measurement: float) -> None:
#         self._samples.append(measurement)

#     def update_target(self, new_target_current: float) -> None:
#         """Sets the target current on the phase"""
#         _LOGGER.debug(
#             "Update target current on phase %s to %s", self._phase, new_target_current
#         )
#         self._target_current = new_target_current


# class ChargeControllerSensor(SensorEntity):
#     """Representation of a Sensor."""

#     def __init__(
#         self,
#         hass,
#         name,
#         unique_id,
#         phases: dict[str, ElectricalPhase],
#         charger: AbstractCharger,
#     ) -> None:
#         """Initialize the controller."""
#         try:
#             self._attr_name = name
#             self._attr_unique_id = unique_id
#             self.hass = hass  # hass
#             self._phases: dict[str, ElectricalPhase] = phases

#             # self.state_class = SensorStateClass.MEASUREMENT
#             self._attr_native_value = STATE_OFF

#             self._charger = charger

#             # 6 samples, 5 seconds sampling -> 30 seconds mean calc

#             self._attr_icon = "mdi:car-speed-limiter"

#             _LOGGER.debug("Succesfully initialized sensor")
#         except Exception as err:
#             raise PlatformNotReady from err

#     async def async_added_to_hass(self) -> None:
#         """Run when entity about to be added to hass."""
#         await super().async_added_to_hass()
#         self.async_on_remove(
#             async_track_time_interval(
#                 self.hass,
#                 self._async_update,
#                 timedelta(seconds=DEFAULT_SAMPLE_INTERVAL_SEC),
#             )
#         )

#     async def _do_balancing(self, now=None):
#         await self._charger.update_limits(
#             dict(map(lambda kv: (kv[0], kv[1].target_current), self._phases.items()))
#         )

#     async def _async_update(self, now=None):
#         self._update_phase_currents()
#         if self._attr_native_value == STATE_UNAVAILABLE:
#             raise PlatformNotReady("Sensors unavailable, cannot do load balancing")

#         if self._charger.charging:
#             _LOGGER.debug("Charging detected, balancing")
#             self._set_state(STATE_ON)
#             await self._do_balancing()
#         else:
#             _LOGGER.debug("No charging detected")
#             self._set_state(STATE_OFF)

#     def _has_valid_value(self, entity_state) -> bool:
#         return entity_state and entity_state.state is not STATE_UNAVAILABLE

#     def _update_phase_currents(self):
#         """Update local phase currents from source sensors."""
#         calculator = Calculator(_LOGGER, self._charger.rated_current)
#         charger_currents = self._charger.phase_currents

#         # if not self._charger_power:
#         #     raise HomeAssistantError("Charger power not available")

#         if not self._phases:
#             raise NoSensorsError("Phase sensor(s) not available")

#         for phase_data in self._phases.values():
#             state = self.hass.states.get(phase_data.entity_id)

#             _LOGGER.debug(state.as_dict())
#             if not state or state.state == STATE_UNAVAILABLE:
#                 self._set_state(STATE_UNAVAILABLE)
#                 return

#             phase_data.add_sample(
#                 float(state.state) - charger_currents[phase_data.phase_id]
#             )

#             new_target = calculator.calculate_target_with_filter(phase_data)
#             _LOGGER.debug("Running mean: %s", new_target)

#             if phase_data.target_current != new_target:
#                 _LOGGER.debug(
#                     "New target current on %s, %s -> %s",
#                     phase_data.phase_id,
#                     phase_data.target_current,
#                     new_target,
#                 )
#                 phase_data.update_target(new_target)
#         self._set_state(STATE_OFF)

#     @property
#     def extra_state_attributes(self):
#         """Return the attributes of the entity."""
#         attributes = {}

#         for phase in (PHASE1, PHASE2, PHASE3):
#             if value := self._phases.get(phase):
#                 attributes[ATTR_LIMIT_Px % phase] = value.target_current
#             else:
#                 attributes[ATTR_LIMIT_Px % phase] = None

#         attributes["Current charger power (A)"] = 0
#         return attributes

#     @callback
#     def _set_state(self, state):
#         """Setting sensor to given state."""
#         self._attr_native_value = state
#         self.async_write_ha_state()

#     @property
#     def rated_current(self):
#         """Rated current"""
#         return self._rated_current
