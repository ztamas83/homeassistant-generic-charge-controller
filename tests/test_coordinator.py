"""Tests for ChargeControllerCoordinator."""

from datetime import timedelta

import pytest
from freezegun.api import FrozenDateTimeFactory
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.generic_charge_controller.const import DOMAIN
from custom_components.generic_charge_controller.coordinator import ChargeControllerCoordinator

from .conftest import HOUSEHOLD_CONFIG, PHASE_MAP, set_easee_states, set_meter_states


@pytest.fixture
def coordinator(hass, mock_store, easee_device):
    """Coordinator with one household (20 A fuse) and one Easee charger."""
    hass.data.setdefault(DOMAIN, {})["store"] = mock_store
    mock_store.get_households.return_value = {
        "house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}
    }
    mock_store.get_chargers.return_value = {
        easee_device.id: {
            "charger_id": easee_device.id,
            "type": "easee",
            "household_id": "house_1",
            "phase_map": PHASE_MAP,  # L1->P2, L2->P3, L3->P1
        }
    }
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    return ChargeControllerCoordinator(hass, entry)


async def test_household_loads(hass, coordinator):
    set_meter_states(hass, 10.5, 2.5, 0)

    data = await coordinator._async_update_data()

    assert data["households"]["house_1"] == {"L1": 10.5, "L2": 2.5, "L3": 0.0}


async def test_household_load_untrusted(hass, coordinator):
    hass.states.async_set("sensor.meter_l1", "unavailable")

    data = await coordinator._async_update_data()

    assert data["households"]["house_1"] == {"L1": None, "L2": None, "L3": None}


async def test_targets_follow_phase_map(hass, coordinator, easee_device):
    """Charger currents and targets are mapped between household and charger phases."""
    # Household L1 = 12 A of which charger P2 = 8 A -> other load 4 A -> 15 A
    # Household L2 = 9 A of which charger P3 = 8 A -> other load 1 A -> 18 A, capped 16
    # Household L3 = 15.2 A of which charger P1 = 8 A -> other load 7.2 -> 8 A -> 11 A
    set_meter_states(hass, 12, 9, 15.2)
    set_easee_states(hass, currents=(8, 8, 8), status="charging", rated_current=16)

    data = await coordinator._async_update_data()

    charger = data["chargers"][easee_device.id]
    assert charger["target_current_P1"] == 11
    assert charger["target_current_P2"] == 15
    assert charger["target_current_P3"] == 16
    assert charger["charger_current_P1"] == 8
    assert charger["mode"] == "limited"


async def test_mode_charging(hass, coordinator, easee_device):
    set_meter_states(hass, 8, 8, 8)
    set_easee_states(hass, currents=(8, 8, 8), status="charging", rated_current=16)

    data = await coordinator._async_update_data()

    assert data["chargers"][easee_device.id]["mode"] == "charging"


async def test_mode_idle(hass, coordinator, easee_device):
    set_meter_states(hass, 1, 1, 1)
    set_easee_states(hass, status="disconnected")

    data = await coordinator._async_update_data()

    charger = data["chargers"][easee_device.id]
    assert charger["mode"] == "idle"
    assert charger["target_current_P1"] == 16


async def test_failsafe(hass, coordinator, easee_device):
    set_meter_states(hass, 1, 1, 1)
    hass.states.async_set("sensor.meter_l2", "unavailable")
    set_easee_states(hass, status="charging")

    data = await coordinator._async_update_data()

    charger = data["chargers"][easee_device.id]
    assert charger["mode"] == "failsafe"
    assert charger["reasons"] == ["No valid household load for L2"]
    assert [charger[f"target_current_P{i}"] for i in (1, 2, 3)] == [0, 0, 0]


async def test_stale_meter_is_failsafe(
    hass, coordinator, easee_device, freezer: FrozenDateTimeFactory
):
    set_meter_states(hass, 1, 1, 1)
    set_easee_states(hass, status="charging")

    freezer.tick(timedelta(seconds=121))
    data = await coordinator._async_update_data()

    assert data["chargers"][easee_device.id]["mode"] == "failsafe"


async def test_unknown_charger_current_is_conservative(hass, coordinator, easee_device):
    """Without charger currents the full household load counts as other load."""
    set_meter_states(hass, 10, 10, 10)
    hass.states.async_set("sensor.garage_charger_status", "charging", {"circuit_ratedCurrent": 16})

    data = await coordinator._async_update_data()

    charger = data["chargers"][easee_device.id]
    assert charger["target_current_P1"] == 9
    assert charger["charger_current_P1"] is None
    assert charger["reasons"] == ["Charger current unknown for L1, L2, L3, assuming 0 A"]
