"""Sensors for the generic charge controller."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import UnitOfElectricCurrent, UnitOfEnergy, UnitOfPower, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    CHARGER_PHASES,
    DOMAIN,
    HH_NAME,
    MODE_IDLE,
    MODES,
    STATUSES,
    PHASES,
)
from .coordinator import ChargeControllerCoordinator
from .devices import charger_device_info, household_device_info
from .ev_entity import EvEntity
from .smart.manager import SmartChargingManager
from .store import ChargeControllerStore
from .unique_ids import charger_unique_id, household_load_unique_id

_LOGGER = logging.getLogger(__name__)

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
        self._attr_unique_id = household_load_unique_id(household_id, phase)
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
        self._attr_unique_id = charger_unique_id(charger_id, self._data_key)
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


class ChargerCurrentSensor(_ChargerSensor):
    """Current drawn by the charger on one charger phase, as read from the charger."""

    _attr_device_class = SensorDeviceClass.CURRENT
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = UnitOfElectricCurrent.AMPERE
    _attr_suggested_display_precision = 1

    def __init__(
        self,
        coordinator: ChargeControllerCoordinator,
        charger_id: str,
        device_info: DeviceInfo,
        phase: str,
    ) -> None:
        self._data_key = f"charger_current_{phase}"
        super().__init__(coordinator, charger_id, device_info)
        self._attr_name = f"Charger current {phase}"


class ChargerModeSensor(_ChargerSensor):
    """Load balancing mode of a charger, with the reasons behind it."""

    _data_key = "mode"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = MODES
    _attr_name = "Mode"
    _attr_translation_key = "mode"

    @property
    def native_value(self) -> str:
        charger = self._charger_data()
        if charger is None:
            return MODE_IDLE
        return charger.get(self._data_key, MODE_IDLE)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        charger = self._charger_data() or {}
        return {
            "reasons": charger.get("reasons", []),
            "control_active": charger.get("control_active", False),
            "overload": charger.get("overload", False),
            "last_sent": charger.get("last_sent"),
            "last_sent_at": charger.get("last_sent_at"),
        }


class _EvSensor(EvEntity, SensorEntity):
    """Base of the EV sensors."""


class EvStatusSensor(_EvSensor):
    _key = "status"
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = STATUSES

    @property
    def native_value(self) -> str:
        return self._state.status


class EvEnergyNeededSensor(_EvSensor):
    _key = "energy_needed"
    _attr_device_class = SensorDeviceClass.ENERGY
    _attr_native_unit_of_measurement = UnitOfEnergy.KILO_WATT_HOUR
    _attr_suggested_display_precision = 1

    @property
    def native_value(self) -> float:
        return round(self._state.energy_needed_kwh, 3)


class EvEstimatedPowerSensor(_EvSensor):
    _key = "estimated_power"
    _attr_device_class = SensorDeviceClass.POWER
    _attr_native_unit_of_measurement = UnitOfPower.KILO_WATT
    _attr_suggested_display_precision = 1

    @property
    def native_value(self) -> float | None:
        estimate = self._state.estimate
        return round(estimate.power_kw, 3) if estimate else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        estimate = self._state.estimate
        if estimate is None:
            return {}
        return {
            "source": estimate.source,
            "confidence": round(estimate.confidence, 3),
            "n_samples": estimate.n_samples,
        }


class EvChargeDurationSensor(_EvSensor):
    _key = "charge_duration"
    _attr_device_class = SensorDeviceClass.DURATION
    _attr_native_unit_of_measurement = UnitOfTime.MINUTES
    _attr_suggested_display_precision = 0

    @property
    def native_value(self) -> float | None:
        estimate = self._state.estimate
        return round(estimate.duration.total_seconds() / 60, 1) if estimate else None


class EvNextChargeStartSensor(_EvSensor):
    _key = "next_charge_start"
    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self):
        return self._manager.next_block_start(self._ev_id)


class EvPlannedCostSensor(_EvSensor):
    """Cost of the plan in the currency of the price source."""

    _key = "planned_cost"
    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_suggested_display_precision = 2

    @property
    def native_value(self) -> float | None:
        plan = self._state.plan
        return round(plan.cost, 4) if plan else None

    @property
    def native_unit_of_measurement(self) -> str | None:
        return self._manager.currency(self._ev_id)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        plan = self._state.plan
        return {
            "blocks": [
                {"start": b.start.isoformat(), "end": b.end.isoformat(), "cost": b.cost}
                for b in (plan.blocks if plan else [])
            ],
            "currency": self._manager.currency(self._ev_id),
        }


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
        entities.extend(
            ChargerCurrentSensor(coordinator, charger_id, device_info, phase)
            for phase in CHARGER_PHASES
        )
        entities.append(ChargerModeSensor(coordinator, charger_id, device_info))

    smart: SmartChargingManager = hass.data[DOMAIN]["smart"]
    for ev_id in smart.ev_ids():
        entities.extend(
            cls(smart, ev_id)
            for cls in (
                EvStatusSensor,
                EvEnergyNeededSensor,
                EvEstimatedPowerSensor,
                EvChargeDurationSensor,
                EvNextChargeStartSensor,
                EvPlannedCostSensor,
            )
        )

    async_add_entities(entities)

    _LOGGER.info(
        "Sensor platform setup complete for entry %s with %d entities",
        entry.entry_id,
        len(entities),
    )
