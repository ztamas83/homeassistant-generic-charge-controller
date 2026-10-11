"""Tests for LimitSender."""

from datetime import datetime, timedelta, timezone

from homeassistant.exceptions import HomeAssistantError

from custom_components.generic_charge_controller.control import LimitSender

T0 = datetime(2026, 1, 1, tzinfo=timezone.utc)


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


async def test_first_limits_are_sent():
    charger, sender = FakeCharger(), LimitSender(T0)

    assert await sender.async_apply(charger, limits(16, 16, 16), False, T0) == []
    assert charger.sent == [limits(16, 16, 16)]
    assert sender.last_sent == limits(16, 16, 16)
    assert sender.last_sent_at == T0


async def test_failsafe_held_during_startup_grace():
    charger, sender = FakeCharger(), LimitSender(T0)

    reasons = await sender.async_apply(charger, limits(0, 0, 0), True, T0 + timedelta(seconds=30))

    assert charger.sent == []
    assert reasons == ["Waiting for meter readings after start, limits not sent"]


async def test_failsafe_sent_after_startup_grace():
    charger, sender = FakeCharger(), LimitSender(T0)

    await sender.async_apply(charger, limits(0, 0, 0), True, T0 + timedelta(seconds=121))

    assert charger.sent == [limits(0, 0, 0)]


async def test_failsafe_sent_at_once_after_first_send():
    charger, sender = FakeCharger(), LimitSender(T0)
    await sender.async_apply(charger, limits(16, 16, 16), False, T0)

    await sender.async_apply(charger, limits(0, 0, 0), True, T0 + timedelta(seconds=5))

    assert charger.sent[-1] == limits(0, 0, 0)


async def test_decrease_is_sent_at_once():
    charger, sender = FakeCharger(), LimitSender(T0)
    await sender.async_apply(charger, limits(16, 16, 16), False, T0)

    # One phase lower, another higher: the decrease wins
    await sender.async_apply(charger, limits(10, 17, 16), False, T0 + timedelta(seconds=5))

    assert charger.sent[-1] == limits(10, 17, 16)


async def test_increase_is_delayed():
    charger, sender = FakeCharger(), LimitSender(T0)
    await sender.async_apply(charger, limits(10, 10, 10), False, T0)

    reasons = await sender.async_apply(charger, limits(12, 10, 10), False, T0 + timedelta(seconds=45))
    assert len(charger.sent) == 1
    assert reasons == ["Increase delayed to limit how often limits change"]

    await sender.async_apply(charger, limits(12, 10, 10), False, T0 + timedelta(seconds=60))
    assert charger.sent[-1] == limits(12, 10, 10)


async def test_unchanged_limits_are_resent_after_reconcile_interval():
    charger, sender = FakeCharger(), LimitSender(T0)
    await sender.async_apply(charger, limits(16, 16, 16), False, T0)

    await sender.async_apply(charger, limits(16, 16, 16), False, T0 + timedelta(seconds=299))
    assert len(charger.sent) == 1

    await sender.async_apply(charger, limits(16, 16, 16), False, T0 + timedelta(seconds=300))
    assert len(charger.sent) == 2


async def test_failed_send_is_retried():
    charger, sender = FakeCharger(), LimitSender(T0)
    charger.fail = True

    reasons = await sender.async_apply(charger, limits(16, 16, 16), False, T0)
    assert reasons == ["Sending limits failed: cloud unreachable"]
    assert sender.last_sent is None

    charger.fail = False
    await sender.async_apply(charger, limits(16, 16, 16), False, T0 + timedelta(seconds=45))
    assert charger.sent == [limits(16, 16, 16)]
