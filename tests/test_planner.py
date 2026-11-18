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


def test_k1_continuous():
    slots = mk([5, 1, 9, 2, 2, 9])
    plan = plan_cheapest(slots, T0, None, timedelta(minutes=30), 1, 4.0)
    assert len(plan.blocks) == 1
    assert plan.blocks[0].start == T0 + timedelta(minutes=45)
    assert plan.blocks[0].end == T0 + timedelta(minutes=75)
    assert plan.cost == pytest.approx((2 + 2) * 4.0 * 0.25)
    assert not plan.insufficient_time


def test_k2_cheaper_than_k1():
    slots = mk([5, 1, 9, 1, 9, 9])
    p1 = plan_cheapest(slots, T0, None, timedelta(minutes=30), 1, 4.0)
    p2 = plan_cheapest(slots, T0, None, timedelta(minutes=30), 2, 4.0)
    assert len(p2.blocks) == 2
    assert p2.cost < p1.cost
    assert p2.cost == pytest.approx(2 * 4.0 * 0.25)


def test_tie_fewer_blocks():
    slots = mk([1, 1, 1, 1])
    plan = plan_cheapest(slots, T0, None, timedelta(minutes=30), 2, 4.0)
    assert len(plan.blocks) == 1
    assert plan.blocks[0].start == T0


def test_partial_current_slot_counted():
    slots = mk([1, 5, 5, 5])
    now = T0 + timedelta(minutes=10)
    plan = plan_cheapest(slots, now, None, timedelta(minutes=15), 1, 4.0)
    assert plan.blocks[0].start == T0


def test_insufficient_window():
    slots = mk([1, 2])
    plan = plan_cheapest(slots, T0, None, timedelta(hours=2), 1, 4.0)
    assert plan.insufficient_time
    assert plan.blocks[0].end - plan.blocks[0].start == timedelta(minutes=30)


def test_deadline_cut():
    slots = mk([5, 5, 1, 1])
    deadline = T0 + timedelta(minutes=30)
    plan = plan_cheapest(slots, T0, deadline, timedelta(minutes=15), 1, 4.0)
    assert plan.blocks[0].end <= deadline
    # slot crossing the deadline is excluded
    plan = plan_cheapest(slots, T0, T0 + timedelta(minutes=40), timedelta(minutes=45), 1, 4.0)
    assert plan.insufficient_time
    assert plan.blocks[-1].end == T0 + timedelta(minutes=30)


def test_hourly_slots():
    slots = mk([3, 1, 2], minutes=60)
    plan = plan_cheapest(slots, T0, None, timedelta(minutes=90), 1, 10.0)
    assert plan.blocks[0].start == T0 + timedelta(hours=1)
    assert plan.blocks[0].end == T0 + timedelta(hours=3)
    assert plan.cost == pytest.approx((1 + 2) * 10.0)


def test_zero_duration():
    plan = plan_cheapest(mk([1, 2]), T0, None, timedelta(0), 2, 4.0)
    assert plan.blocks == []
    assert plan.cost == 0.0


def test_non_contiguous_slots_split_blocks():
    a = mk([1, 1])
    b = [PriceSlot(T0 + timedelta(hours=2), T0 + timedelta(hours=2, minutes=15), 1)]
    plan = plan_cheapest(a + b, T0, None, timedelta(minutes=45), 2, 4.0)
    assert len(plan.blocks) == 2


def test_plan_round_trip():
    plan = plan_cheapest(mk([1, 2, 3]), T0, None, timedelta(minutes=30), 1, 4.0, "k")
    assert ChargePlan.from_dict(plan.to_dict()) == plan
