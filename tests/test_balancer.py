"""Tests for SafeLoadBalancer."""

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.generic_charge_controller.loadbalancer.balancer import (
    BalancerConfig,
    PhaseLoad,
    SafeLoadBalancer,
)

T0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
CONFIG = BalancerConfig(fuse_a=20, safety_margin_a=1, min_current_a=6, ramp_up_a_per_min=2)


def loads(l1, l2, l3, charger=(0.0, 0.0, 0.0)) -> dict[str, PhaseLoad]:
    return {
        phase: PhaseLoad(household_a=h, charger_a=c)
        for phase, h, c in zip(("L1", "L2", "L3"), (l1, l2, l3), charger)
    }


@pytest.mark.parametrize(
    ("phase_loads", "max_current", "expected", "limited"),
    [
        # Nothing else running: fuse 20 - margin 1 = 19 A
        (loads(0, 0, 0), None, {"L1": 19, "L2": 19, "L3": 19}, False),
        # Charger max below the fuse limit caps the target
        (loads(0, 0, 0), 16, {"L1": 16, "L2": 16, "L3": 16}, False),
        # Charger share is subtracted: other load 2, 1, 2 A
        (loads(10, 5, 2, charger=(8, 4, 0)), 16, {"L1": 16, "L2": 16, "L3": 16}, False),
        # Other load is rounded up: 4.1 A counts as 5 A
        (loads(4.1, 0, 0), None, {"L1": 14, "L2": 19, "L3": 19}, True),
        # Below the minimum charging current a phase is paused
        (loads(14.5, 0, 0), None, {"L1": 0, "L2": 19, "L3": 19}, True),
        # Unknown charger current counts as 0 A (other load = household load)
        (loads(10, 0, 0, charger=(None, 0, 0)), None, {"L1": 9, "L2": 19, "L3": 19}, True),
        # Load above the fuse never gives a negative target
        (loads(30, 0, 0), None, {"L1": 0, "L2": 19, "L3": 19}, True),
    ],
)
def test_targets(phase_loads, max_current, expected, limited):
    result = SafeLoadBalancer(CONFIG).calculate(phase_loads, max_current, T0)

    assert result.targets == expected
    assert result.limited is limited
    assert not result.failsafe


def test_unknown_household_load_is_failsafe():
    result = SafeLoadBalancer(CONFIG).calculate(loads(5, None, 5), 16, T0)

    assert result.failsafe
    assert result.targets == {"L1": 0, "L2": 0, "L3": 0}
    assert result.reasons == ["No valid household load for L2"]


def test_unknown_charger_current_is_reported():
    result = SafeLoadBalancer(CONFIG).calculate(
        loads(5, 5, 5, charger=(None, 1, None)), 16, T0
    )

    assert result.reasons == ["Charger current unknown for L1, L3, assuming 0 A"]


def test_spike_applies_immediately():
    balancer = SafeLoadBalancer(CONFIG)
    balancer.calculate(loads(2, 2, 2), None, T0)

    result = balancer.calculate(loads(9, 2, 2), None, T0 + timedelta(seconds=10))

    assert result.targets["L1"] == 10


def test_recovery_ramps_up():
    balancer = SafeLoadBalancer(CONFIG)
    balancer.calculate(loads(9, 0, 0), None, T0)  # L1 headroom 10

    # Load gone: headroom 19, but at most 2 A/min increase
    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(minutes=1))
    assert result.targets["L1"] == 12

    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(minutes=2, seconds=30))
    assert result.targets["L1"] == 15

    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(minutes=10))
    assert result.targets["L1"] == 19


def test_ramp_starts_from_paused_headroom():
    balancer = SafeLoadBalancer(CONFIG)
    balancer.calculate(loads(16, 0, 0), None, T0)  # headroom 3 -> paused

    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(minutes=1))
    assert result.targets["L1"] == 0  # headroom 5, still below 6 A

    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(minutes=2))
    assert result.targets["L1"] == 7


def test_failsafe_resets_history():
    balancer = SafeLoadBalancer(CONFIG)
    balancer.calculate(loads(9, 0, 0), None, T0)
    balancer.calculate(loads(None, 0, 0), None, T0 + timedelta(seconds=10))

    result = balancer.calculate(loads(0, 0, 0), None, T0 + timedelta(seconds=20))

    assert result.targets["L1"] == 19
