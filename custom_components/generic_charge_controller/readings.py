"""Reading current values from HA states, rejecting anything that cannot be trusted."""

from __future__ import annotations

import logging
import math
from datetime import datetime, timedelta

from homeassistant.const import (
    ATTR_UNIT_OF_MEASUREMENT,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
    UnitOfElectricCurrent,
)
from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)

# Factor to convert a current sensor's unit to ampere
_CURRENT_UNIT_FACTORS = {
    UnitOfElectricCurrent.AMPERE: 1.0,
    UnitOfElectricCurrent.MILLIAMPERE: 0.001,
}

_unit_warned: set[str] = set()


def read_current_a(
    hass: HomeAssistant,
    entity_id: str | None,
    *,
    attribute: str | None = None,
    stale_after: timedelta | None = None,
    now: datetime | None = None,
) -> float | None:
    """Return a current in ampere, or None if the value cannot be trusted.

    The value is the entity state, or one of its attributes. The entity's unit
    applies to the attribute as well. A value is not trusted when the entity is
    missing, unavailable, not numeric, has a unit other than A or mA, or has not
    been reported for longer than stale_after.
    """
    if not entity_id:
        return None

    state = hass.states.get(entity_id)
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None

    if stale_after is not None:
        now = now or dt_util.utcnow()
        if now - state.last_reported > stale_after:
            return None

    raw = state.attributes.get(attribute) if attribute else state.state
    try:
        value = float(raw)
    except (ValueError, TypeError):
        return None
    if not math.isfinite(value):
        return None

    unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)
    factor = _CURRENT_UNIT_FACTORS.get(unit)
    if factor is None:
        if entity_id not in _unit_warned:
            _unit_warned.add(entity_id)
            _LOGGER.warning(
                "Sensor %s has unit %s, expected A or mA; ignoring its value",
                entity_id,
                unit,
            )
        return None

    return value * factor
