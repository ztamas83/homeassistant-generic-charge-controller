"""Fixtures for generic_charge_controller tests."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.generic_charge_controller.const import DEFAULT_SETTINGS, DOMAIN

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
    store.get_settings = MagicMock(return_value=dict(DEFAULT_SETTINGS))
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


# Helpers for tests running against a real HA instance (the plugin's `hass` fixture)

EASEE_SERIAL = "EH123456"

HOUSEHOLD_CONFIG = {
    "name": "Home",
    "fuse_a": 20,
    "l1_entity": "sensor.meter_l1",
    "l2_entity": "sensor.meter_l2",
    "l3_entity": "sensor.meter_l3",
}

PHASE_MAP = {"L1": "P2", "L2": "P3", "L3": "P1"}


def storage_data(households: dict | None = None, chargers: dict | None = None) -> dict:
    """Return HA storage content for the integration store."""
    return {
        "version": 2,
        "minor_version": 1,
        "key": DOMAIN,
        "data": {
            "households": households or {},
            "chargers": chargers or {},
            "settings": {},
        },
    }


@pytest.fixture
def mock_panel():
    """Skip sidebar panel registration, which needs the http component."""
    with patch("custom_components.generic_charge_controller._async_register_panel"):
        yield


@pytest.fixture
def easee_device(hass):
    """Register an Easee charger device with its sensor entities."""
    easee_entry = MockConfigEntry(domain="easee")
    easee_entry.add_to_hass(hass)
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)

    device = dev_reg.async_get_or_create(
        config_entry_id=easee_entry.entry_id,
        identifiers={("easee", EASEE_SERIAL)},
        name="Garage charger",
        model="Home",
    )
    for key in ("status", "power", "circuit_current", "max_circuit_limit", "online"):
        ent_reg.async_get_or_create(
            "sensor",
            "easee",
            f"{EASEE_SERIAL}_{key}",
            config_entry=easee_entry,
            device_id=device.id,
            suggested_object_id=f"garage_charger_{key}",
        )
    return device


async def setup_integration(hass) -> MockConfigEntry:
    """Add and set up a config entry for the integration."""
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN, title="Charge Controller")
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def set_easee_states(
    hass,
    currents: tuple[float, float, float] = (0.0, 0.0, 0.0),
    status: str = "charging",
    rated_current: float | None = 16,
) -> None:
    """Set states of the Easee entities registered by the easee_device fixture."""
    status_attrs = {"circuit_ratedCurrent": rated_current} if rated_current is not None else {}
    hass.states.async_set("sensor.garage_charger_status", status, status_attrs)
    hass.states.async_set(
        "sensor.garage_charger_circuit_current",
        str(max(currents)),
        {
            "unit_of_measurement": "A",
            **{
                f"state_circuitTotalPhaseConductorCurrentL{i}": value
                for i, value in enumerate(currents, start=1)
            },
        },
    )


def set_meter_states(hass, l1, l2, l3) -> None:
    """Set the household meter phase sensors used by HOUSEHOLD_CONFIG."""
    for phase, value in (("l1", l1), ("l2", l2), ("l3", l3)):
        hass.states.async_set(f"sensor.meter_{phase}", str(value), {"unit_of_measurement": "A"})
