"""Control for Easee EV chargers"""

from logging import Logger

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_registry import async_get as async_get_entity_reg
from homeassistant.helpers.state import State
from datetime import datetime, timedelta

from ..abstract_charger import AbstractCharger
from ..const import PHASE_TMP
from .const import (
    ACTION_COMMAND,
    ACTION_START,
    ACTION_STOP,
    ATTR_PHASE_CURRENT_TMP,
    CHRG_DOMAIN,
    DEVICE_STATES,
    EA_AWAITING_START,
    EA_CHARGING,
    EA_READY_TO_CHARGE,
    S_NAME_CIRCUITCURRENT,
    S_NAME_ONLINE,
    S_NAME_STATUS,
    SVC_SET_LIMIT,
)


class EaseeCharger(AbstractCharger):
    """Charger implementation for Easee"""

    def __init__(
        self, hass: HomeAssistant, logger: Logger, device_id: str, unique_id: str
    ) -> None:
        """Init"""
        self.hass = hass
        self._logger = logger
        self._device_id = device_id
        self._unique_id = unique_id
        self._rated_current: float = 0.0
        self._update_rated_current()
        self._last_balanced: tuple[datetime, dict] = (
            datetime.min,
            {},
        )

    def _update_rated_current(self):
        if circuit_current := self._get_state(S_NAME_CIRCUITCURRENT):
            self._rated_current = circuit_current.attributes.get(
                "circuit_ratedCurrent", 0.0
            )

    async def _action_command(self, command):
        await self.hass.services.async_call(
            "easee",
            ACTION_COMMAND,
            {"device_id": self._device_id, "action_command": command},
        )

    async def start(self):
        """Start charge"""
        await self._action_command(ACTION_START)

    async def stop(self):
        """Stop charge"""
        await self._action_command(ACTION_STOP)

    async def update_limits(self, phases: dict[str, float]) -> None:
        self._logger.debug("Charger limits set to: %s", phases)
        if not phases:
            self._logger.error("Cannot load balance, no target currents received")
            return

        svc_data = {
            "device_id": self._device_id,
            "time_to_live": 5,  # fall back to charger default after 5 mins if no other update is given
        }

        balance_needed = (datetime.now() - self._last_balanced[0]).total_seconds() > 180
        for i in range(1, 4):
            if p_curr := phases.get(PHASE_TMP % i, None):
                svc_data[f"currentP{i}"] = p_curr
                if p_curr != self._last_balanced[1].get(f"currentP{i}", 0.0):
                    balance_needed = True

        if not balance_needed:
            self._logger.info("No load balancing update needed")
            return

        self._logger.debug("Load balancing with data: %s", svc_data)

        if not await self.hass.services.async_call(
            "easee", SVC_SET_LIMIT, svc_data, blocking=True
        ):
            raise HomeAssistantError("Cannot send load balancing command")

        self._last_balanced = (datetime.now(), svc_data)

    def _get_state(self, req_state: str) -> State:
        """Get specific state"""
        state_uid = f"{self._unique_id}_{req_state}"
        entity_reg = async_get_entity_reg(self.hass)
        entity = entity_reg.async_get_entity_id(
            Platform.SENSOR.SENSOR, CHRG_DOMAIN, state_uid
        )

        if not entity:
            self._logger.warning("Entity %s not found", state_uid)
            return

        state = self.hass.states.get(entity)
        if not state:
            self._logger.debug("Entity %s state cannot be fetched")
            return None

        self._logger.debug("Entity %s state: %s", state_uid, state.as_dict())
        return state

    @property
    def phase_currents(self) -> dict[str, float]:
        circuit_current = self._get_state(S_NAME_CIRCUITCURRENT)

        ret_currents = {}

        for p in range(1, 4):
            ret_currents[PHASE_TMP % p] = float(
                circuit_current.attributes.get(ATTR_PHASE_CURRENT_TMP % p)
            )

        return ret_currents

    @property
    def charging(self) -> bool:
        """Indicates if charge is ongoing and balance required"""
        return self._get_state(S_NAME_STATUS).state in (
            EA_READY_TO_CHARGE,
            EA_AWAITING_START,
            EA_CHARGING,
        )

    @property
    def rated_current(self) -> float:
        """Rated current on the circuit"""
        if not self._rated_current:
            self._update_rated_current()

        return self._rated_current
