"""Tests for generic_charge_controller initialization."""
from unittest.mock import patch, MagicMock, AsyncMock

import pytest
from custom_components.generic_charge_controller import (
    async_setup,
    async_setup_entry,
    async_unload_entry,
)
from custom_components.generic_charge_controller.const import DOMAIN

@pytest.mark.asyncio
async def test_async_setup(hass):
    """Test component setup."""
    with patch(
        "custom_components.generic_charge_controller.ChargeControllerStore"
    ) as mock_store_class, patch(
        "custom_components.generic_charge_controller.async_register_websocket_commands"
    ) as mock_ws_reg, patch(
        "custom_components.generic_charge_controller._async_register_panel"
    ) as mock_panel_reg:
        
        mock_store = mock_store_class.return_value
        mock_store.async_load = AsyncMock()
        
        result = await async_setup(hass, {DOMAIN: {}})
        
        assert result is True
        assert DOMAIN in hass.data
        assert mock_ws_reg.called

@pytest.mark.asyncio
async def test_async_setup_entry(hass, mock_config_entry):
    """Test entry setup."""
    with patch(
        "custom_components.generic_charge_controller.ChargeControllerStore"
    ) as mock_store_class, patch(
        "custom_components.generic_charge_controller.ChargeControllerCoordinator"
    ) as mock_coord_class, patch(
        "custom_components.generic_charge_controller.async_register_websocket_commands"
    ) as mock_ws_reg, patch(
        "custom_components.generic_charge_controller._async_register_panel"
    ) as mock_panel_reg:
        
        mock_store = mock_store_class.return_value
        mock_store.async_load = AsyncMock()
        
        mock_coord = mock_coord_class.return_value
        mock_coord.async_config_entry_first_refresh = AsyncMock()
        
        result = await async_setup_entry(hass, mock_config_entry)
        
        assert result is True
        assert mock_config_entry.entry_id in hass.data[DOMAIN]
        assert "store" in hass.data[DOMAIN]
        assert hass.data[DOMAIN]["coordinator"] == mock_coord
        assert hass.config_entries.async_forward_entry_setups.called
        assert mock_panel_reg.called


@pytest.mark.asyncio
async def test_async_unload_entry(hass, mock_config_entry):
    """Test entry unloading."""
    hass.data[DOMAIN] = {
        mock_config_entry.entry_id: MagicMock(),
        "coordinator": MagicMock(),
    }
    
    result = await async_unload_entry(hass, mock_config_entry)
    
    assert result is True
    assert mock_config_entry.entry_id not in hass.data[DOMAIN]
    assert "coordinator" not in hass.data[DOMAIN]
    assert hass.config_entries.async_unload_platforms.called
