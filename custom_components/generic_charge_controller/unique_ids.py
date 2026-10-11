"""Unique ids of the integration's entities, shared by the sensors and the WebSocket API."""

from __future__ import annotations

from .const import CHARGER_PHASES, DOMAIN, PHASES

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



# Key of the per-charger switch that enables sending limits to the charger
CONTROL_SWITCH_KEY = "load_balancing_active"


def expected_unique_ids(household_ids, charger_ids) -> set[str]:
    """Unique ids of all entities that should exist for the stored configuration."""
    return {
        *(household_load_unique_id(h, p) for h in household_ids for p in PHASES),
        *(
            charger_unique_id(c, key)
            for c in charger_ids
            for key in (*CHARGER_DATA_KEYS, CONTROL_SWITCH_KEY)
        ),
    }
