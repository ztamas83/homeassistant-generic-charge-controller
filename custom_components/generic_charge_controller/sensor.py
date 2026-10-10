"""Sensors for the generic charge controller."""

from __future__ import annotations

import logging

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform, UnitOfElectricCurrent
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CHARGER_PHASES,
    DOMAIN,
    HH_NAME,
    MODE_IDLE,
    MODES,
    PHASES,
)
from .coordinator import ChargeControllerCoordinator
from .store import ChargeControllerStore

_LOGGER = logging.getLogger(__name__)

MANUFACTURER = "Generic Charge Controller"


def household_device_info(household_id: str, name: str) -> DeviceInfo:
    """Device representing a household."""
    return DeviceInfo(
        identifiers={(DOMAIN, f"household_{household_id}")},
        name=name,
        manufacturer=MANUFACTURER,
        model="Household",
        entry_type=DeviceEntryType.SERVICE,
    )


def charger_device_info(hass: HomeAssistant, charger_id: str) -> DeviceInfo:
    """Device representing load balancing for a charger, linked to the charger device."""
    charger_device = dr.async_get(hass).async_get(charger_id)
    name = "Charger"
    if charger_device is not None:
        name = charger_device.name_by_user or charger_device.name or name

    info = DeviceInfo(
        identifiers={(DOMAIN, f"charger_{charger_id}")},
        name=f"{name} load balancing",
        manufacturer=MANUFACTURER,
        model="Charger load balancing",
        entry_type=DeviceEntryType.SERVICE,
    )
    if charger_device is not None:
        info["via_device_id"] = charger_device.id
    return info


class HouseholdLoadSensor(CoordinatorEntity[ChargeControllerCoordinator], SensorEntity):
    """Measured load on one household phase, as read from the configured sensor."""

    _attr_has_entity_name = True
    _attr_device_class = SensorDeviceClass.CURRENT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfElectricCurrent.AMPERE
    _attr_suggested_display_precision = 1

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        household_id: str,
        household_name: str,
        phase: str,
    ) -> None:
        super().__init__(coordinator)
        self._household_id = household_id
        self._phase = phase
        self._attr_unique_id = f"{DOMAIN}_household_{household_id}_load_{phase.lower()}"
        self._attr_name = f"Load {phase}"
        self._attr_device_info = household_device_info(household_id, household_name)

    @property
    def native_value(self) -> float | None:
        household = self.coordinator.data.get("households", {}).get(self._household_id)
        if household is None:
            return None
        return household.get(self._phase)

    @property
    def available(self) -> bool:
        """Unavailable when the source sensor cannot be read."""
        return super().available and self.native_value is not None


class _ChargerSensor(CoordinatorEntity[ChargeControllerCoordinator], SensorEntity):
    """Base class for charger sensors."""

    _attr_has_entity_name = True
    _data_key: str

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        charger_id: str,
        device_info: DeviceInfo,
    ) -> None:
        super().__init__(coordinator)
        self._charger_id = charger_id
        self._attr_unique_id = f"{DOMAIN}_{charger_id}_{self._data_key.lower()}"
        self._attr_device_info = device_info

    def _charger_data(self) -> dict | None:
        return self.coordinator.data.get("chargers", {}).get(self._charger_id)

    @property
    def native_value(self) -> float | str | None:
        charger = self._charger_data()
        if charger is None:
            return None
        return charger.get(self._data_key)


class ChargerTargetCurrentSensor(_ChargerSensor):
    """Target current for one charger phase."""

    _attr_device_class = SensorDeviceClass.CURRENT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfElectricCurrent.AMPERE

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        charger_id: str,
        device_info: DeviceInfo,
        phase: str,
    ) -> None:
        self._data_key = f"target_current_{phase}"
        super().__init__(coordinator, charger_id, device_info)
        self._attr_name = f"Target current {phase}"


class ChargerModeSensor(_ChargerSensor):
    """Load balancing mode of a charger."""

    _data_key = "mode"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = MODES
    _attr_name = "Mode"

    @property
    def native_value(self) -> str:
        charger = self._charger_data()
        if charger is None:
            return MODE_IDLE
        return charger.get(self._data_key, MODE_IDLE)


@callback
def _async_remove_stale(
    hass: HomeAssistant, entry: ConfigEntry, entities: list[SensorEntity]
) -> None:
    """Remove entities and devices of removed households and chargers."""
    unique_ids = {entity.unique_id for entity in entities}
    device_identifiers = {
        identifier
        for entity in entities
        for identifier in entity.device_info["identifiers"]
    }

    ent_reg = er.async_get(hass)
    for reg_entry in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
        if reg_entry.domain == Platform.SENSOR and reg_entry.unique_id not in unique_ids:
            _LOGGER.debug("Removing stale entity %s", reg_entry.entity_id)
            ent_reg.async_remove(reg_entry.entity_id)

    dev_reg = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(dev_reg, entry.entry_id):
        if not device.identifiers & device_identifiers:
            _LOGGER.debug("Removing stale device %s", device.name)
            dev_reg.async_remove_device(device.id)


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up sensors for all configured households and chargers."""
    coordinator: ChargeControllerCoordinator = hass.data[DOMAIN][entry.entry_id]
    store: ChargeControllerStore = hass.data[DOMAIN]["store"]

    entities: list[SensorEntity] = []

    for household_id, household in store.get_households().items():
        name = household.get(HH_NAME, household_id)
        entities.extend(
            HouseholdLoadSensor(coordinator, household_id, name, phase)
            for phase in PHASES
        )

    for charger_id in store.get_chargers():
        device_info = charger_device_info(hass, charger_id)
        entities.extend(
            ChargerTargetCurrentSensor(coordinator, charger_id, device_info, phase)
            for phase in CHARGER_PHASES
        )
        entities.append(ChargerModeSensor(coordinator, charger_id, device_info))

    _async_remove_stale(hass, entry, entities)
    async_add_entities(entities)

    _LOGGER.info(
        "Sensor platform setup complete for entry %s with %d entities",
        entry.entry_id,
        len(entities),
    )
