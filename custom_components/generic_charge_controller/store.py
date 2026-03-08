"""Persistence layer for ChargeController."""

from __future__ import annotations

import copy
import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DOMAIN,
    STORE_KEY_CHARGERS,
    STORE_KEY_HOUSEHOLDS,
    STORE_KEY_MEASUREMENT_DATA,
    STORE_KEY_SETTINGS
)

STORAGE_VERSION = 1
STORAGE_KEY = DOMAIN

_LOGGER = logging.getLogger(__name__)

class ChargeControllerStore:
    """Manage configuration storage for ChargeController."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise the store."""
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._chargers: dict[str, dict] = {}
        self._households: dict[str, dict] = {}
        self._settings: dict = {}
        self._measurement_data: dict = {}

    async def async_load(self) -> None:
        """Load store data from the HA store."""
        stored = await self._store.async_load()
        if stored:
            self._chargers = stored.get(STORE_KEY_CHARGERS, {})
            self._households = stored.get(STORE_KEY_HOUSEHOLDS, {})
            self._settings = stored.get(STORE_KEY_SETTINGS, {})
            self._measurement_data = stored.get(STORE_KEY_MEASUREMENT_DATA, {})
        else:
            self._chargers = {}
            self._households = {}
            self._settings = {}
            self._measurement_data = {}

    async def _async_save(self) -> None:
        """Persist current data to the HA store."""
        await self._store.async_save({
            STORE_KEY_CHARGERS: self._chargers,
            STORE_KEY_HOUSEHOLDS: self._households,
            STORE_KEY_SETTINGS: self._settings, 
            STORE_KEY_MEASUREMENT_DATA: self._measurement_data
        })

    # Charger operations
    def get_chargers(self) -> dict[str, dict]:
        """Return a deep copy of all chargers."""
        return copy.deepcopy(dict(self._chargers))

    def get_charger(self, charger_id: str) -> dict | None:
        """Return a deep copy of a single charger by ID."""
        charger = self._chargers.get(charger_id)
        if charger is None:
            return None
        return copy.deepcopy(charger)

    async def async_save_charger(self, charger_id: str, config: dict) -> dict:
        """Create or update charger configuration."""
        if charger_id in self._chargers:
            self._chargers[charger_id].update(config)
        else:
            self._chargers[charger_id] = {"charger_id": charger_id, **config}
        
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
        return copy.deepcopy(dict(self._households))

    def get_household(self, device_id: str) -> dict | None:
        """Return a deep copy of a single household by device ID."""
        household = self._households.get(device_id)
        if household is None:
            return None
        return copy.deepcopy(household)

    async def async_save_household(self, device_id: str, config: dict) -> dict:
        """Create or update household configuration."""
        if device_id in self._households:
            self._households[device_id].update(config)
        else:
            self._households[device_id] = {"device_id": device_id, **config}
        
        await self._async_save()
        return copy.deepcopy(self._households[device_id])

    async def async_delete_household(self, device_id: str) -> None:
        """Delete a household."""
        if device_id in self._households:
            del self._households[device_id]
            await self._async_save()

    # Settings operations
    def get_settings(self) -> dict:
        """Return a deep copy of global settings."""
        return copy.deepcopy(dict(self._settings))

    async def async_save_settings(self, changes: dict) -> dict:
        """Merge changes into global settings and persist."""
        self._settings.update(changes)
        await self._async_save()
        return copy.deepcopy(dict(self._settings))

    # Measurement data operations
    def get_measurement_data(self) -> dict:
        """Return a deep copy of measurement data."""
        return copy.deepcopy(dict(self._measurement_data))

    async def async_save_measurement_data(self, data: dict) -> None:
        """Replace measurement data and persist."""
        self._measurement_data = data
        await self._async_save()
