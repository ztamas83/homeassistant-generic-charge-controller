"""Room persistence layer for RoomMind."""

from __future__ import annotations

import copy

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DOMAIN,
    STORE_KEY_CHARGERS,
    STORE_KEY_MEASUREMENT_DATA,
    STORE_KEY_SETTINGS
)

from .abstract_charger import ChargerConfiguration


STORAGE_VERSION = 1
STORAGE_KEY = DOMAIN


class ChargeControllerStore:
    """Manage charger configuration storage for ChargeController."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialise the store."""
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, dict] = {}
        self._settings: dict = {}
        self._measurement_data: dict = {}

    async def async_load(self) -> None:
        """Load store data from the HA store."""
        stored = await self._store.async_load()
        
        self._data = stored.get(STORE_KEY_CHARGERS, {}) if stored else {}
        self._settings = stored.get(STORE_KEY_SETTINGS, {}) if stored else {}
        self._measurement_data = stored.get(STORE_KEY_MEASUREMENT_DATA, {}) if stored else {}

    async def _async_save(self) -> None:
        """Persist current charger data to the HA store."""
        await self._store.async_save({STORE_KEY_CHARGERS: self._data, STORE_KEY_SETTINGS: self._settings, STORE_KEY_MEASUREMENT_DATA: self._measurement_data})

    def get_chargers(self) -> dict[str, dict]:
        """Return a deep copy of all chargers."""
        chargers = copy.deepcopy(dict(self._data))
        return chargers

    def get_charger(self, charger_id: str) -> dict | None:
        """Return a deep copy of a single charger by ID, or None if not found."""
        charger = self._data.get(charger_id)
        if charger is None:
            return None
        result = copy.deepcopy(charger)
        return result

    def get_settings(self) -> dict:
        """Return a deep copy of global settings."""
        return copy.deepcopy(dict(self._settings))

    async def async_save_settings(self, changes: dict) -> dict:
        """Merge changes into global settings and persist."""
        self._settings.update(changes)
        await self._async_save()
        return dict(self._settings)

    def get_measurement_data(self) -> dict:
        """Return a deep copy of measurement data."""
        return copy.deepcopy(dict(self._measurement_data))

    async def async_save_measurement_data(self, data: dict) -> None:
        """Replace measurement data and persist."""
        self._measurement_data = data
        await self._async_save()

    async def async_clear_measurement_data_room(self, area_id: str) -> None:
        """Clear measurement data for a single room."""
        self._measurement_data.pop(area_id, None)
        await self._async_save()

    async def async_clear_all_measurement_data(self) -> None:
        """Clear all measurement data."""
        self._measurement_data = {}
        await self._async_save()

    async def async_save_charger(self, charger: ChargerConfiguration) -> dict:
        """Create or update charger configuration for a charger."""
        charger_id = charger.charger_id
        if charger_id in self._data:
            # Update existing
            existing = self._data[charger_id]
            for key, value in charger.items():
                if key != "charger_id":
                    existing[key] = value
                        
            await self._async_save()
            return existing
        else:
            # Create new 
            charger = {
                "charger_id": charger_id,
                # "area_id": area_id,
                # "charger_id": charger_id,
                # "thermostats": config.get("thermostats", []),
                # "acs": config.get("acs", []),
                # "temperature_sensor": config.get("temperature_sensor", ""),
                # "humidity_sensor": config.get("humidity_sensor", ""),
                # "climate_mode": config.get("climate_mode", "auto"),
                # "schedules": config.get("schedules", []),
                # "schedule_selector_entity": config.get("schedule_selector_entity", ""),
                # "window_sensors": config.get("window_sensors", []),
                # "window_open_delay": config.get("window_open_delay", 0),
                # "window_close_delay": config.get("window_close_delay", 0),
                # "comfort_temp": comfort_heat,
                # "eco_temp": eco_heat,
                # "comfort_heat": comfort_heat,
                # "comfort_cool": config.get("comfort_cool", DEFAULT_COMFORT_COOL),
                # "eco_heat": eco_heat,
                # "eco_cool": config.get("eco_cool", DEFAULT_ECO_COOL),
                # "presence_persons": config.get("presence_persons", []),
                # "display_name": config.get("display_name", ""),
                # "heating_system_type": config.get("heating_system_type", ""),
            }
            self._data[charger_id] = charger
            await self._async_save()
            return charger

    async def async_update_charger(self, charger_id: str, changes: dict) -> dict:
        """Merge changes into an existing charger. Raises KeyError if not found."""
        if charger_id not in self._data:
            raise KeyError(f"Charger '{charger_id}' not found")

        # Prevent overriding the charger_id
        changes.pop("charger_id", None)

        self._data[charger_id].update(changes)
        await self._async_save()
        return self._data[charger_id]

    async def async_delete_charger(self, charger_id: str) -> None:
        """Delete a charger. Raises KeyError if not found."""
        if charger_id not in self._data:
            raise KeyError(f"Charger '{charger_id}' not found")

        del self._data[charger_id]
        await self._async_save()
