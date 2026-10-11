"""Tests for LimitSender and OverloadDetector."""

from datetime import datetime, timedelta, timezone

from homeassistant.exceptions import HomeAssistantError

from custom_components.generic_charge_controller.control import (
    LimitSender,
    OverloadDetector,
)

T0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
INTERVAL = timedelta(seconds=30)


class FakeCharger:
    def __init__(self) -> None:
        self.sent: list[dict[str, int]] = []
        self.fail = False

    async def async_set_limits(self, limits: dict[str, int]) -> None:
        if self.fail:
            raise HomeAssistantError("cloud unreachable")
        self.sent.append(limits)


def limits(p1, p2, p3) -> dict[str, int]:
    return {"P1": p1, "P2": p2, "P3": p3}


def at(seconds: float) -> datetime:
    return T0 + timedelta(seconds=seconds)


async def apply(sender, charger, values, seconds, failsafe=False, overload=False):
    return await sender.async_apply(charger, values, failsafe, overload, at(seconds))


# LimitSender


async def test_first_limits_are_sent():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)

    assert await apply(sender, charger, limits(16, 16, 16), 0) == (False, [])
    assert charger.sent == [limits(16, 16, 16)]
    assert sender.last_sent == limits(16, 16, 16)
    assert sender.last_sent_at == T0


async def test_changes_wait_for_update_interval():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    await apply(sender, charger, limits(16, 16, 16), 0)

    pending, reasons = await apply(sender, charger, limits(10, 16, 16), 20)
    assert pending
    assert reasons == ["New limits are sent in 10 s (charger update interval)"]
    assert len(charger.sent) == 1
    assert sender.seconds_until_due(at(20)) == 10

    await apply(sender, charger, limits(10, 16, 16), 30)
    assert charger.sent[-1] == limits(10, 16, 16)


async def test_increase_waits_for_update_interval():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    await apply(sender, charger, limits(10, 10, 10), 0)

    await apply(sender, charger, limits(12, 10, 10), 29)
    assert len(charger.sent) == 1

    await apply(sender, charger, limits(12, 10, 10), 31)
    assert charger.sent[-1] == limits(12, 10, 10)


async def test_overload_sends_decrease_at_once():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    await apply(sender, charger, limits(16, 16, 16), 0)

    await apply(sender, charger, limits(0, 16, 16), 12, overload=True)

    assert charger.sent[-1] == limits(0, 16, 16)


async def test_overload_does_not_send_increase_early():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    await apply(sender, charger, limits(6, 6, 6), 0)

    await apply(sender, charger, limits(8, 6, 6), 12, overload=True)

    assert len(charger.sent) == 1


async def test_failsafe_held_during_startup_grace():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)

    pending, reasons = await apply(sender, charger, limits(0, 0, 0), 30, failsafe=True)

    assert charger.sent == []
    assert pending
    assert reasons == ["Waiting for meter readings after start, limits not sent"]


async def test_failsafe_sent_after_startup_grace():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)

    await apply(sender, charger, limits(0, 0, 0), 121, failsafe=True)

    assert charger.sent == [limits(0, 0, 0)]


async def test_unchanged_limits_are_resent_after_reconcile_interval():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    await apply(sender, charger, limits(16, 16, 16), 0)

    assert await apply(sender, charger, limits(16, 16, 16), 299) == (False, [])
    assert len(charger.sent) == 1

    await apply(sender, charger, limits(16, 16, 16), 300)
    assert len(charger.sent) == 2


async def test_failed_send_is_retried():
    charger, sender = FakeCharger(), LimitSender(T0, INTERVAL)
    charger.fail = True

    pending, reasons = await apply(sender, charger, limits(16, 16, 16), 0)
    assert pending
    assert reasons == ["Sending limits failed: cloud unreachable"]
    assert sender.last_sent is None

    charger.fail = False
    await apply(sender, charger, limits(16, 16, 16), 5)
    assert charger.sent == [limits(16, 16, 16)]


# OverloadDetector (fuse 20 A -> threshold 30 A)


def test_overload_must_last_10_seconds():
    detector = OverloadDetector()

    assert detector.update({"L1": 31, "L2": 5, "L3": 5}, 20, at(0)) == (False, 10)
    assert detector.update({"L1": 31, "L2": 5, "L3": 5}, 20, at(6)) == (False, 4)
    assert detector.update({"L1": 31, "L2": 5, "L3": 5}, 20, at(10.5)) == (True, None)


def test_overload_at_threshold_is_not_overload():
    detector = OverloadDetector()

    assert detector.update({"L1": 30, "L2": 30, "L3": 30}, 20, at(0)) == (False, None)


def test_overload_restarts_after_drop():
    detector = OverloadDetector()
    detector.update({"L1": 31, "L2": 0, "L3": 0}, 20, at(0))
    detector.update({"L1": 25, "L2": 0, "L3": 0}, 20, at(8))

    assert detector.update({"L1": 31, "L2": 0, "L3": 0}, 20, at(12)) == (False, 10)


def test_unknown_load_restarts_overload():
    detector = OverloadDetector()
    detector.update({"L1": 31, "L2": 0, "L3": 0}, 20, at(0))
    detector.update({"L1": None, "L2": 0, "L3": 0}, 20, at(5))

    assert detector.update({"L1": 31, "L2": 0, "L3": 0}, 20, at(11)) == (False, 10)
