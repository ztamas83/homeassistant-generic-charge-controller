"""Tests for reading currents from HA states."""

from datetime import timedelta

import pytest
from homeassistant.util import dt as dt_util

from custom_components.generic_charge_controller.readings import read_current_a


async def test_state_value(hass):
    hass.states.async_set("sensor.x", "10.5", {"unit_of_measurement": "A"})

    assert read_current_a(hass, "sensor.x") == 10.5


async def test_milliampere_is_converted(hass):
    hass.states.async_set("sensor.x", "2500", {"unit_of_measurement": "mA"})

    assert read_current_a(hass, "sensor.x") == 2.5


async def test_attribute_value(hass):
    hass.states.async_set("sensor.x", "8", {"unit_of_measurement": "A", "phase2": 4.2})

    assert read_current_a(hass, "sensor.x", attribute="phase2") == 4.2
    assert read_current_a(hass, "sensor.x", attribute="missing") is None


@pytest.mark.parametrize(
    ("state", "attributes"),
    [
        ("unavailable", {"unit_of_measurement": "A"}),
        ("unknown", {"unit_of_measurement": "A"}),
        ("not a number", {"unit_of_measurement": "A"}),
        ("nan", {"unit_of_measurement": "A"}),
        ("inf", {"unit_of_measurement": "A"}),
        ("2300", {"unit_of_measurement": "W"}),
        ("10", {}),
    ],
)
async def test_untrusted_values_are_none(hass, state, attributes):
    hass.states.async_set("sensor.x", state, attributes)

    assert read_current_a(hass, "sensor.x") is None


async def test_missing_entity_is_none(hass):
    assert read_current_a(hass, "sensor.missing") is None
    assert read_current_a(hass, None) is None


async def test_stale_value_is_none(hass):
    hass.states.async_set("sensor.x", "10", {"unit_of_measurement": "A"})
    stale_after = timedelta(seconds=120)
    now = dt_util.utcnow()

    assert read_current_a(hass, "sensor.x", stale_after=stale_after, now=now) == 10
    assert (
        read_current_a(
            hass, "sensor.x", stale_after=stale_after, now=now + timedelta(seconds=121)
        )
        is None
    )


async def test_wrong_unit_warns_once(hass, caplog):
    hass.states.async_set("sensor.wrong_unit", "2300", {"unit_of_measurement": "W"})

    read_current_a(hass, "sensor.wrong_unit")
    read_current_a(hass, "sensor.wrong_unit")

    assert caplog.text.count("sensor.wrong_unit has unit W") == 1
