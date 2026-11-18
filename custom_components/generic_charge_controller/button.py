"""Buttons per EV."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager


class StartChargingButton(EvEntity, ButtonEntity):
    """Charge now: turns smart charging off and releases the charger."""

    _key = "start_charging"
    _attr_icon = "mdi:lightning-bolt"

    async def async_press(self) -> None:
        await self._manager.async_start_charging(self._ev_id)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager: SmartChargingManager = hass.data[DOMAIN]["smart"]
    async_add_entities(StartChargingButton(manager, ev_id) for ev_id in manager.ev_ids())
