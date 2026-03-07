"""Tests for generic_charge_controller config flow."""
from unittest.mock import patch, MagicMock, AsyncMock

import pytest

from custom_components.generic_charge_controller.const import DOMAIN
from custom_components.generic_charge_controller.config_flow import ChargeControllerFlowConfig

@pytest.mark.asyncio
async def test_step_user_show_form(hass):
    """Test showing the user form."""
    flow = ChargeControllerFlowConfig()
    flow.hass = hass
    flow._async_abort_entries_match = MagicMock()
    
    result = await flow.async_step_user()
    
    assert result["type"] == "form"
    assert result["step_id"] == "user"
    assert not result["errors"]

@pytest.mark.asyncio
async def test_step_user_device_not_found(hass):
    """Test when the device is not found."""
    flow = ChargeControllerFlowConfig()
    flow.hass = hass
    flow._async_abort_entries_match = MagicMock()
    
    user_input = {
        "current_sensor_phase1": "sensor.p1",
        "mains_fuse_current": 16,
        "charger_device_id": "test_device_id"
    }

    with patch("custom_components.generic_charge_controller.config_flow.device_registry.async_get") as mock_dev_reg:
        mock_registry = MagicMock()
        mock_registry.async_get.return_value = None
        mock_dev_reg.return_value = mock_registry

        result = await flow.async_step_user(user_input=user_input)
        
        assert result["type"] == "form"
        assert result["errors"] == {"charger_device_id": "Device not found"}

@pytest.mark.asyncio
async def test_step_user_success(hass):
    """Test successful config flow."""
    flow = ChargeControllerFlowConfig()
    flow.hass = hass
    flow._async_abort_entries_match = MagicMock()
    flow.async_set_unique_id = AsyncMock()
    flow._abort_if_unique_id_configured = MagicMock()
    
    user_input = {
        "current_sensor_phase1": "sensor.p1",
        "mains_fuse_current": 16,
        "charger_device_id": "test_device_id"
    }
    
    with patch("custom_components.generic_charge_controller.config_flow.device_registry.async_get") as mock_dev_reg:
        mock_registry = MagicMock()
        mock_device = MagicMock()
        mock_device.identifiers = {("easee", "my_unique_id")}
        mock_registry.async_get.return_value = mock_device
        mock_dev_reg.return_value = mock_registry

        result = await flow.async_step_user(user_input=user_input)
        
        assert result["type"] == "create_entry"
        assert result["title"] == "my_unique_id"
        assert result["data"]["charger_domain"] == "easee"
