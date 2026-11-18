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


async def test_v2_data_migrates_to_v3(hass, hass_storage):
    """v2 data is kept and gains an empty evs section."""
    hass_storage[DOMAIN] = {
        "version": 2,
        "minor_version": 1,
        "key": DOMAIN,
        "data": {
            "households": {"house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}},
            "chargers": {"c1": {"charger_id": "c1", "type": "easee"}},
            "settings": {"safety_margin_a": 2},
        },
    }

    store = ChargeControllerStore(hass)
    await store.async_load()

    assert store.get_household("house_1")["name"] == "Home"
    assert store.get_charger("c1")["type"] == "easee"
    assert store.get_settings()["safety_margin_a"] == 2
    assert store.get_evs() == {}


EV_CONFIG = {
    "name": "Car",
    "charger_id": "c1",
    "battery_kwh": 60.0,
    "soc_entity": None,
    "power_entity": "sensor.car_power",
    "fallback_power_kw": 11.0,
    "max_blocks": 2,
    "ready_by": None,
    "model": "average",
}


async def test_ev_crud(hass, hass_storage):
    """EVs are saved, replaced, reloaded, copied and deleted."""
    store = ChargeControllerStore(hass)
    await store.async_load()

    saved = await store.async_save_ev("ev_1", EV_CONFIG)
    assert saved == {"ev_id": "ev_1", **EV_CONFIG}
    await store.async_save_ev("ev_1", {**EV_CONFIG, "name": "Other"})

    reloaded = ChargeControllerStore(hass)
    await reloaded.async_load()
    assert reloaded.get_ev("ev_1")["name"] == "Other"

    reloaded.get_evs()["ev_1"]["name"] = "changed"
    assert reloaded.get_ev("ev_1")["name"] == "Other"

    await reloaded.async_delete_ev("ev_1")
    assert reloaded.get_ev("ev_1") is None
    assert reloaded.get_evs() == {}


async def test_deleting_charger_keeps_ev(hass, hass_storage):
    """Deleting a charger does not cascade to its EV."""
    store = ChargeControllerStore(hass)
    await store.async_load()
    await store.async_save_charger("c1", {"type": "easee"})
    await store.async_save_ev("ev_1", EV_CONFIG)

    await store.async_delete_charger("c1")

    assert store.get_ev("ev_1")["charger_id"] == "c1"
