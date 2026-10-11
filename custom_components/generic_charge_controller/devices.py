"""Devices of the integration and removal of devices and entities that no longer exist."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

MANUFACTURER = "Generic Charge Controller"


def household_device_identifier(household_id: str) -> tuple[str, str]:
    return (DOMAIN, f"household_{household_id}")


def charger_device_identifier(charger_id: str) -> tuple[str, str]:
    return (DOMAIN, f"charger_{charger_id}")


def household_device_info(household_id: str, name: str) -> DeviceInfo:
    """Device representing a household."""
    return DeviceInfo(
        identifiers={household_device_identifier(household_id)},
        name=name,
        manufacturer=MANUFACTURER,
        model="Household",
        entry_type=DeviceEntryType.SERVICE,
    )


def charger_device_info(hass: HomeAssistant, charger_id: str) -> DeviceInfo:
    """Device representing load balancing for a charger, linked to the charger device."""
    charger_device = dr.async_get(hass).async_get(charger_id)
    name = "Charger"
    if charger_device is not None:
        name = charger_device.name_by_user or charger_device.name or name

    info = DeviceInfo(
        identifiers={charger_device_identifier(charger_id)},
        name=f"{name} load balancing",
        manufacturer=MANUFACTURER,
        model="Charger load balancing",
        entry_type=DeviceEntryType.SERVICE,
    )
    if charger_device is not None:
        info["via_device_id"] = charger_device.id
    return info


@callback
def async_remove_stale(
    hass: HomeAssistant,
    entry: ConfigEntry,
    unique_ids: set[str],
    device_identifiers: set[tuple[str, str]],
) -> None:
    """Remove entities and devices of the entry that are not in the given sets."""
    ent_reg = er.async_get(hass)
    for reg_entry in er.async_entries_for_config_entry(ent_reg, entry.entry_id):
        if reg_entry.unique_id not in unique_ids:
            _LOGGER.debug("Removing stale entity %s", reg_entry.entity_id)
            ent_reg.async_remove(reg_entry.entity_id)

    dev_reg = dr.async_get(hass)
    for device in dr.async_entries_for_config_entry(dev_reg, entry.entry_id):
        if not device.identifiers & device_identifiers:
            _LOGGER.debug("Removing stale device %s", device.name)
            dev_reg.async_remove_device(device.id)
