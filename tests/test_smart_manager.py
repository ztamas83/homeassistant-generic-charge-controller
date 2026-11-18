"""Tests for smart charging: manager, EV entities and the coordinator hook."""

from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import AsyncMock

import pytest
from homeassistant.const import STATE_OFF, STATE_ON
from homeassistant.core import State, SupportsResponse
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_time_changed,
    async_mock_service,
    mock_restore_cache_with_extra_data,
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

TODAY = "2026-01-15"
TOMORROW = "2026-01-16"
CHEAP_HOUR = 5  # local hour with the lowest price today


def local(day: str, hour: int, minute: int = 0, second: int = 0) -> datetime:
    y, m, d = (int(x) for x in day.split("-"))
    return datetime(y, m, d, hour, minute, second, tzinfo=dt_util.get_default_time_zone())


def day_prices(cheap_hour: int, cheap: float = 10.0, normal: float = 100.0) -> dict[int, float]:
    return {h: cheap if h == cheap_hour else normal for h in range(24)}


@pytest.fixture
def prices(hass):
    """Mocked nordpool service; fill prices[date] = {hour: price per MWh}."""
    data: dict[str, dict[int, float]] = {TODAY: day_prices(CHEAP_HOUR)}

    async def handler(call):
        day = call.data["date"]
        hours = data.get(day, {})
        return {
            "SE3": [
                {
                    "start": local(day, h).isoformat(),
                    "end": (local(day, h) + timedelta(hours=1)).isoformat(),
                    "price": price,
                }
                for h, price in hours.items()
            ]
        }

    hass.services.async_register(
        "nordpool", "get_prices_for_date", handler, supports_response=SupportsResponse.ONLY
    )
    return data


def ev_config(charger_id, **overrides):
    return {
        "ev_id": "ev1",
        "name": "Car",
        "charger_id": charger_id,
        "battery_kwh": 50,
        "power_entity": "sensor.car_power",
        "fallback_power_kw": 10,
        "max_blocks": 1,
        **overrides,
    }


def seed_storage(hass_storage, charger_id, household_extra=None, **ev_overrides):
    hass_storage[DOMAIN] = storage_data(
        households={
            "house_1": {
                "household_id": "house_1",
                **HOUSEHOLD_CONFIG,
                **(
                    {"price_config_entry": "np", "price_area": "SE3"}
                    if household_extra is None
                    else household_extra
                ),
            }
        },
        chargers={
            charger_id: {
                "charger_id": charger_id,
                "type": "easee",
                "household_id": "house_1",
                "phase_map": PHASE_MAP,
            }
        },
        evs={"ev1": ev_config(charger_id, **ev_overrides)},
    )


@pytest.fixture
def easee_calls(hass, easee_device):
    set_meter_states(hass, 12, 9, 15.2)
    set_easee_states(hass, currents=(8, 8, 8), status="charging", rated_current=16)
    hass.states.async_set("sensor.car_power", "5", {"unit_of_measurement": "kW"})
    return async_mock_service(hass, "easee", "set_circuit_dynamic_limit")


@pytest.fixture
def action_calls(hass):
    """Mocked easee.action_command; each call has data["action_command"]."""
    return async_mock_service(hass, "easee", "action_command")


def actions(action_calls):
    return [c.data["action_command"] for c in action_calls]


@pytest.fixture
async def start(hass, hass_storage, easee_device, easee_calls, action_calls, prices, freezer):
    """Return an async function that seeds storage, freezes time and sets up the integration."""

    async def _start(now=None, household_extra=None, **ev_overrides):
        freezer.move_to(now or local(TODAY, 2, 7))
        seed_storage(hass_storage, easee_device.id, household_extra, **ev_overrides)
        entry = await setup_integration(hass)
        return entry

    return _start


async def tick_to(hass, freezer, when: datetime) -> None:
    freezer.move_to(when)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


def manager(hass):
    return hass.data[DOMAIN]["smart"]


STATUS = "sensor.car_status"
SMART = "switch.car_smart_charging"
CONTROL = "switch.car_control_charger"
CURRENT_SOC = "number.car_current_state_of_charge"
TARGET_SOC = "number.car_target_state_of_charge"
CHARGE_NOW = "binary_sensor.car_charge_now"
MODE = "sensor.garage_charger_load_balancing_mode"
LB_SWITCH = "switch.garage_charger_load_balancing_load_balancing_active"


async def lb_on(hass, freezer):
    """Turn load balancing on and let the debounced refresh run."""
    await set_switch(hass, LB_SWITCH, True)
    freezer.tick(timedelta(seconds=4))
    async_fire_time_changed(hass)
    await hass.async_block_till_done()


def ev_device(hass, entry):
    return next(
        (
            d
            for d in dr.async_entries_for_config_entry(dr.async_get(hass), entry.entry_id)
            if (DOMAIN, "ev_ev1") in d.identifiers
        ),
        None,
    )


async def set_number(hass, entity_id, value):
    await hass.services.async_call(
        "number", "set_value", {"entity_id": entity_id, "value": value}, blocking=True
    )
    await hass.async_block_till_done()


async def set_switch(hass, entity_id, on):
    await hass.services.async_call(
        "switch", "turn_on" if on else "turn_off", {"entity_id": entity_id}, blocking=True
    )
    await hass.async_block_till_done()


# Statuses


async def test_planned_charging_completed(hass, start, freezer, easee_device):
    await start()
    await set_number(hass, TARGET_SOC, 20)  # 10 kWh at 10 kW = 1 h
    assert hass.states.get(STATUS).state == "planned"
    assert float(hass.states.get("sensor.car_energy_needed").state) == 10
    assert float(hass.states.get("sensor.car_charge_duration").state) == 60
    assert float(hass.states.get("sensor.car_estimated_power").state) == 10
    assert hass.states.get("sensor.car_estimated_power").attributes["source"] == "fallback"
    plan = manager(hass).state("ev1").plan
    assert plan.blocks[0].start == local(TODAY, CHEAP_HOUR)
    assert hass.states.get(CHARGE_NOW).state == STATE_OFF
    assert hass.states.get("sensor.car_next_charge_start").state == local(
        TODAY, CHEAP_HOUR
    ).astimezone(dt_util.UTC).isoformat()
    assert hass.states.get("sensor.car_planned_cost").attributes["blocks"][0]["cost"] > 0

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 0, 6))
    assert hass.states.get(STATUS).state == "charging"
    assert hass.states.get(CHARGE_NOW).state == STATE_ON

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 6))
    assert hass.states.get(STATUS).state == "completed"
    assert hass.states.get(CHARGE_NOW).state == STATE_OFF


async def test_no_charging_needed_and_disabled(hass, start):
    await start()
    await set_number(hass, TARGET_SOC, 0)
    assert hass.states.get(STATUS).state == "no_charging_needed"
    await set_number(hass, TARGET_SOC, 20)
    assert hass.states.get(STATUS).state == "planned"
    await set_switch(hass, SMART, False)
    assert hass.states.get(STATUS).state == "disabled"


async def test_no_price_source(hass, start):
    await start(household_extra={})
    assert hass.states.get(STATUS).state == "no_price_source"


async def test_soc_sensor_overrides_manual(hass, start):
    hass.states.async_set("sensor.car_soc", "70")
    await start(soc_entity="sensor.car_soc")
    assert hass.states.get(CURRENT_SOC).state == "unavailable"
    assert float(hass.states.get("sensor.car_energy_needed").state) == pytest.approx(5)

    hass.states.async_set("sensor.car_soc", "80")
    await hass.async_block_till_done()
    assert hass.states.get(STATUS).state == "no_charging_needed"

    hass.states.async_set("sensor.car_soc", "unavailable")  # falls back to manual 0 %
    await hass.async_block_till_done()
    assert float(hass.states.get("sensor.car_energy_needed").state) == pytest.approx(40)


async def test_deadline_waiting_for_prices_then_planned(hass, start, freezer, prices):
    # Ready by 01:00 tomorrow, only today's prices known
    await start(ready_by="01:00")
    await set_number(hass, TARGET_SOC, 20)
    assert hass.states.get(STATUS).state == "waiting_for_prices"
    assert manager(hass).charging_allowed(next(iter(hass.data[DOMAIN]["store"].get_chargers()))) is None

    prices[TOMORROW] = day_prices(3)
    await tick_to(hass, freezer, local(TODAY, 2, 15, 6))
    assert hass.states.get(STATUS).state == "planned"
    assert manager(hass).state("ev1").plan.blocks[0].start == local(TODAY, CHEAP_HOUR)


# Replan rules


async def test_new_prices_replan_before_block_started(hass, start, freezer, prices):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    assert manager(hass).state("ev1").plan.blocks[0].start == local(TODAY, CHEAP_HOUR)

    prices[TOMORROW] = {h: 1.0 if h == 3 else 100.0 for h in range(24)}
    await tick_to(hass, freezer, local(TODAY, 2, 15, 6))

    assert manager(hass).state("ev1").plan.blocks[0].start == local(TOMORROW, 3)


async def test_no_replan_on_new_prices_after_block_started(hass, start, freezer, prices):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 30, 6))
    assert hass.states.get(STATUS).state == "charging"
    before = manager(hass).state("ev1").plan

    prices[TOMORROW] = {h: 1.0 if h == 3 else 100.0 for h in range(24)}
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 45, 6))

    assert manager(hass).state("ev1").plan is before
    assert hass.states.get(STATUS).state == "charging"


async def test_soc_change_replans_even_after_block_started(hass, start, freezer):
    await start()
    await set_number(hass, TARGET_SOC, 40)  # 20 kWh = 2 h
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 10, 6))
    before = manager(hass).state("ev1").plan

    await set_number(hass, CURRENT_SOC, 20)  # 10 kWh left = 1 h

    after = manager(hass).state("ev1").plan
    assert after is not before
    assert float(hass.states.get("sensor.car_energy_needed").state) == 10


async def test_smart_switch_on_replans(hass, start):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await set_switch(hass, SMART, False)
    manager(hass).state("ev1").plan = None
    await set_switch(hass, SMART, True)
    assert manager(hass).state("ev1").plan is not None


# Persistence


async def test_plan_reused_after_restart_when_inputs_match(hass, start, freezer, hass_storage):
    entry = await start()
    hass.states.async_set("sensor.car_power", "0", {"unit_of_measurement": "kW"})  # no SOC estimate
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, 2, 7, 30))  # delayed save runs
    saved = hass_storage[f"{DOMAIN}_plans"]["data"]
    assert saved["ev1"]["inputs_key"]

    # Mark the stored plan so reuse is visible
    saved["ev1"]["cost"] = 999.0
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert manager(hass).state("ev1").plan.cost == 999.0


async def test_plan_not_reused_when_inputs_changed(hass, start, freezer, hass_storage):
    entry = await start()
    hass.states.async_set("sensor.car_power", "0", {"unit_of_measurement": "kW"})  # no SOC estimate
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, 2, 7, 30))
    saved = hass_storage[f"{DOMAIN}_plans"]["data"]
    saved["ev1"]["cost"] = 999.0
    saved["ev1"]["inputs_key"] = "other"

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert manager(hass).state("ev1").plan.cost != 999.0


# charging_allowed


async def test_charging_allowed_truth_table(hass, start, freezer, easee_device):
    await start()
    cid = easee_device.id
    m = manager(hass)
    assert m.charging_allowed("unknown") is None

    await set_number(hass, TARGET_SOC, 20)
    assert m.charging_allowed(cid) is False  # outside the block

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 0, 6))
    assert m.charging_allowed(cid) is True

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 6))
    assert m.charging_allowed(cid) is False  # completed

    await set_switch(hass, CONTROL, False)  # dry run
    assert m.charging_allowed(cid) is None
    await set_switch(hass, CONTROL, True)

    await set_switch(hass, SMART, False)
    assert m.charging_allowed(cid) is None
    await set_switch(hass, SMART, True)

    await set_number(hass, TARGET_SOC, 0)  # target reached at session start: no opinion
    assert m.charging_allowed(cid) is None


async def test_charging_allowed_fail_open(hass, start, easee_device):
    await start(household_extra={})  # no price source
    await set_number(hass, TARGET_SOC, 20)
    assert manager(hass).charging_allowed(easee_device.id) is None


# Plug session and SOC estimate


def tick(m, cid, now, connected=True, mode="limited"):
    m.feed_learning(cid, now, mode, connected)


async def run_ticks(hass, m, cid, freezer, start, seconds, step=30, connected=True):
    """Feed charger ticks every `step` s, the first one at `start`."""
    for i in range(0, seconds + 1, step):
        freezer.move_to(start + timedelta(seconds=i))
        tick(m, cid, dt_util.utcnow(), connected)
    await hass.async_block_till_done()


async def test_completed_plan_stays_paused_while_connected(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 6))
    tick(m, cid, dt_util.utcnow())
    await hass.async_block_till_done()
    assert hass.states.get(STATUS).state == "completed"
    assert m.charging_allowed(cid) is False
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 3))
    assert m.charging_allowed(cid) is False  # still paused, no top-up


async def test_unplug_clears_plan_and_releases(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    tick(m, cid, dt_util.utcnow())
    assert m.charging_allowed(cid) is False and m.state("ev1").plan is not None
    refresh = AsyncMock()
    m._coordinator.async_request_refresh = refresh

    tick(m, cid, dt_util.utcnow(), connected=False)
    await hass.async_block_till_done()

    assert m.state("ev1").plan is None
    assert m.state("ev1").session_completed is False
    assert m.charging_allowed(cid) is None
    refresh.assert_called()
    assert hass.states.get(CHARGE_NOW).state == STATE_OFF


async def test_unplug_after_completion_then_plug_in_replans(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 6))
    tick(m, cid, dt_util.utcnow())
    assert m.charging_allowed(cid) is False

    tick(m, cid, dt_util.utcnow(), connected=False)
    await hass.async_block_till_done()
    assert m.charging_allowed(cid) is None and m.state("ev1").plan is None

    tick(m, cid, dt_util.utcnow(), connected=True)  # plug in: new session, replan
    await hass.async_block_till_done()
    assert m.state("ev1").plan is not None
    assert m.state("ev1").session_completed is False


async def test_at_target_at_session_start_is_not_paused(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    await set_number(hass, TARGET_SOC, 0)
    tick(m, cid, dt_util.utcnow(), connected=False)
    tick(m, cid, dt_util.utcnow(), connected=True)
    await hass.async_block_till_done()
    assert m.state("ev1").plan is None
    assert m.charging_allowed(cid) is None
    assert hass.states.get(STATUS).state == "no_charging_needed"


async def test_completed_session_survives_restart(hass, start, freezer, easee_device, hass_storage):
    entry = await start()
    cid, m = easee_device.id, manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 6))
    tick(m, cid, dt_util.utcnow())
    await hass.async_block_till_done()
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 1))  # delayed save runs
    assert hass_storage[f"{DOMAIN}_plans"]["data"]["_session_completed"] == ["ev1"]

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert manager(hass).charging_allowed(cid) is False


async def test_soc_estimated_from_delivered_energy(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    hass.states.async_set("sensor.car_power", "11", {"unit_of_measurement": "kW"})
    await set_number(hass, CURRENT_SOC, 10)
    await set_number(hass, TARGET_SOC, 80)
    plan = m.state("ev1").plan
    m.state("ev1").last_tick = None
    t0 = dt_util.utcnow()

    await run_ticks(hass, m, cid, freezer, t0, 15 * 60)  # 11 kW for 15 min = 2.75 kWh

    assert m.state("ev1").manual_soc == pytest.approx(10 + 5.5)
    assert float(hass.states.get(CURRENT_SOC).state) == pytest.approx(15.5, abs=0.1)
    assert m.state("ev1").plan is plan  # no replan from the estimate


async def test_soc_estimate_capped_at_target_and_completes(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    hass.states.async_set("sensor.car_power", "11", {"unit_of_measurement": "kW"})
    await set_number(hass, CURRENT_SOC, 10)
    await set_number(hass, TARGET_SOC, 20)
    assert m.charging_allowed(cid) is False  # planned, outside the block
    plan = m.state("ev1").plan
    m.state("ev1").last_tick = None

    await run_ticks(hass, m, cid, freezer, dt_util.utcnow(), 40 * 60)

    assert m.state("ev1").manual_soc == 20
    assert m.state("ev1").plan is plan
    assert hass.states.get(STATUS).state == "completed"
    assert m.charging_allowed(cid) is False


async def test_soc_estimate_ignores_gaps(hass, start, freezer, easee_device):
    await start()
    cid, m = easee_device.id, manager(hass)
    hass.states.async_set("sensor.car_power", "11", {"unit_of_measurement": "kW"})
    await set_number(hass, CURRENT_SOC, 10)
    await set_number(hass, TARGET_SOC, 80)
    m.state("ev1").last_tick = None
    now = dt_util.utcnow()
    tick(m, cid, now)
    tick(m, cid, now + timedelta(seconds=91))
    assert m.state("ev1").manual_soc == 10
    hass.states.async_set("sensor.car_power", "0.1", {"unit_of_measurement": "kW"})
    tick(m, cid, now + timedelta(seconds=121))  # below 0.2 kW
    assert m.state("ev1").manual_soc == 10


async def test_soc_estimate_not_applied_with_soc_entity(hass, start, freezer, easee_device):
    hass.states.async_set("sensor.car_soc", "70")
    await start(soc_entity="sensor.car_soc")
    cid, m = easee_device.id, manager(hass)
    hass.states.async_set("sensor.car_power", "11", {"unit_of_measurement": "kW"})
    await set_number(hass, TARGET_SOC, 80)
    m.state("ev1").last_tick = None
    await run_ticks(hass, m, cid, freezer, dt_util.utcnow(), 300)
    assert m.state("ev1").manual_soc == 0
    assert m.state("ev1").soc == 70


# Coordinator hook


def limits(call):
    return (call.data["current_p1"], call.data["current_p2"], call.data["current_p3"])


async def test_pause_outside_block_uses_native_pause(hass, start, freezer, easee_calls, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)

    assert actions(action_calls) == ["pause"]
    assert action_calls[0].data["device_id"] == easee_device_id(hass)
    assert limits(easee_calls[-1]) == (11, 15, 16)  # load balancing limits, not 0
    mode = hass.states.get(MODE)
    assert mode.state == "scheduled_pause"
    assert "smart_charging" in mode.attributes["reasons"]


async def test_allowed_inside_block_sends_load_balancing_limits(hass, start, freezer, easee_calls):
    await start(now=local(TODAY, CHEAP_HOUR, 0, 10))
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)

    assert limits(easee_calls[-1]) == (11, 15, 16)
    assert hass.states.get(MODE).state == "limited"


async def test_block_boundary_pauses_and_block_start_resumes(
    hass, start, freezer, easee_calls, action_calls
):
    await start(now=local(TODAY, CHEAP_HOUR - 1, 59, 50))
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert actions(action_calls) == ["pause"]

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 0, 10))
    assert actions(action_calls) == ["pause", "resume"]
    assert hass.states.get(MODE).state != "scheduled_pause"

    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 40))
    assert actions(action_calls) == ["pause", "resume", "pause"]
    assert hass.states.get(MODE).state == "scheduled_pause"
    assert all(all(limits(c)) for c in easee_calls)  # never a 0 A limit


async def test_inside_block_no_pause_and_no_resume_when_not_paused_by_us(
    hass, start, freezer, action_calls
):
    await start(now=local(TODAY, CHEAP_HOUR, 0, 10))
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 5))
    assert action_calls == []  # never paused by us: nothing to resume


async def test_pause_retried_after_90s_while_charging_max_three(
    hass, start, freezer, action_calls
):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert actions(action_calls) == ["pause"]

    for expected in (2, 3, 3, 3):
        await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=95))
        assert len(action_calls) == expected  # still charging: retried, then gives up


async def test_no_retry_when_charger_stopped(hass, start, freezer, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    set_easee_states(hass, currents=(0, 0, 0), status="paused", rated_current=16)
    await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=95))
    assert actions(action_calls) == ["pause"]


async def test_pause_error_is_retried_next_cycle(hass, start, freezer, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    hass.services.async_remove("easee", "action_command")
    await lb_on(hass, freezer)  # service missing: error is logged, not raised
    assert not manager(hass).is_paused(easee_device_id(hass))
    calls = async_mock_service(hass, "easee", "action_command")
    await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=95))
    assert actions(calls) == ["pause"]
    assert manager(hass).is_paused(easee_device_id(hass))


async def test_unplug_clears_pause_without_resume(hass, start, freezer, action_calls):
    await start()
    cid = easee_device_id(hass)
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert manager(hass).is_paused(cid)

    set_easee_states(hass, currents=(0, 0, 0), status="disconnected", rated_current=16)
    await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=10))
    assert actions(action_calls) == ["pause"]
    assert not manager(hass).is_paused(cid)


async def test_paused_state_survives_restart_and_resumes_when_allowed(
    hass, start, freezer, action_calls, hass_storage
):
    entry = await start()
    cid = easee_device_id(hass)
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=30))  # delayed save runs
    assert hass_storage[f"{DOMAIN}_plans"]["data"]["_paused_chargers"] == [cid]

    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert manager(hass).is_paused(cid)

    await set_switch(hass, SMART, False)  # allowed again
    assert actions(action_calls)[-1] == "resume"
    assert not manager(hass).is_paused(cid)


async def test_dry_run_leaves_charger_untouched(hass, start, freezer, easee_calls, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await set_switch(hass, CONTROL, False)
    await lb_on(hass, freezer)

    assert limits(easee_calls[-1]) == (11, 15, 16)
    assert action_calls == []
    assert hass.states.get(MODE).state == "limited"  # not scheduled_pause
    assert hass.states.get(CHARGE_NOW).state == STATE_OFF  # plan still calculated


async def test_load_balancing_wins_inside_block(hass, start, freezer, easee_calls):
    set_meter_states(hass, 18, 9, 15.2)  # load balancing limits P2 to 9 A
    await start(now=local(TODAY, CHEAP_HOUR, 0, 10))
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)

    assert limits(easee_calls[-1])[1] == 9
    assert hass.states.get(MODE).state == "limited"


async def test_learning_fed_only_when_unthrottled(hass, start, freezer, easee_device):
    # Inside a block: samples accumulate (light household load, so not limited)
    set_meter_states(hass, 2, 2, 2)
    await start(now=local(TODAY, CHEAP_HOUR, 0, 10))
    await set_number(hass, TARGET_SOC, 20)
    learning = hass.data[DOMAIN]["learning"]
    base = learning.model("ev1").n_samples
    for i in range(1, 12):
        await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR, 0, 10) + timedelta(seconds=30 * i))
    assert learning.model("ev1").n_samples > base

    # Paused outside the block (mode scheduled_pause): nothing is learned
    after = learning.model("ev1").n_samples
    await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 10))
    assert hass.states.get(MODE).state == "scheduled_pause"
    for i in range(1, 12):
        await tick_to(hass, freezer, local(TODAY, CHEAP_HOUR + 1, 0, 10) + timedelta(seconds=30 * i))
    assert learning.model("ev1").n_samples == after


async def test_power_in_watts_is_converted(hass, start, easee_device):
    await start()
    hass.states.async_set("sensor.car_power", "7400", {"unit_of_measurement": "W"})
    st = manager(hass).state("ev1")
    assert manager(hass)._power_kw(st) == pytest.approx(7.4)


# Charge now (button) and immediate pause/release


BUTTON = "button.car_charge_now"


async def press(hass, entity_id=BUTTON):
    await hass.services.async_call("button", "press", {"entity_id": entity_id}, blocking=True)
    await hass.async_block_till_done()


async def test_charge_now_turns_smart_off_and_resumes(hass, start, freezer, action_calls):
    await start()
    cid, m = easee_device_id(hass), manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert actions(action_calls) == ["pause"]
    assert m.charging_allowed(cid) is False

    await press(hass)  # resumes at once, even within 90 s of the pause
    assert hass.states.get(SMART).state == STATE_OFF
    assert m.charging_allowed(cid) is None
    assert actions(action_calls) == ["pause", "resume"]
    assert hass.states.get(MODE).state != "scheduled_pause"
    assert "force_charge" not in await m.async_get_plan_info("ev1")


async def test_charge_now_requests_immediate_refresh(hass, start, easee_device):
    await start()
    m = manager(hass)
    refresh = AsyncMock()
    m._coordinator.async_refresh_now = refresh
    await press(hass)
    refresh.assert_awaited_once_with(easee_device.id)


async def test_smart_on_outside_block_pauses_in_next_cycle(hass, start, freezer, action_calls):
    """Smart off released the charger; turning it on pauses at once, not after the interval."""
    await start()
    cid, m = easee_device_id(hass), manager(hass)
    await set_number(hass, TARGET_SOC, 20)
    await set_switch(hass, SMART, False)
    await lb_on(hass, freezer)
    assert action_calls == []  # released, never paused

    freezer.tick(timedelta(seconds=2))
    await set_switch(hass, SMART, True)
    assert m.charging_allowed(cid) is False
    assert actions(action_calls) == ["pause"]
    assert hass.states.get(MODE).state == "scheduled_pause"


async def test_smart_off_resumes_at_once(hass, start, freezer, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert actions(action_calls) == ["pause"]

    freezer.tick(timedelta(seconds=2))
    await set_switch(hass, SMART, False)
    assert actions(action_calls) == ["pause", "resume"]


async def test_control_inactive_resumes(hass, start, freezer, action_calls):
    await start()
    await set_number(hass, TARGET_SOC, 20)
    await lb_on(hass, freezer)
    assert actions(action_calls) == ["pause"]
    await set_switch(hass, LB_SWITCH, False)
    await tick_to(hass, freezer, dt_util.utcnow() + timedelta(seconds=10))
    assert actions(action_calls) == ["pause", "resume"]




def easee_device_id(hass):
    return next(iter(hass.data[DOMAIN]["store"].get_chargers()))


async def test_old_force_charge_entity_removed(hass, hass_storage, easee_device, easee_calls, prices, freezer):
    from custom_components.generic_charge_controller.unique_ids import (
        ev_unique_id,
        expected_unique_ids,
    )

    assert ev_unique_id("ev1", "force_charge") not in expected_unique_ids([], [], ["ev1"])
    assert ev_unique_id("ev1", "start_charging") in expected_unique_ids([], [], ["ev1"])

    freezer.move_to(local(TODAY, 2, 7))
    seed_storage(hass_storage, easee_device.id)
    ent_reg = er.async_get(hass)
    entry = MockConfigEntry(domain=DOMAIN, unique_id=DOMAIN, title="Charge Controller")
    entry.add_to_hass(hass)
    ent_reg.async_get_or_create(
        "switch", DOMAIN, ev_unique_id("ev1", "force_charge"), config_entry=entry,
        suggested_object_id="car_charge_now",
    )
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert ent_reg.async_get_entity_id("switch", DOMAIN, ev_unique_id("ev1", "force_charge")) is None
    assert ent_reg.async_get_entity_id("button", DOMAIN, ev_unique_id("ev1", "start_charging"))


# Entities


async def test_entities_created_for_ev(hass, start):
    entry = await start()
    ent_reg = er.async_get(hass)
    for entity_id in (
        STATUS, "sensor.car_energy_needed", "sensor.car_estimated_power",
        "sensor.car_charge_duration", "sensor.car_next_charge_start", "sensor.car_planned_cost",
        CURRENT_SOC, TARGET_SOC, SMART, CONTROL, CHARGE_NOW, BUTTON,
    ):
        assert ent_reg.async_get(entity_id) is not None, entity_id
    assert hass.states.get(SMART).state == STATE_ON
    assert hass.states.get(CONTROL).state == STATE_ON
    assert float(hass.states.get(TARGET_SOC).state) == 80
    assert ev_device(hass, entry).name == "Car"


async def test_numbers_and_switches_restored(hass, hass_storage, easee_device, easee_calls, prices, freezer):
    freezer.move_to(local(TODAY, 2, 7))
    seed_storage(hass_storage, easee_device.id)
    mock_restore_cache_with_extra_data(
        hass,
        [
            (State(CURRENT_SOC, "35"), {"native_max_value": 100, "native_min_value": 0,
             "native_step": 1, "native_unit_of_measurement": "%", "native_value": 35}),
            (State(TARGET_SOC, "60"), {"native_max_value": 100, "native_min_value": 0,
             "native_step": 1, "native_unit_of_measurement": "%", "native_value": 60}),
            (State(SMART, STATE_OFF), {}),
            (State(CONTROL, STATE_OFF), {}),
        ],
    )

    await setup_integration(hass)

    assert float(hass.states.get(CURRENT_SOC).state) == 35
    assert float(hass.states.get(TARGET_SOC).state) == 60
    assert hass.states.get(SMART).state == STATE_OFF
    assert hass.states.get(CONTROL).state == STATE_OFF
    assert hass.states.get(STATUS).state == "disabled"
    assert float(hass.states.get("sensor.car_energy_needed").state) == pytest.approx(12.5)


async def test_stale_cleanup_keeps_and_removes_ev_entities(hass, start, hass_storage):
    entry = await start()
    ent_reg = er.async_get(hass)
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    assert ent_reg.async_get(STATUS) is not None  # kept
    assert ev_device(hass, entry) is not None

    hass_storage[DOMAIN]["data"]["evs"] = {}
    hass.data[DOMAIN]["store"]._evs = {}
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()

    assert ent_reg.async_get(STATUS) is None
    assert ent_reg.async_get(CHARGE_NOW) is None
    assert ev_device(hass, entry) is None


async def test_plan_info(hass, start):
    MockConfigEntry(domain="nordpool", entry_id="np", data={"currency": "SEK"}).add_to_hass(hass)
    await start()
    await set_number(hass, TARGET_SOC, 20)
    info = await manager(hass).async_get_plan_info("ev1")
    assert info["status"] == "planned"
    assert info["energy_needed_kwh"] == 10
    assert info["estimate"]["source"] == "fallback"
    assert info["plan"]["blocks"]
    assert len(info["prices"]) == 24
    assert info["currency"] == "SEK"
    state = hass.states.get("sensor.car_planned_cost")
    assert state.attributes["unit_of_measurement"] == "SEK"
    assert state.attributes["device_class"] == "monetary"
    assert info["deadline"] is None
    assert info["control_enabled"] and info["smart_enabled"]
