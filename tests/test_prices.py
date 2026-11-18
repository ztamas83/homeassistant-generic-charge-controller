"""Tests for price providers."""

from __future__ import annotations

from datetime import datetime, timezone

from homeassistant.core import SupportsResponse
from homeassistant.exceptions import ServiceValidationError

from custom_components.generic_charge_controller.smart.prices import NordPoolPriceProvider

NOW = datetime(2026, 1, 1, 10, 0, tzinfo=timezone.utc)


def register(hass, per_date, calls):
    async def handler(call):
        calls.append(call.data["date"])
        val = per_date.get(call.data["date"], [])
        if isinstance(val, Exception):
            raise val
        return {"SE3": val}

    hass.services.async_register(
        "nordpool", "get_prices_for_date", handler, supports_response=SupportsResponse.ONLY
    )


def day(date, price):
    return [
        {"start": f"{date}T{h:02d}:00:00+00:00", "end": f"{date}T{h + 1:02d}:00:00+00:00",
         "price": price}
        for h in range(2)
    ]


async def test_fetch_convert_and_cache(hass):
    calls: list[str] = []
    register(hass, {"2026-01-01": day("2026-01-01", 500.0)}, calls)
    p = NordPoolPriceProvider(hass, "eid", "SE3")
    slots = await p.async_get_slots(NOW)
    assert len(slots) == 2 and slots[0].price == 0.5
    assert not p.tomorrow_available
    await p.async_get_slots(NOW)
    # today cached, tomorrow (empty) retried
    assert calls == ["2026-01-01", "2026-01-02", "2026-01-02"]


async def test_tomorrow_arrives(hass):
    calls: list[str] = []
    data = {"2026-01-01": day("2026-01-01", 100.0)}
    register(hass, data, calls)
    p = NordPoolPriceProvider(hass, "eid", "SE3")
    await p.async_get_slots(NOW)
    data["2026-01-02"] = day("2026-01-02", 200.0)
    slots = await p.async_get_slots(NOW)
    assert p.tomorrow_available
    assert len(slots) == 4 and slots == sorted(slots, key=lambda s: s.start)


async def test_error_not_cached(hass):
    calls: list[str] = []
    data = {"2026-01-01": ServiceValidationError("boom")}
    register(hass, data, calls)
    p = NordPoolPriceProvider(hass, "eid", "SE3")
    assert await p.async_get_slots(NOW) == []
    data["2026-01-01"] = day("2026-01-01", 100.0)
    assert len(await p.async_get_slots(NOW)) == 2


async def test_old_entries_dropped(hass):
    calls: list[str] = []
    register(hass, {"2026-01-01": day("2026-01-01", 100.0)}, calls)
    p = NordPoolPriceProvider(hass, "eid", "SE3")
    await p.async_get_slots(NOW)
    later = datetime(2026, 1, 4, 10, 0, tzinfo=timezone.utc)
    assert await p.async_get_slots(later) == []


async def test_currency_from_config_entry(hass):
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    MockConfigEntry(
        domain="nordpool", entry_id="np", data={"currency": "SEK", "areas": ["SE3"]}
    ).add_to_hass(hass)
    assert NordPoolPriceProvider(hass, "np", "SE3").currency == "SEK"


async def test_currency_none_when_entry_missing(hass):
    assert NordPoolPriceProvider(hass, "missing", "SE3").currency is None
