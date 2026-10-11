"""Tests for generic_charge_controller initialization."""
import re
from unittest.mock import patch, MagicMock, AsyncMock

import pytest
from custom_components.generic_charge_controller import (
    async_setup,
    async_setup_entry,
    async_unload_entry,
    _async_register_panel,
)
from custom_components.generic_charge_controller.const import DOMAIN

from .conftest import HOUSEHOLD_CONFIG, setup_integration, storage_data

@pytest.mark.asyncio
async def test_async_setup(mock_hass):
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
        
        result = await async_setup(mock_hass, {DOMAIN: {}})
        
        assert result is True
        assert DOMAIN in mock_hass.data
        assert mock_ws_reg.called

@pytest.mark.asyncio
async def test_async_setup_entry(mock_hass, mock_config_entry):
    """Test entry setup."""
    with patch(
        "custom_components.generic_charge_controller.ChargeControllerStore"
    ) as mock_store_class, patch(
        "custom_components.generic_charge_controller.ChargeControllerCoordinator"
    ) as mock_coord_class, patch(
        "custom_components.generic_charge_controller.async_register_websocket_commands"
    ) as mock_ws_reg, patch(
        "custom_components.generic_charge_controller._async_register_panel"
    ) as mock_panel_reg, patch(
        "custom_components.generic_charge_controller.async_remove_stale"
    ):
        
        mock_store = mock_store_class.return_value
        mock_store.async_load = AsyncMock()
        mock_store.get_households.return_value = {}
        mock_store.get_chargers.return_value = {}
        
        mock_coord = mock_coord_class.return_value
        mock_coord.async_config_entry_first_refresh = AsyncMock()
        
        result = await async_setup_entry(mock_hass, mock_config_entry)
        
        assert result is True
        assert mock_config_entry.entry_id in mock_hass.data[DOMAIN]
        assert "store" in mock_hass.data[DOMAIN]
        assert mock_hass.data[DOMAIN]["coordinator"] == mock_coord
        assert mock_hass.config_entries.async_forward_entry_setups.called
        assert mock_panel_reg.called


@pytest.mark.asyncio
async def test_async_unload_entry(mock_hass, mock_config_entry):
    """Test entry unloading."""
    mock_hass.data[DOMAIN] = {
        mock_config_entry.entry_id: MagicMock(),
        "coordinator": MagicMock(),
    }
    
    result = await async_unload_entry(mock_hass, mock_config_entry)
    
    assert result is True
    assert mock_config_entry.entry_id not in mock_hass.data[DOMAIN]
    assert "coordinator" not in mock_hass.data[DOMAIN]
    assert mock_hass.config_entries.async_unload_platforms.called


@pytest.mark.usefixtures("enable_custom_integrations", "mock_panel")
async def test_remove_entry_clears_config(hass, hass_storage):
    """Removing the config entry deletes the stored configuration."""
    hass_storage[DOMAIN] = storage_data(
        households={"house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}}
    )
    entry = await setup_integration(hass)

    await hass.config_entries.async_remove(entry.entry_id)
    await hass.async_block_till_done()

    assert DOMAIN not in hass_storage
    assert hass.data[DOMAIN]["store"].get_households() == {}


async def test_panel_url_contains_bundle_hash(hass):
    """The panel JS URL changes with the bundle content, so browsers do not use a stale copy."""
    hass.data[DOMAIN] = {}
    hass.http = MagicMock()
    hass.http.async_register_static_paths = AsyncMock()

    with patch(
        "custom_components.generic_charge_controller.async_register_built_in_panel"
    ) as mock_register:
        await _async_register_panel(hass)

    js_url = mock_register.call_args.kwargs["config"]["_panel_custom"]["js_url"]
    assert re.fullmatch(r"/charge-controller/controller-panel\.js\?v=[0-9a-f]{12}", js_url)
