"""Switch per charger that enables sending load balancing limits to the charger."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import ChargeControllerCoordinator
from .devices import charger_device_info
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager
from .store import ChargeControllerStore
from .unique_ids import CONTROL_SWITCH_KEY, charger_unique_id


class ChargerControlSwitch(
    CoordinatorEntity[ChargeControllerCoordinator], RestoreEntity, SwitchEntity
):
    """When on, calculated limits are sent to the charger. Off after first setup."""

    _attr_has_entity_name = True
    _attr_name = "Load balancing active"
    _attr_icon = "mdi:scale-balance"

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        charger_id: str,
        device_info: DeviceInfo,
    ) -> None:
        super().__init__(coordinator)
        self._charger_id = charger_id
        self._attr_unique_id = charger_unique_id(charger_id, CONTROL_SWITCH_KEY)
        self._attr_device_info = device_info

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state == STATE_ON:
            self.coordinator.restore_active(self._charger_id, True)
            await self.coordinator.async_request_refresh()

    @property
    def is_on(self) -> bool:
        return self.coordinator.is_active(self._charger_id)

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_active(self._charger_id, True)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.coordinator.async_set_active(self._charger_id, False)
        self.async_write_ha_state()


class _EvSwitch(EvEntity, RestoreEntity, SwitchEntity):
    """Restored on/off switch of an EV, on by default."""

    def _restore(self, value: bool) -> None:
        raise NotImplementedError

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last_state = await self.async_get_last_state()
        if last_state is not None and last_state.state in (STATE_ON, STATE_OFF):
            self._restore(last_state.state == STATE_ON)


class SmartChargingSwitch(_EvSwitch):
    """Enables planning of the charging into the cheapest hours."""

    _key = "smart_charging"
    _attr_icon = "mdi:calendar-clock"

    def _restore(self, value: bool) -> None:
        self._manager.restore_smart_enabled(self._ev_id, value)

    @property
    def is_on(self) -> bool:
        return self._state.smart_enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._manager.async_set_smart_enabled(self._ev_id, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._manager.async_set_smart_enabled(self._ev_id, False)


class ControlChargerSwitch(_EvSwitch):
    """When off the plan is only calculated (dry run), the charger is not paused."""

    _key = "control_charger"
    _attr_icon = "mdi:ev-station"

    def _restore(self, value: bool) -> None:
        self._manager.restore_control_enabled(self._ev_id, value)

    @property
    def is_on(self) -> bool:
        return self._state.control_enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._manager.async_set_control_enabled(self._ev_id, True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._manager.async_set_control_enabled(self._ev_id, False)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up a control switch for every configured charger."""
    coordinator: ChargeControllerCoordinator = hass.data[DOMAIN][entry.entry_id]
    store: ChargeControllerStore = hass.data[DOMAIN]["store"]

    async_add_entities(
        ChargerControlSwitch(coordinator, charger_id, charger_device_info(hass, charger_id))
        for charger_id in store.get_chargers()
    )

    smart: SmartChargingManager = hass.data[DOMAIN]["smart"]
    async_add_entities(
        entity
        for ev_id in smart.ev_ids()
        for entity in (
            SmartChargingSwitch(smart, ev_id),
            ControlChargerSwitch(smart, ev_id),
        )
    )
