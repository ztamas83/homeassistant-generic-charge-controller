"""Tests for the load balancing switch and sending limits to the charger."""

from datetime import timedelta

import pytest
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import State
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    async_fire_time_changed,
    async_mock_service,
    mock_restore_cache,
)

from custom_components.generic_charge_controller.const import DOMAIN

from .conftest import (
    HOUSEHOLD_CONFIG,
    PHASE_MAP,
    set_easee_states,
    set_meter_states,
    setup_integration,
    storage_data,
)

pytestmark = pytest.mark.usefixtures("enable_custom_integrations", "mock_panel")

SWITCH = "switch.garage_charger_load_balancing_load_balancing_active"
MODE = "sensor.garage_charger_load_balancing_mode"


@pytest.fixture
def calls(hass, hass_storage, easee_device):
    """Configured household and charger, live states, and the mocked Easee service."""
    hass_storage[DOMAIN] = storage_data(
        households={"house_1": {"household_id": "house_1", **HOUSEHOLD_CONFIG}},
        chargers={
            easee_device.id: {
                "charger_id": easee_device.id,
                "type": "easee",
                "household_id": "house_1",
                "phase_map": PHASE_MAP,  # L1->P2, L2->P3, L3->P1
            }
        },
    )
    # Expected targets: P1 11 A, P2 15 A, P3 16 A (see test_coordinator)
    set_meter_states(hass, 12, 9, 15.2)
    set_easee_states(hass, currents=(8, 8, 8), status="charging", rated_current=16)
    return async_mock_service(hass, "easee", "set_circuit_dynamic_limit")


def limits_sent(call) -> tuple[int, int, int]:
    return (call.data["current_p1"], call.data["current_p2"], call.data["current_p3"])


async def test_off_by_default_sends_nothing(hass, calls):
    await setup_integration(hass)

    assert hass.states.get(SWITCH).state == STATE_OFF
    assert calls == []
    assert hass.states.get(MODE).attributes["control_active"] is False


async def test_turn_on_sends_limits(hass, calls, easee_device):
    await setup_integration(hass)

    await hass.services.async_call("switch", "turn_on", {"entity_id": SWITCH}, blocking=True)
    await hass.async_block_till_done()

    assert hass.states.get(SWITCH).state == STATE_ON
    assert len(calls) == 1
    assert calls[0].data["device_id"] == easee_device.id
    assert limits_sent(calls[0]) == (11, 15, 16)
    mode = hass.states.get(MODE)
    assert mode.attributes["control_active"] is True
    assert mode.attributes["last_sent"] == {"P1": 11, "P2": 15, "P3": 16}


async def test_turn_off_releases_limits(hass, calls):
    await setup_integration(hass)
    await hass.services.async_call("switch", "turn_on", {"entity_id": SWITCH}, blocking=True)

    await hass.services.async_call("switch", "turn_off", {"entity_id": SWITCH}, blocking=True)
    await hass.async_block_till_done()

    assert hass.states.get(SWITCH).state == STATE_OFF
    assert limits_sent(calls[-1]) == (16, 16, 16)  # circuit rated current


async def test_no_car_connected(hass, calls):
    set_easee_states(hass, status="disconnected", rated_current=16)
    await setup_integration(hass)

    await hass.services.async_call("switch", "turn_on", {"entity_id": SWITCH}, blocking=True)
    await hass.async_block_till_done()

    assert calls == []
    assert "No car connected, limits not sent" in hass.states.get(MODE).attributes["reasons"]


async def test_switch_state_restored(hass, calls):
    mock_restore_cache(hass, [State(SWITCH, STATE_ON)])

    await setup_integration(hass)
    await hass.async_block_till_done()

    assert hass.states.get(SWITCH).state == STATE_ON
    assert len(calls) == 1


async def test_switch_removed_with_charger(hass, calls, hass_storage, easee_device):
    entry = await setup_integration(hass)
    hass_storage[DOMAIN]["data"]["chargers"] = {}
    hass.data[DOMAIN]["store"]._chargers = {}

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert er.async_get(hass).async_get(SWITCH) is None



async def test_deleting_active_charger_releases_limits(hass, calls, hass_ws_client, easee_device):
    await setup_integration(hass)
    await hass.services.async_call("switch", "turn_on", {"entity_id": SWITCH}, blocking=True)
    client = await hass_ws_client(hass)

    await client.send_json(
        {"id": 1, "type": f"{DOMAIN}/chargers/delete", "charger_id": easee_device.id}
    )
    result = await client.receive_json()

    assert result["success"]
    assert limits_sent(calls[-1]) == (16, 16, 16)


async def _active_and_settled(hass) -> None:
    """Turn the switch on and let the refresh cooldown pass."""
    await hass.services.async_call("switch", "turn_on", {"entity_id": SWITCH}, blocking=True)
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=5))
    await hass.async_block_till_done()


async def test_meter_change_recalculates_at_once(hass, calls):
    """Targets follow a meter change at once; sending waits for the update interval."""
    await setup_integration(hass)
    await _active_and_settled(hass)

    set_meter_states(hass, 18, 9, 15.2)
    await hass.async_block_till_done()

    target_p2 = "sensor.garage_charger_load_balancing_target_current_p2"
    assert float(hass.states.get(target_p2).state) == 9
    assert len(calls) == 1
    assert any(
        r.startswith("New limits are sent in") for r in hass.states.get(MODE).attributes["reasons"]
    )


async def test_held_back_limits_sent_after_interval(hass, calls, freezer):
    await setup_integration(hass)
    await _active_and_settled(hass)
    set_meter_states(hass, 18, 9, 15.2)
    await hass.async_block_till_done()
    assert len(calls) == 1

    # The scheduled recheck sends the new limits once the interval has passed
    freezer.tick(timedelta(seconds=31))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert limits_sent(calls[-1]) == (11, 9, 16)


async def test_sustained_overload_bypasses_interval(hass, calls, freezer):
    await setup_integration(hass)
    await _active_and_settled(hass)

    # Household L1 (charger P2) at 31 A: above 150 % of the 20 A fuse
    set_meter_states(hass, 31, 9, 15.2)
    await hass.async_block_till_done()
    assert len(calls) == 1  # not yet sustained for 10 s

    freezer.tick(timedelta(seconds=11))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert limits_sent(calls[-1]) == (11, 0, 16)
    assert hass.states.get(MODE).attributes["overload"] is True


async def test_short_overload_waits_for_interval(hass, calls, freezer):
    await setup_integration(hass)
    await _active_and_settled(hass)

    set_meter_states(hass, 31, 9, 15.2)
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=5))
    set_meter_states(hass, 25, 9, 15.2)  # back below 30 A within 10 s
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    freezer.tick(timedelta(seconds=7))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()

    assert len(calls) == 1


async def test_charger_status_change_triggers_update(hass, calls):
    set_easee_states(hass, currents=(8, 8, 8), status="disconnected", rated_current=16)
    await setup_integration(hass)
    await _active_and_settled(hass)
    assert calls == []

    set_easee_states(hass, currents=(8, 8, 8), status="charging", rated_current=16)
    await hass.async_block_till_done()

    assert limits_sent(calls[-1]) == (11, 15, 16)


async def test_burst_of_changes_is_debounced(hass, calls):
    await setup_integration(hass)
    await _active_and_settled(hass)

    coordinator = hass.data[DOMAIN]["coordinator"]
    update = coordinator._async_update_data
    count = 0

    async def counting_update():
        nonlocal count
        count += 1
        return await update()

    coordinator._async_update_data = counting_update

    for value in (12.1, 12.2, 12.3, 12.4, 12.5):
        hass.states.async_set("sensor.meter_l1", str(value), {"unit_of_measurement": "A"})
        await hass.async_block_till_done()
    assert count == 1  # first change at once, the rest wait for the cooldown

    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=4))
    await hass.async_block_till_done()
    assert count == 2  # one update for all changes during the cooldown


async def test_untracked_entity_does_not_trigger_update(hass, calls):
    await setup_integration(hass)
    await _active_and_settled(hass)
    coordinator = hass.data[DOMAIN]["coordinator"]
    data_before = coordinator.data

    hass.states.async_set("sensor.unrelated", "1")
    await hass.async_block_till_done()

    assert coordinator.data is data_before
