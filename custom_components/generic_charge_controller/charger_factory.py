"""Create charger objects from stored charger configuration."""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.core import HomeAssistant

from .abstract_charger import AbstractCharger
from .const import CH_TYPE, CHARGER_TYPE_EASEE
from .easee.charger import EaseeCharger


def create_charger(
    hass: HomeAssistant,
    charger_id: str,
    config: dict,
    stale_after: timedelta | None = None,
    now: datetime | None = None,
) -> AbstractCharger:
    """Return the charger implementation for a stored charger config."""
    charger_type = config.get(CH_TYPE)
    if charger_type == CHARGER_TYPE_EASEE:
        return EaseeCharger(hass, charger_id, stale_after=stale_after, now=now)
    raise ValueError(f"Unsupported charger type: {charger_type}")
