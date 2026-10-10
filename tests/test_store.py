"""Tests for ChargeControllerStore."""

from custom_components.generic_charge_controller.const import DOMAIN
from custom_components.generic_charge_controller.store import ChargeControllerStore

from .conftest import HOUSEHOLD_CONFIG, PHASE_MAP


async def test_roundtrip(hass, hass_storage):
    """Saved households and chargers are loaded back by a new store."""
    store = ChargeControllerStore(hass)
    await store.async_load()

    await store.async_save_household("house_1", HOUSEHOLD_CONFIG)
    charger_config = {"type": "easee", "household_id": "house_1", "phase_map": PHASE_MAP}
    await store.async_save_charger("device_1", charger_config)

    reloaded = ChargeControllerStore(hass)
    await reloaded.async_load()

    assert reloaded.get_household("house_1") == {"household_id": "house_1", **HOUSEHOLD_CONFIG}
    assert reloaded.get_charger("device_1") == {"charger_id": "device_1", **charger_config}


async def test_save_replaces_config(hass, hass_storage):
    """Saving replaces the previous config instead of merging into it."""
    store = ChargeControllerStore(hass)
    await store.async_load()

    await store.async_save_household("house_1", {**HOUSEHOLD_CONFIG, "extra": 1})
    await store.async_save_household("house_1", HOUSEHOLD_CONFIG)

    assert "extra" not in store.get_household("house_1")


async def test_v1_data_is_discarded(hass, hass_storage):
    """Data from storage version 1 is dropped."""
    hass_storage[DOMAIN] = {
        "version": 1,
        "minor_version": 1,
        "key": DOMAIN,
        "data": {
            "households": {"tibber_device": {"l1_sensor": "sensor.x"}},
            "chargers": {"device_1": {"house_l1": "cl1"}},
            "measurement_data": {},
        },
    }

    store = ChargeControllerStore(hass)
    await store.async_load()

    assert store.get_households() == {}
    assert store.get_chargers() == {}


async def test_returns_copies(hass, hass_storage):
    """Callers cannot modify stored data through returned values."""
    store = ChargeControllerStore(hass)
    await store.async_load()
    await store.async_save_household("house_1", HOUSEHOLD_CONFIG)

    store.get_households()["house_1"]["name"] = "Changed"

    assert store.get_household("house_1")["name"] == "Home"
