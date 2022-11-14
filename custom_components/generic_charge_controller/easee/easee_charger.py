"""Control for Easee EV chargers"""

from ..abstract_charger import AbstractCharger
import logging
from homeassistant.core import HomeAssistant
from .const import (
    ACTION_COMMAND,
    ACTION_START,
    ACTION_STOP,
)

_LOGGER = logging.getLogger(__name__)
DOMAIN = "easee"

class EaseeCharger(AbstractCharger):
    def __init__(self, hass: HomeAssistant, charger_device):
        self.hass = hass
        self._device_id = charger_device

    async def _action_command(self, command):
        await self.hass.services.async_call(
            "easee",
            ACTION_COMMAND,
            {"device_id": self._device_id, "action_command": command}
        )

    async def start(self):
         await self._action_command(ACTION_START)
