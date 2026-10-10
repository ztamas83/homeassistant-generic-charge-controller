"""Tests for the generic_charge_controller sensors, set up through the config entry."""

import pytest
from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from custom_components.generic_charge_controller.const import DOMAIN

from .conftest import (
    HOUSEHOLD_CONFIG,
    PHASE_MAP,
    setup_integration,
    storage_data,
)

pytestmark = pytest.mark.usefixtures("enable_custom_integrations", "mock_panel")


def _entity_id(hass, unique_id: str) -> str:
    entity_id = er.async_get(hass).async_get_entity_id("sensor", DOMAIN, unique_id)
    assert entity_id, f"No entity with unique id {unique_id}"
    return entity_id


@pytest.fixture
def configured(hass, hass_storage, easee_device):
    """Store with one household and one charger."""
    hass_storage[DOMAIN] = storage_data(
        households={"house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}},
        chargers={
            easee_device.id: {
                "charger_id": easee_device.id,
                "type": "easee",
                "household_id": "house_1",
                "phase_map": PHASE_MAP,
            }
        },
    )
    hass.states.async_set("sensor.meter_l1", "10.0", {"unit_of_measurement": "A"})
    hass.states.async_set("sensor.meter_l2", "4.2", {"unit_of_measurement": "A"})
    hass.states.async_set("sensor.meter_l3", "unavailable")
    return easee_device


async def test_household_load_sensors(hass, configured):
    """Household load sensors mirror the configured sensors."""
    await setup_integration(hass)

    l1 = hass.states.get(_entity_id(hass, f"{DOMAIN}_household_house_1_load_l1"))
    assert float(l1.state) == 10.0
    assert l1.attributes["unit_of_measurement"] == "A"
    assert l1.attributes["device_class"] == "current"

    l2 = hass.states.get(_entity_id(hass, f"{DOMAIN}_household_house_1_load_l2"))
    assert float(l2.state) == 4.2

    l3 = hass.states.get(_entity_id(hass, f"{DOMAIN}_household_house_1_load_l3"))
    assert l3.state == STATE_UNAVAILABLE


async def test_household_device(hass, configured):
    """Household sensors belong to a device named after the household."""
    entry = await setup_integration(hass)

    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, "household_house_1"), entry.entry_id
    )
    assert device.name == "Home"


async def test_charger_sensors(hass, configured):
    """Charger sensors exist; without load balancing the mode is idle and targets unknown."""
    charger_id = configured.id
    await setup_integration(hass)

    for phase in ("p1", "p2", "p3"):
        state = hass.states.get(_entity_id(hass, f"{DOMAIN}_{charger_id}_target_current_{phase}"))
        assert state.state == STATE_UNKNOWN
        assert state.attributes["unit_of_measurement"] == "A"

    mode = hass.states.get(_entity_id(hass, f"{DOMAIN}_{charger_id}_mode"))
    assert mode.state == "idle"


async def test_charger_device_linked_to_easee(hass, configured):
    """The charger load balancing device is linked to the Easee device."""
    entry = await setup_integration(hass)

    device = dr.async_get(hass).async_get_device_by_identifier(
        (DOMAIN, f"charger_{configured.id}"), entry.entry_id
    )
    assert device.name == "Garage charger load balancing"
    assert device.via_device_id == configured.id


async def test_stale_entities_removed(hass, hass_storage):
    """Entities and devices of households that no longer exist are removed on setup."""
    hass_storage[DOMAIN] = storage_data()
    entry = await setup_integration(hass)

    dev_reg = dr.async_get(hass)
    stale_device = dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={(DOMAIN, "household_gone")}
    )
    ent_reg = er.async_get(hass)
    stale = ent_reg.async_get_or_create(
        "sensor",
        DOMAIN,
        f"{DOMAIN}_household_gone_load_l1",
        config_entry=entry,
        device_id=stale_device.id,
    )

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert ent_reg.async_get(stale.entity_id) is None
    assert dev_reg.async_get(stale_device.id) is None
