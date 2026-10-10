"""Unique ids of the integration's entities, shared by the sensors and the WebSocket API."""

from __future__ import annotations

from .const import CHARGER_PHASES, DOMAIN

# Keys of the per-charger values in the coordinator data, one sensor each
CHARGER_DATA_KEYS = [
    *(f"target_current_{phase}" for phase in CHARGER_PHASES),
    *(f"charger_current_{phase}" for phase in CHARGER_PHASES),
    "mode",
]


def household_load_unique_id(household_id: str, phase: str) -> str:
    """Unique id of a household load sensor (phase L1-L3)."""
    return f"{DOMAIN}_household_{household_id}_load_{phase.lower()}"


def charger_unique_id(charger_id: str, data_key: str) -> str:
    """Unique id of a charger sensor (data_key from CHARGER_DATA_KEYS)."""
    return f"{DOMAIN}_{charger_id}_{data_key.lower()}"

