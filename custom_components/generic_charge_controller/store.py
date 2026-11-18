"""Persistence layer for ChargeController."""

from __future__ import annotations

import copy
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    CH_ID,
    DEFAULT_SETTINGS,
    DOMAIN,
    EV_ID,
    HH_ID,
    STORE_KEY_EVS,
    STORE_KEY_CHARGERS,
    STORE_KEY_HOUSEHOLDS,
    STORE_KEY_SETTINGS,
)

# v1: households keyed by Tibber device id, chargers with sensor strings per phase
# v2: households {name, fuse_a, l1_entity, l2_entity, l3_entity},
#     chargers {type, household_id, phase_map}
# v3: adds evs, households gain optional price_config_entry and price_area
STORAGE_VERSION = 3
STORAGE_KEY = DOMAIN

_LOGGER = logging.getLogger(__name__)


class _ChargeControllerStorage(Store):
    """HA store that migrates v2 data and discards older storage versions."""

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: dict
    ) -> dict[str, Any]:
        if old_major_version == 2:
            return {**old_data, STORE_KEY_EVS: old_data.get(STORE_KEY_EVS, {})}
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
        self._evs: dict[str, dict] = {}
        self._settings: dict = {}

    async def async_load(self) -> None:
        """Load store data from the HA store."""
        stored = await self._store.async_load() or {}
        self._chargers = stored.get(STORE_KEY_CHARGERS, {})
        self._households = stored.get(STORE_KEY_HOUSEHOLDS, {})
        self._evs = stored.get(STORE_KEY_EVS, {})
        self._settings = stored.get(STORE_KEY_SETTINGS, {})

    async def async_remove(self) -> None:
        """Remove the persisted data and clear the configuration."""
        await self._store.async_remove()
        self._chargers = {}
        self._households = {}
        self._evs = {}
        self._settings = {}

    async def _async_save(self) -> None:
        """Persist current data to the HA store."""
        await self._store.async_save({
            STORE_KEY_CHARGERS: self._chargers,
            STORE_KEY_HOUSEHOLDS: self._households,
            STORE_KEY_EVS: self._evs,
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

    # EV operations
    def get_evs(self) -> dict[str, dict]:
        """Return a deep copy of all EVs."""
        return copy.deepcopy(self._evs)

    def get_ev(self, ev_id: str) -> dict | None:
        """Return a deep copy of a single EV by ID."""
        ev = self._evs.get(ev_id)
        if ev is None:
            return None
        return copy.deepcopy(ev)

    async def async_save_ev(self, ev_id: str, config: dict) -> dict:
        """Create or replace EV configuration."""
        self._evs[ev_id] = {EV_ID: ev_id, **config}
        await self._async_save()
        return copy.deepcopy(self._evs[ev_id])

    async def async_delete_ev(self, ev_id: str) -> None:
        """Delete an EV."""
        if ev_id in self._evs:
            del self._evs[ev_id]
            await self._async_save()

    # Settings operations
    def get_settings(self) -> dict:
        """Return global settings, with defaults for settings never saved."""
        return {**DEFAULT_SETTINGS, **copy.deepcopy(self._settings)}

    async def async_save_settings(self, changes: dict) -> dict:
        """Merge changes into global settings and persist."""
        self._settings.update(changes)
        await self._async_save()
        return self.get_settings()
