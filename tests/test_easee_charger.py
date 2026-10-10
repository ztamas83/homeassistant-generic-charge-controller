"""Tests for the Easee charger adapter."""

from datetime import timedelta

from homeassistant.util import dt as dt_util

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
