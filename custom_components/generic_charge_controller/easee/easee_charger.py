"""Control for Easee EV chargers"""

from ..abstract_charger import AbstractCharger
import logging

_LOGGER = logging.getLogger(__name__)
DOMAIN = "easee"

class EaseeCharger(AbstractCharger):
    def __init__(self, hass, charger_entity_id):
        self.hass = hass
        self._entiy_id = charger_entity_id

    def _action_command(self, command):
        self.hass.services.call(
            "easee",
            "action_command",
            {"entity_id": self._entiy_id, "action_command": command},
            blocking=True,
        )

    def start(self):
         self._action_command()
