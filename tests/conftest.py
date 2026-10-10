"""Fixtures for generic_charge_controller tests."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.generic_charge_controller.const import DOMAIN

@pytest.fixture
def mock_hass():
    """Return a mocked Home Assistant instance."""
    hass = MagicMock()
    hass.data = {DOMAIN: {}}
    hass.config.path = MagicMock(side_effect=lambda *p: "/".join(("/config",) + p))
    hass.config_entries = MagicMock()
    hass.config_entries.async_forward_entry_setups = AsyncMock()
    hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    hass.async_add_executor_job = AsyncMock(side_effect=lambda fn, *args: fn(*args))
    
    # Mock callWS for frontend data fetching
    hass.callWS = AsyncMock()
    
    return hass

@pytest.fixture
def mock_store():
    """Return a mocked ChargeControllerStore."""
    store = MagicMock()
    store.async_load = AsyncMock()
    store.get_chargers = MagicMock(return_value={})
    store.get_households = MagicMock(return_value={})
    store.get_settings = MagicMock(return_value={})
    store.async_save_charger = AsyncMock()
    store.async_save_household = AsyncMock()
    store.async_save_settings = AsyncMock()
    return store

@pytest.fixture
def mock_coordinator():
    """Return a mocked ChargeControllerCoordinator."""
    coordinator = MagicMock()
    coordinator.async_request_refresh = AsyncMock()
    coordinator.data = {"chargers": {}}
    coordinator._charger_sensors = set()
    return coordinator

@pytest.fixture
def mock_config_entry():
    """Return a mocked config entry."""
    entry = MagicMock()
    entry.entry_id = "test_entry_id"
    entry.data = {}
    entry.options = {}
    return entry
