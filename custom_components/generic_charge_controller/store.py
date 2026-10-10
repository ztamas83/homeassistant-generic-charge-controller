"""Persistence layer for ChargeController."""

from __future__ import annotations

import copy
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CH_ID,
    DOMAIN,
    HH_ID,
    STORE_KEY_CHARGERS,
    STORE_KEY_HOUSEHOLDS,
    STORE_KEY_SETTINGS,
)

# v1: households keyed by Tibber device id, chargers with sensor strings per phase
# v2: households {name, fuse_a, l1_entity, l2_entity, l3_entity},
#     chargers {type, household_id, phase_map}
STORAGE_VERSION = 2
STORAGE_KEY = DOMAIN

_LOGGER = logging.getLogger(__name__)


class _ChargeControllerStorage(Store):
    """HA store that discards data from older storage versions."""

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict
    ) -> dict[str, Any]:
        _LOGGER.warning(
            "Discarding charge controller configuration from storage version %s",
            old_major_version,
        )
        return {}


class ChargeControllerStore:
    """Manage configuration storage for ChargeController."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise the store."""
        self._store = _ChargeControllerStorage(hass, STORAGE_VERSION, STORAGE_KEY)
        self._chargers: dict[str, dict] = {}
        self._households: dict[str, dict] = {}
        self._settings: dict = {}

    async def async_load(self) -> None:
        """Load store data from the HA store."""
        stored = await self._store.async_load() or {}
        self._chargers = stored.get(STORE_KEY_CHARGERS, {})
        self._households = stored.get(STORE_KEY_HOUSEHOLDS, {})
        self._settings = stored.get(STORE_KEY_SETTINGS, {})

    async def async_remove(self) -> None:
        """Remove the persisted data and clear the configuration."""
        await self._store.async_remove()
        self._chargers = {}
        self._households = {}
        self._settings = {}

    async def _async_save(self) -> None:
        """Persist current data to the HA store."""
        await self._store.async_save({
            STORE_KEY_CHARGERS: self._chargers,
            STORE_KEY_HOUSEHOLDS: self._households,
            STORE_KEY_SETTINGS: self._settings,
        })

    # Charger operations
    def get_chargers(self) -> dict[str, dict]:
        """Return a deep copy of all chargers."""
        return copy.deepcopy(self._chargers)

    def get_charger(self, charger_id: str) -> dict | None:
        """Return a deep copy of a single charger by ID."""
        charger = self._chargers.get(charger_id)
        if charger is None:
            return None
        return copy.deepcopy(charger)

    async def async_save_charger(self, charger_id: str, config: dict) -> dict:
        """Create or replace charger configuration."""
        self._chargers[charger_id] = {CH_ID: charger_id, **config}
        await self._async_save()
        return copy.deepcopy(self._chargers[charger_id])

    async def async_delete_charger(self, charger_id: str) -> None:
        """Delete a charger."""
        if charger_id in self._chargers:
            del self._chargers[charger_id]
            await self._async_save()

    # Household operations
    def get_households(self) -> dict[str, dict]:
        """Return a deep copy of all households."""
        return copy.deepcopy(self._households)

    def get_household(self, household_id: str) -> dict | None:
        """Return a deep copy of a single household by ID."""
        household = self._households.get(household_id)
        if household is None:
            return None
        return copy.deepcopy(household)

    async def async_save_household(self, household_id: str, config: dict) -> dict:
        """Create or replace household configuration."""
        self._households[household_id] = {HH_ID: household_id, **config}
        await self._async_save()
        return copy.deepcopy(self._households[household_id])

    async def async_delete_household(self, household_id: str) -> None:
        """Delete a household."""
        if household_id in self._households:
            del self._households[household_id]
            await self._async_save()

    # Settings operations
    def get_settings(self) -> dict:
        """Return a deep copy of global settings."""
        return copy.deepcopy(self._settings)

    async def async_save_settings(self, changes: dict) -> dict:
        """Merge changes into global settings and persist."""
        self._settings.update(changes)
        await self._async_save()
        return copy.deepcopy(self._settings)
