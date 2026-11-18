"""Numbers per EV: current and target state of charge."""

from __future__ import annotations

from homeassistant.components.number import NumberMode, RestoreNumber
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, EV_SOC_ENTITY
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager


class _SocNumber(EvEntity, RestoreNumber):
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_mode = NumberMode.BOX


class CurrentSocNumber(_SocNumber):
    """Manual state of charge. Unavailable when a SOC sensor is configured."""

    _key = "current_soc"
    _attr_icon = "mdi:battery-50"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_number_data()
        if last is not None and last.native_value is not None:
            self._manager.restore_current_soc(self._ev_id, float(last.native_value))

    @property
    def native_value(self) -> float:
        return self._state.manual_soc

    @property
    def available(self) -> bool:
        return not self._state.config.get(EV_SOC_ENTITY)

    async def async_set_native_value(self, value: float) -> None:
        await self._manager.async_set_current_soc(self._ev_id, value)


class TargetSocNumber(_SocNumber):
    """Target state of charge."""

    _key = "target_soc"
    _attr_icon = "mdi:battery-charging-80"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_number_data()
        if last is not None and last.native_value is not None:
            self._manager.restore_target_soc(self._ev_id, float(last.native_value))

    @property
    def native_value(self) -> float:
        return self._state.target_soc

    async def async_set_native_value(self, value: float) -> None:
        await self._manager.async_set_target_soc(self._ev_id, value)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up SOC numbers for every configured EV."""
    manager: SmartChargingManager = hass.data[DOMAIN]["smart"]
    async_add_entities(
        entity
        for ev_id in manager.ev_ids()
        for entity in (CurrentSocNumber(manager, ev_id), TargetSocNumber(manager, ev_id))
    )
