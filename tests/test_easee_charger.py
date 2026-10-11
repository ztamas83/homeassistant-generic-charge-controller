"""Tests for the Easee charger adapter."""

from datetime import timedelta

import pytest
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_mock_service

from custom_components.generic_charge_controller.easee.charger import EaseeCharger

from .conftest import EASEE_SERIAL, set_easee_states


async def test_reads_charger_values(hass, easee_device):
    set_easee_states(hass, currents=(8.0, 7.5, 0.0), status="charging", rated_current=16)

    charger = EaseeCharger(hass, easee_device.id)

    assert charger.serial == EASEE_SERIAL
    assert charger.phase_currents() == {"P1": 8.0, "P2": 7.5, "P3": 0.0}
    assert charger.is_charging()
    assert charger.max_current() == 16


async def test_not_charging(hass, easee_device):
    set_easee_states(hass, status="awaiting_start")

    assert not EaseeCharger(hass, easee_device.id).is_charging()


async def test_missing_states(hass, easee_device):
    """Entities without states give unknown values."""
    charger = EaseeCharger(hass, easee_device.id)

    assert charger.phase_currents() == {"P1": None, "P2": None, "P3": None}
    assert not charger.is_charging()
    assert charger.max_current() is None


async def test_unknown_device(hass):
    charger = EaseeCharger(hass, "no_such_device")

    assert charger.serial is None
    assert charger.phase_currents() == {"P1": None, "P2": None, "P3": None}


async def test_stale_currents(hass, easee_device):
    set_easee_states(hass, currents=(8.0, 8.0, 8.0))

    charger = EaseeCharger(
        hass,
        easee_device.id,
        stale_after=timedelta(seconds=120),
        now=dt_util.utcnow() + timedelta(seconds=121),
    )

    assert charger.phase_currents() == {"P1": None, "P2": None, "P3": None}


async def test_renamed_entity_is_found(hass, easee_device):
    """Entities are found by unique id, not by entity id."""
    from homeassistant.helpers import entity_registry as er

    er.async_get(hass).async_update_entity(
        "sensor.garage_charger_circuit_current", new_entity_id="sensor.renamed"
    )
    hass.states.async_set(
        "sensor.renamed",
        "5",
        {"unit_of_measurement": "A", "state_circuitTotalPhaseConductorCurrentL1": 5},
    )

    assert EaseeCharger(hass, easee_device.id).phase_currents()["P1"] == 5


async def test_is_connected(hass, easee_device):
    charger = EaseeCharger(hass, easee_device.id)
    for status, connected in (
        ("disconnected", False),
        ("offline", False),
        ("unavailable", False),
        ("awaiting_start", True),
        ("charging", True),
        ("completed", True),
    ):
        set_easee_states(hass, status=status)
        assert charger.is_connected() is connected, status


async def test_set_limits_calls_easee_service(hass, easee_device):
    calls = async_mock_service(hass, "easee", "set_circuit_dynamic_limit")

    await EaseeCharger(hass, easee_device.id).async_set_limits({"P1": 10, "P2": 0, "P3": 16})

    assert len(calls) == 1
    assert calls[0].data == {
        "device_id": easee_device.id,
        "current_p1": 10,
        "current_p2": 0,
        "current_p3": 16,
        "time_to_live": 0,
    }


async def test_release_sets_rated_current(hass, easee_device):
    calls = async_mock_service(hass, "easee", "set_circuit_dynamic_limit")
    set_easee_states(hass, rated_current=20)

    await EaseeCharger(hass, easee_device.id).async_release()

    assert calls[0].data["current_p1"] == 20
    assert calls[0].data["current_p3"] == 20


async def test_release_without_rated_current_fails(hass, easee_device):
    async_mock_service(hass, "easee", "set_circuit_dynamic_limit")
    set_easee_states(hass, rated_current=None)

    with pytest.raises(HomeAssistantError):
        await EaseeCharger(hass, easee_device.id).async_release()
