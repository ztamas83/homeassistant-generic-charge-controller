"""Binary sensors per EV."""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager


class ChargeNowBinarySensor(EvEntity, BinarySensorEntity):
    """On while the current time is inside a planned charging block."""

    _key = "charge_now"

    @property
    def is_on(self) -> bool:
        return self._manager.in_block(self._ev_id)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    manager: SmartChargingManager = hass.data[DOMAIN]["smart"]
    async_add_entities(ChargeNowBinarySensor(manager, ev_id) for ev_id in manager.ev_ids())
