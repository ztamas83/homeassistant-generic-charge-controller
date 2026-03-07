"""Tests for generic_charge_controller sensor."""
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import timedelta

import pytest
from homeassistant.const import STATE_ON, STATE_OFF, STATE_UNAVAILABLE
from homeassistant.exceptions import PlatformNotReady
from custom_components.generic_charge_controller.sensor import ChargeControllerSensor, ElectricalPhase

@pytest.mark.asyncio
async def test_sensor_init(hass):
    """Test sensor initialization."""
    mock_charger = MagicMock()
    phases = {
        "P1": ElectricalPhase("P1", "sensor.p1", 16.0)
    }
    
    sensor = ChargeControllerSensor(
        hass,
        "Test Controller",
        "test_unique_id",
        phases,
        mock_charger
    )
    sensor.entity_id = "sensor.test_controller"
    sensor.platform = MagicMock()
    
    assert sensor.name == "Test Controller"
    assert sensor.unique_id == "test_unique_id"
    assert sensor.native_value == STATE_OFF

@pytest.mark.asyncio
async def test_sensor_update_unavailable(hass):
    """Test sensor behavior when source sensors are unavailable."""
    mock_charger = MagicMock()
    mock_charger.phase_currents = {"P1": 0.0}
    mock_charger.rated_current = 16.0
    
    phases = {
        "P1": ElectricalPhase("P1", "sensor.p1", 16.0)
    }
    
    sensor = ChargeControllerSensor(
        hass,
        "Test Controller",
        "test_unique_id",
        phases,
        mock_charger
    )
    sensor.entity_id = "sensor.test_controller"
    sensor.platform = MagicMock()
    
    # Mock hass.states.get to return unavailable
    hass.states.get.return_value = MagicMock(state=STATE_UNAVAILABLE)
    
    with pytest.raises(PlatformNotReady):
        await sensor._async_update()
    
    assert sensor.native_value == STATE_UNAVAILABLE

@pytest.mark.asyncio
async def test_sensor_do_balancing(hass):
    """Test load balancing logic."""
    mock_charger = MagicMock()
    mock_charger.phase_currents = {"P1": 5.0}
    mock_charger.rated_current = 16.0
    mock_charger.charging = True
    mock_charger.update_limits = AsyncMock()
    
    phase1 = ElectricalPhase("P1", "sensor.p1", 16.0)
    phases = {"P1": phase1}
    
    sensor = ChargeControllerSensor(
        hass,
        "Test Controller",
        "test_unique_id",
        phases,
        mock_charger
    )
    sensor.entity_id = "sensor.test_controller"
    sensor.platform = MagicMock()
    
    # Mock sensor state (e.g. 10A total load, 5A from charger = 5A other load)
    hass.states.get.return_value = MagicMock(state="10.0")
    
    await sensor._async_update()
    
    assert sensor.native_value == STATE_ON
    mock_charger.update_limits.assert_called_once()
    # 16 (rated) - 5 (other) - 1 (margin) = 10A target
    assert phase1.target_current == 10.0
