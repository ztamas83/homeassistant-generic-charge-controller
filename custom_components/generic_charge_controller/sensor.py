"""Support for MQTT sensors."""
from __future__ import annotations

import collections
from datetime import timedelta
import logging

import voluptuous as vol

from homeassistant.components import sensor
from homeassistant.components.sensor import PLATFORM_SCHEMA, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME, CONF_UNIQUE_ID, STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.entity_registry import async_get as async_get_entity_reg
from homeassistant.helpers.device_registry import async_get as async_get_dev_reg
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
)

from .exceptions import NoSensorsError
from .calculator import Calculator
from .const import (
    DATA_HASS_CONFIG,
    CONF_RATED_CURRENT,
    CONF_ACC_MAX_PRICE_CENTS,
    CONF_ENTITYID_CURR_P1,
    CONF_ENTITYID_CURR_P2,
    CONF_ENTITYID_CURR_P3,
    ATTR_LIMIT_Px,
    PHASE1,
    PHASE2,
    PHASE3,
)
from uuid import uuid4

# CONF_ENTITYID_CHARGER = "charger_entity"

DEFAULT_SAMPLE_INTERVAL_SEC = 5

# PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
#     {
#         vol.Required(CONF_NAME): cv.string,
#         vol.Required(CONF_RATED_CURRENT): cv.positive_int,
#         vol.Optional(CONF_ACC_MAX_PRICE_CENTS): cv.positive_int,
#         # vol.Required(CONF_ENTITYID_POWER_NOW): cv.entity_id,
#         vol.Required(CONF_ENTITYID_CURR_P1): cv.entity_id,
#         vol.Optional(CONF_ENTITYID_CURR_P2): cv.entity_id,
#         vol.Optional(CONF_ENTITYID_CURR_P3): cv.entity_id,
#         vol.Optional(CONF_UNIQUE_ID): cv.string,
#     }
# )

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the charger sensor(s)"""

    entity_registry = async_get_entity_reg(hass)
    device_registry = async_get_dev_reg(hass)

    _LOGGER.warning("Setup request")
    name = "ChargeController"
    phasecontrollers = {
        PHASE1: PhaseController(PHASE1, entry.data.get(CONF_ENTITYID_CURR_P1), None)
    }

    if p2_entity := entry.data.get(CONF_ENTITYID_CURR_P2):
        phasecontrollers[PHASE2] = PhaseController(PHASE2, p2_entity, None)

    if p3_entity := entry.data.get(CONF_ENTITYID_CURR_P3):
        phasecontrollers[PHASE3] = PhaseController(PHASE3, p3_entity, None)

    rated_current = entry.data.get(CONF_RATED_CURRENT)
    # charger_power = config.get(CONF_ENTITYID_POWER_NOW)

    async_add_entities(
        [
            ChargeControllerSensor(
                hass, name, phasecontrollers, None, rated_current, uuid4().hex
            )
        ]
    )


class PhaseController:
    """Holds data for each phase"""

    def __init__(self, phase: str, entity_id: str, target_current: float) -> None:
        self._phase = phase
        self._entity_id = entity_id
        self._target_current = target_current
        self._samples = collections.deque(
            [], 60
        )  # 60 x 5 seconds => 5 minutes of samples

    @property
    def entity_id(self):
        """Entity ID"""
        return self._entity_id

    @property
    def target_current(self):
        """Target current on the phase"""
        return self._target_current

    @property
    def samples(self) -> collections.deque:
        """Samples"""
        return self._samples

    def add_sample(self, measurement: float) -> None:
        self._samples.append(measurement)

    def update_target(self, new_target_current: float) -> None:
        """Sets the target current on the phase"""
        _LOGGER.debug(
            "Update target current on phase %s to %s", self._phase, new_target_current
        )
        self._target_current = new_target_current


class ChargeControllerSensor(SensorEntity):
    """Representation of a Sensor."""

    def __init__(
        self,
        hass,
        name,
        phasecontrollers: dict[str, PhaseController],
        charger_power_entity,
        rated_current=0,
        unique_id="ChargeController",
    ):
        """Initialize the controller."""
        self.hass = hass
        self._name = name
        self._phasecontrollers: dict[str, PhaseController] = phasecontrollers
        self._rated_current = rated_current
        self._charger_power_entity = charger_power_entity
        self._charger_power = None
        self._calculator = Calculator(_LOGGER, rated_current)
        self._unique_id = unique_id
        self._state = STATE_UNAVAILABLE

        # 6 samples, 5 seconds sampling -> 30 seconds mean calc

        self._icon = "mdi:car-speed-limiter"

        async_track_time_interval(
            hass, self._async_update, timedelta(seconds=DEFAULT_SAMPLE_INTERVAL_SEC)
        )

        _LOGGER.debug("Succesfully initialized sensor")

    @callback
    async def _async_update(self, now=None):
        try:
            self._update_charger_power()
            self._update_phase_currents()
        except NoSensorsError as err:
            raise HomeAssistantError from err

    def _update_charger_power(self):
        """Updates the charger power value locally"""
        # charger_power_state = self.hass.states.get(self._charger_power_entity)
        # if not self._has_valid_value(charger_power_state):
        #     raise HomeAssistantError

        # self._charger_power = float(charger_power_state.state)

    def _has_valid_value(self, entity_state) -> bool:
        return entity_state and entity_state.state is not STATE_UNAVAILABLE

    def _update_phase_currents(self):
        """Update local phase currents from source sensors."""

        # if not self._charger_power:
        #     raise HomeAssistantError("Charger power not available")

        if not self._phasecontrollers:
            raise NoSensorsError("Phase sensor(s) not available")

        for phase in self._phasecontrollers:
            phase_controller = self._phasecontrollers[phase]
            state = self.hass.states.get(phase_controller.entity_id)

            _LOGGER.debug(state)
            if not state or state.state == STATE_UNAVAILABLE:
                self._set_state(STATE_UNAVAILABLE)
                return

            phase_controller.add_sample(float(state.state))

            new_target = self._calculator.calculate_target_current(
                phase_controller.samples[-1],
            )

            test_target = self._calculator.calculate_target_with_filter(
                phase_controller
            )
            _LOGGER.debug("Simple: %s Running mean: %s", new_target, test_target)
            if phase_controller.target_current != new_target:
                _LOGGER.debug(
                    "New target current on %s, %s -> %s",
                    phase,
                    phase_controller.target_current,
                    new_target,
                )
                phase_controller.update_target(new_target)

        self._set_state(STATE_ON)

    @property
    def name(self):
        """Return the name of the sensor."""
        return self._name

    @property
    def icon(self):
        """Icon to use in the frontend, if any."""
        return self._icon

    @property
    def state(self):
        """Return the state of the device."""
        return self._state

    @property
    def state_attributes(self):
        """Return the attributes of the entity."""
        attributes = {}

        for phase in (PHASE1, PHASE2, PHASE3):
            if value := self._phasecontrollers.get(phase):
                attributes[ATTR_LIMIT_Px % phase] = value.target_current
            else:
                attributes[ATTR_LIMIT_Px % phase] = None

        attributes["Current charger power (A)"] = self._charger_power
        return attributes

    @property
    def unique_id(self):
        """Return the unique id of this hygrostat."""
        return self._unique_id

    def _set_state(self, state):
        """Setting sensor to given state."""
        if self._state is not state:
            self._state = state
            self.schedule_update_ha_state()

    @property
    def rated_current(self):
        """Rated current"""
        return self._rated_current
