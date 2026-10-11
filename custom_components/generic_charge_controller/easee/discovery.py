"""Discovery of Easee chargers through the HA device and entity registries."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .const import (
    CHRG_DOMAIN,
    S_NAME_CIRCUITCURRENT,
    S_NAME_MAX_CIRCUIT_LIMIT,
    S_NAME_POWER,
    S_NAME_STATUS,
)

ENTITY_KEYS = (
    S_NAME_STATUS,
    S_NAME_POWER,
    S_NAME_CIRCUITCURRENT,
    S_NAME_MAX_CIRCUIT_LIMIT,
)


def _entity_key(entry: er.RegistryEntry, serial: str) -> str | None:
    """Return which Easee value an entity provides.

    Easee unique ids look like "<serial>_<key>", e.g. "EHXXXXXX_circuit_current".
    Falls back to the entity id suffix if the unique id does not follow that pattern.
    """
    prefix = f"{serial}_"
    if entry.unique_id.startswith(prefix):
        key = entry.unique_id[len(prefix):]
        return key if key in ENTITY_KEYS else None
    for key in ENTITY_KEYS:
        if entry.entity_id.endswith(f"_{key}"):
            return key
    return None


def async_discover_easee_chargers(hass: HomeAssistant) -> list[dict]:
    """Return Easee chargers with the entity ids of their relevant sensors."""
    dev_reg = dr.async_get(hass)
    ent_reg = er.async_get(hass)
    chargers = []

    for device in dev_reg.devices:
        serial = next(
            (ident for domain, ident in device.identifiers if domain == CHRG_DOMAIN),
            None,
        )
        if serial is None:
            continue

        entities: dict[str, str] = {}
        disabled: set[str] = set()
        for entry in er.async_entries_for_device(
            ent_reg, device.id, include_disabled_entities=True
        ):
            if entry.platform != CHRG_DOMAIN:
                continue
            if key := _entity_key(entry, serial):
                if entry.disabled_by is not None:
                    disabled.add(key)
                else:
                    entities.setdefault(key, entry.entity_id)

        # Devices without a status sensor are not chargers (e.g. Equalizer)
        if S_NAME_STATUS not in entities:
            continue

        chargers.append({
            "device_id": device.id,
            "name": device.name_by_user or device.name or serial,
            "serial": serial,
            "model": device.model,
            "entities": entities,
            # Entities that exist but are disabled in HA, e.g. circuit_current by default
            "disabled_entities": sorted(disabled - entities.keys()),
        })

    return sorted(chargers, key=lambda c: c["name"])
