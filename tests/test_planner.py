"""Tests for the cheapest-slots planner."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.generic_charge_controller.smart.models import ChargePlan, PriceSlot
from custom_components.generic_charge_controller.smart.planner import plan_cheapest

T0 = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)


def mk(prices, minutes=15):
    step = timedelta(minutes=minutes)
    return [PriceSlot(T0 + i * step, T0 + (i + 1) * step, p) for i, p in enumerate(prices)]


def _e(duration, power):
    return power * duration.total_seconds() / 3600


def _p(power):
    return lambda at: power


def test_k1_continuous():
    slots = mk([5, 1, 9, 2, 2, 9])
    plan = plan_cheapest(slots, T0, None, _e(timedelta(minutes=30), 4.0), 1, _p(4.0))
    assert len(plan.blocks) == 1
    assert plan.blocks[0].start == T0 + timedelta(minutes=45)
    assert plan.blocks[0].end == T0 + timedelta(minutes=75)
    assert plan.cost == pytest.approx((2 + 2) * 4.0 * 0.25)
    assert not plan.insufficient_time


def test_k2_cheaper_than_k1():
    slots = mk([5, 1, 9, 1, 9, 9])
    p1 = plan_cheapest(slots, T0, None, _e(timedelta(minutes=30), 4.0), 1, _p(4.0))
    p2 = plan_cheapest(slots, T0, None, _e(timedelta(minutes=30), 4.0), 2, _p(4.0))
    assert len(p2.blocks) == 2
    assert p2.cost < p1.cost
    assert p2.cost == pytest.approx(2 * 4.0 * 0.25)


def test_tie_fewer_blocks():
    slots = mk([1, 1, 1, 1])
    plan = plan_cheapest(slots, T0, None, _e(timedelta(minutes=30), 4.0), 2, _p(4.0))
    assert len(plan.blocks) == 1
    assert plan.blocks[0].start == T0


def test_partial_current_slot_counted():
    slots = mk([1, 5, 5, 5])
    now = T0 + timedelta(minutes=10)
    plan = plan_cheapest(slots, now, None, _e(timedelta(minutes=15), 4.0), 1, _p(4.0))
    assert plan.blocks[0].start == T0


def test_insufficient_window():
    slots = mk([1, 2])
    plan = plan_cheapest(slots, T0, None, _e(timedelta(hours=2), 4.0), 1, _p(4.0))
    assert plan.insufficient_time
    assert plan.blocks[0].end - plan.blocks[0].start == timedelta(minutes=30)


def test_deadline_cut():
    slots = mk([5, 5, 1, 1])
    deadline = T0 + timedelta(minutes=30)
    plan = plan_cheapest(slots, T0, deadline, _e(timedelta(minutes=15), 4.0), 1, _p(4.0))
    assert plan.blocks[0].end <= deadline
    # slot crossing the deadline is excluded
    plan = plan_cheapest(slots, T0, T0 + timedelta(minutes=40), _e(timedelta(minutes=45), 4.0), 1, _p(4.0))
    assert plan.insufficient_time
    assert plan.blocks[-1].end == T0 + timedelta(minutes=30)


def test_hourly_slots():
    slots = mk([3, 1, 2], minutes=60)
    plan = plan_cheapest(slots, T0, None, _e(timedelta(minutes=90), 10.0), 1, _p(10.0))
    assert plan.blocks[0].start == T0 + timedelta(hours=1)
    assert plan.blocks[0].end == T0 + timedelta(hours=3)
    assert plan.cost == pytest.approx(1 * 10.0 + 2 * 5.0)  # last slot cut to 5 kWh


def test_zero_duration():
    plan = plan_cheapest(mk([1, 2]), T0, None, _e(timedelta(0), 4.0), 2, _p(4.0))
    assert plan.blocks == []
    assert plan.cost == 0.0


def test_non_contiguous_slots_split_blocks():
    a = mk([1, 1])
    b = [PriceSlot(T0 + timedelta(hours=2), T0 + timedelta(hours=2, minutes=15), 1)]
    plan = plan_cheapest(a + b, T0, None, _e(timedelta(minutes=45), 4.0), 2, _p(4.0))
    assert len(plan.blocks) == 2


def test_plan_round_trip():
    plan = plan_cheapest(mk([1, 2, 3]), T0, None, _e(timedelta(minutes=30), 4.0), 1, _p(4.0), "k")
    assert ChargePlan.from_dict(plan.to_dict()) == plan


def test_price_per_kwh_decides_with_varying_power():
    # slot 0 cheap but weak (1 kW), slot 1 pricier but strong (8 kW); need 2 kWh
    slots = mk([1, 2], minutes=60)
    power = {slots[0].start: 1.0, slots[1].start: 8.0}
    plan = plan_cheapest(slots, T0, None, 2.0, 1, lambda at: power[at])
    # slot 1 alone delivers 8 kWh at 2/kWh; slot 0 alone is insufficient
    assert [b.start for b in plan.blocks] == [slots[1].start]
    assert plan.cost == pytest.approx(2 * 2.0)  # truncated to the 2 kWh needed


def test_cheaper_per_kwh_wins_over_cheaper_price():
    slots = mk([1.0, 1.5, 9.0], minutes=60)
    power = {slots[0].start: 2.0, slots[1].start: 10.0, slots[2].start: 2.0}
    plan = plan_cheapest(slots, T0, None, 10.0, 2, lambda at: power[at])
    assert [b.start for b in plan.blocks] == [slots[1].start]
    assert plan.cost == pytest.approx(15.0)


def test_varying_power_changes_slot_count():
    slots = mk([1, 1, 1, 1], minutes=60)
    low = plan_cheapest(slots, T0, None, 8.0, 1, _p(4.0))
    high = plan_cheapest(slots, T0, None, 8.0, 1, _p(8.0))
    assert sum((b.end - b.start for b in low.blocks), timedelta()) == timedelta(hours=2)
    assert sum((b.end - b.start for b in high.blocks), timedelta()) == timedelta(hours=1)


def test_insufficient_energy_takes_all():
    slots = mk([1, 2, 3], minutes=60)
    plan = plan_cheapest(slots, T0, None, 100.0, 1, _p(5.0))
    assert plan.insufficient_time
    assert plan.cost == pytest.approx((1 + 2 + 3) * 5.0)


def test_last_slot_truncated():
    slots = mk([2, 2], minutes=60)
    plan = plan_cheapest(slots, T0, None, 15.0, 1, _p(10.0))
    assert plan.cost == pytest.approx(2 * 10.0 + 2 * 5.0)
    assert len(plan.blocks) == 1
    assert plan.blocks[0].cost == pytest.approx(plan.cost)


def test_performance_many_slots():
    import random
    import time

    rnd = random.Random(1)
    slots = mk([rnd.uniform(0.5, 3.0) for _ in range(200)])
    start = time.perf_counter()
    plan = plan_cheapest(slots, T0, None, 100.0, 4, lambda at: 3.0 + (at.minute % 7))
    assert time.perf_counter() - start < 1.0
    assert 1 <= len(plan.blocks) <= 4
