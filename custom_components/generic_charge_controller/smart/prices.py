"""Price providers."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from datetime import date, datetime, timedelta

from homeassistant.const import CONF_CURRENCY
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util

from .models import PriceSlot

_LOGGER = logging.getLogger(__name__)


class PriceProvider(ABC):
    """Source of price slots."""

    @property
    def currency(self) -> str | None:
        """Currency of the prices, None when unknown."""
        return None

    @abstractmethod
    async def async_get_slots(self, now: datetime) -> list[PriceSlot]:
        """Return known price slots, sorted by start."""


class NordPoolPriceProvider(PriceProvider):
    """Prices from the core nordpool integration (per kWh)."""

    def __init__(self, hass: HomeAssistant, config_entry_id: str, area: str) -> None:
        self._hass = hass
        self._entry = config_entry_id
        self._area = area
        self._cache: dict[date, list[PriceSlot]] = {}
        self._today: date | None = None

    @property
    def currency(self) -> str | None:
        """Currency configured on the Nord Pool config entry."""
        entry = self._hass.config_entries.async_get_entry(self._entry)
        return entry.data.get(CONF_CURRENCY) if entry else None

    @property
    def tomorrow_available(self) -> bool:
        """True when tomorrow's prices are cached."""
        today = self._today or dt_util.now().date()
        return (today + timedelta(days=1)) in self._cache

    async def _fetch(self, day: date) -> list[PriceSlot]:
        try:
            resp = await self._hass.services.async_call(
                "nordpool",
                "get_prices_for_date",
                {"config_entry": self._entry, "date": day.isoformat(), "areas": [self._area]},
                blocking=True,
                return_response=True,
            )
        except HomeAssistantError as err:  # includes ServiceValidationError
            _LOGGER.debug("Nord Pool fetch for %s failed: %s", day, err)
            return []
        slots: list[PriceSlot] = []
        for item in (resp or {}).get(self._area, []):
            try:
                slots.append(
                    PriceSlot(
                        dt_util.parse_datetime(item["start"]),  # type: ignore[arg-type]
                        dt_util.parse_datetime(item["end"]),  # type: ignore[arg-type]
                        float(item["price"]) / 1000,
                    )
                )
            except (KeyError, TypeError, ValueError):
                continue
        return slots

    async def async_get_slots(self, now: datetime) -> list[PriceSlot]:
        """Return cached/fetched slots for local today and tomorrow."""
        today = dt_util.as_local(now).date()
        self._today = today
        for old in [d for d in self._cache if d < today - timedelta(days=1)]:
            del self._cache[old]
        for day in (today, today + timedelta(days=1)):
            if day not in self._cache:
                slots = await self._fetch(day)
                if slots:
                    self._cache[day] = slots
        return sorted(
            (s for slots in self._cache.values() for s in slots),
            key=lambda s: s.start,
        )
