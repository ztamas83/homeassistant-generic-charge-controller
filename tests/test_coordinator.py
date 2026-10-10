"""Tests for ChargeControllerCoordinator."""

import logging

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.generic_charge_controller.const import DOMAIN
from custom_components.generic_charge_controller.coordinator import ChargeControllerCoordinator

from .conftest import HOUSEHOLD_CONFIG


@pytest.fixture
def coordinator(hass, mock_store):
    """Coordinator with one household and one charger in the store."""
    hass.data.setdefault(DOMAIN, {})["store"] = mock_store
    mock_store.get_households.return_value = {
        "house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}
    }
    mock_store.get_chargers.return_value = {"device_1": {"charger_id": "device_1"}}
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    return ChargeControllerCoordinator(hass, entry)


async def test_household_loads(hass, coordinator):
    """Loads are read per phase in ampere, mA is converted."""
    hass.states.async_set("sensor.meter_l1", "10.5", {"unit_of_measurement": "A"})
    hass.states.async_set("sensor.meter_l2", "2500", {"unit_of_measurement": "mA"})
    hass.states.async_set("sensor.meter_l3", "0", {"unit_of_measurement": "A"})

    data = await coordinator._async_update_data()

    assert data["households"]["house_1"] == {"L1": 10.5, "L2": 2.5, "L3": 0.0}


@pytest.mark.parametrize(
    ("state", "attributes"),
    [
        ("unavailable", {"unit_of_measurement": "A"}),
        ("unknown", {"unit_of_measurement": "A"}),
        ("not a number", {"unit_of_measurement": "A"}),
        ("nan", {"unit_of_measurement": "A"}),
        ("2300", {"unit_of_measurement": "W"}),
        ("10", {}),
    ],
)
async def test_untrusted_values_are_none(hass, coordinator, state, attributes):
    """Values that cannot be trusted are None, never 0."""
    hass.states.async_set("sensor.meter_l1", state, attributes)

    data = await coordinator._async_update_data()

    assert data["households"]["house_1"]["L1"] is None


async def test_missing_entity_is_none(hass, coordinator):
    """A configured entity that does not exist reads as None."""
    data = await coordinator._async_update_data()

    assert data["households"]["house_1"] == {"L1": None, "L2": None, "L3": None}


async def test_wrong_unit_warns_once(hass, coordinator, caplog):
    """A sensor with a non-current unit is reported once."""
    hass.states.async_set("sensor.meter_l1", "2300", {"unit_of_measurement": "W"})

    with caplog.at_level(logging.WARNING):
        await coordinator._async_update_data()
        await coordinator._async_update_data()

    assert caplog.text.count("sensor.meter_l1 has unit W") == 1


async def test_chargers_idle_without_targets(hass, coordinator):
    """Until load balancing exists, chargers are idle without targets."""
    data = await coordinator._async_update_data()

    assert data["chargers"]["device_1"] == {
        "mode": "idle",
        "target_current_P1": None,
        "target_current_P2": None,
        "target_current_P3": None,
    }
