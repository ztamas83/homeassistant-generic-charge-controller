"""Tests for generic_charge_controller sensor."""
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import timedelta

import pytest
from homeassistant.const import STATE_ON, STATE_OFF, STATE_UNAVAILABLE
from homeassistant.exceptions import PlatformNotReady
from custom_components.generic_charge_controller.sensor import (
    ChargeControllerTargetCurrentsSensor,
    ChargeControllerModeSensor,
    async_setup_entry,
)
from custom_components.generic_charge_controller.const import DOMAIN


@pytest.mark.asyncio
async def test_async_setup_entry(hass, mock_config_entry, mock_store, mock_coordinator):
    """Test sensor setup from config entry."""
    hass.data[DOMAIN]["store"] = mock_store
    hass.data[DOMAIN][mock_config_entry.entry_id] = mock_coordinator

    # Mock some chargers in the store
    mock_store.get_chargers.return_value = {"charger_1": {"name": "Charger 1"}}

    async_add_entities = MagicMock()

    await async_setup_entry(hass, mock_config_entry, async_add_entities)

    assert async_add_entities.called
    entities = async_add_entities.call_args[0][0]
    # 3 target current sensors + 1 mode sensor
    assert len(entities) == 4
    assert any(isinstance(e, ChargeControllerModeSensor) for e in entities)
    assert any(isinstance(e, ChargeControllerTargetCurrentsSensor) for e in entities)


@pytest.mark.asyncio
async def test_mode_sensor(mock_coordinator):
    """Test the mode sensor."""
    sensor = ChargeControllerModeSensor(mock_coordinator, "charger_1")

    # Default mode
    assert sensor.native_value == "idle"

    # Updated mode in coordinator data
    mock_coordinator.data = {"chargers": {"charger_1": {"mode": "charging"}}}
    assert sensor.native_value == "charging"


@pytest.mark.asyncio
async def test_target_current_sensor(mock_coordinator):
    """Test the target current sensor."""
    sensor = ChargeControllerTargetCurrentsSensor(mock_coordinator, "charger_1", "P1")

    # Default
    assert sensor.native_value is None

    # Updated data
    mock_coordinator.data = {"chargers": {"charger_1": {"target_current_P1": 10.0}}}
    assert sensor.native_value == 10.0
