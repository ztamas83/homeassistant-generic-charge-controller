"""Base class of the per-EV entities."""

from __future__ import annotations

from homeassistant.helpers.entity import Entity

from .const import EV_NAME
from .devices import ev_device_info
from .smart.manager import SmartChargingManager
from .unique_ids import ev_unique_id


class EvEntity(Entity):
    """Entity of an EV, updated by the smart charging manager."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _key: str

    def __init__(self, manager: SmartChargingManager, ev_id: str) -> None:
        self._manager = manager
        self._ev_id = ev_id
        self._attr_translation_key = self._key
        self._attr_unique_id = ev_unique_id(ev_id, self._key)
        config = manager.state(ev_id).config  # type: ignore[union-attr]
        self._attr_device_info = ev_device_info(ev_id, config.get(EV_NAME, ev_id))

    @property
    def _state(self):
        return self._manager.state(self._ev_id)

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self._manager.async_add_listener(self.async_write_ha_state))
