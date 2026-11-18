"""Numbers per EV: current and target state of charge."""

from __future__ import annotations

from homeassistant.components.number import NumberExtraStoredData, NumberMode, RestoreNumber
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, EV_SOC_ENTITY, EV_TARGET_SOC_ENTITY
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager


class _SocNumber(EvEntity, RestoreNumber):
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1
    _attr_native_unit_of_measurement = PERCENTAGE
    _attr_mode = NumberMode.BOX


class CurrentSocNumber(_SocNumber):
    """Current state of charge: manual or estimated, or read-only from a SOC sensor."""

    _key = "current_soc"
    _attr_icon = "mdi:battery-50"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_number_data()
        if last is not None and last.native_value is not None:
            self._manager.restore_current_soc(self._ev_id, float(last.native_value))

    @property
    def extra_restore_state_data(self) -> NumberExtraStoredData:
        # Keep the manual value, never the sensor value
        return NumberExtraStoredData(
            self.native_max_value,
            self.native_min_value,
            self.native_step,
            self.native_unit_of_measurement,
            self._state.manual_soc,
        )

    @property
    def native_value(self) -> float:
        return self._manager.effective_soc(self._ev_id)

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        if entity_id := self._state.config.get(EV_SOC_ENTITY):
            return {"source": "sensor", "source_entity": entity_id}
        return {"source": "manual"}

    async def async_set_native_value(self, value: float) -> None:
        if entity_id := self._state.config.get(EV_SOC_ENTITY):
            raise ServiceValidationError(f"Battery level comes from {entity_id}")
        await self._manager.async_set_current_soc(self._ev_id, value)


class TargetSocNumber(_SocNumber):
    """Target state of charge: manual, or read-only from a sensor."""

    _key = "target_soc"
    _attr_icon = "mdi:battery-charging-80"

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        last = await self.async_get_last_number_data()
        if last is not None and last.native_value is not None:
            self._manager.restore_target_soc(self._ev_id, float(last.native_value))

    @property
    def extra_restore_state_data(self) -> NumberExtraStoredData:
        # Keep the manual value, never the sensor value
        return NumberExtraStoredData(
            self.native_max_value,
            self.native_min_value,
            self.native_step,
            self.native_unit_of_measurement,
            self._state.target_soc,
        )

    @property
    def native_value(self) -> float:
        return self._manager.effective_target_soc(self._ev_id)

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        if entity_id := self._state.config.get(EV_TARGET_SOC_ENTITY):
            return {"source": "sensor", "source_entity": entity_id}
        return {"source": "manual"}

    async def async_set_native_value(self, value: float) -> None:
        if entity_id := self._state.config.get(EV_TARGET_SOC_ENTITY):
            raise ServiceValidationError(f"Target battery level comes from {entity_id}")
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
