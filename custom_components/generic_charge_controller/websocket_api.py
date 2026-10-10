"""WebSocket API for Charge Controller."""

from __future__ import annotations

import logging
import uuid
from typing import TYPE_CHECKING

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import device_registry as dr

from .const import (
    CH_HOUSEHOLD,
    CH_PHASE_MAP,
    CH_TYPE,
    CHARGER_PHASES,
    CHARGER_TYPES,
    DOMAIN,
    FUSE_MAX_A,
    FUSE_MIN_A,
    HH_FUSE,
    HH_NAME,
    HH_PHASE_ENTITIES,
    PHASES,
)
from .easee.discovery import async_discover_easee_chargers

if TYPE_CHECKING:
    from homeassistant.components.websocket_api import ActiveConnection
    from .store import ChargeControllerStore

_LOGGER = logging.getLogger(__name__)

ERR_HOUSEHOLD_IN_USE = "household_in_use"


def _unique_charger_phases(value: dict) -> dict:
    """Ensure no charger phase is mapped to more than one household phase."""
    if len(set(value.values())) != len(value):
        raise vol.Invalid("Each charger phase can only be mapped once")
    return value


HOUSEHOLD_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(HH_NAME): vol.All(str, vol.Strip, vol.Length(min=1, max=64)),
        vol.Required(HH_FUSE): vol.All(
            vol.Coerce(int), vol.Range(min=FUSE_MIN_A, max=FUSE_MAX_A)
        ),
        **{
            vol.Required(key): cv.entity_domain("sensor")
            for key in HH_PHASE_ENTITIES.values()
        },
    }
)

CHARGER_CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CH_TYPE): vol.In(CHARGER_TYPES),
        vol.Required(CH_HOUSEHOLD): str,
        vol.Required(CH_PHASE_MAP): vol.All(
            vol.Schema({vol.Required(p): vol.In(CHARGER_PHASES) for p in PHASES}),
            _unique_charger_phases,
        ),
    }
)


def _get_store(hass: HomeAssistant) -> ChargeControllerStore:
    return hass.data[DOMAIN]["store"]


@callback
def _async_reload_entries(hass: HomeAssistant) -> None:
    """Reload config entries so entities follow the stored configuration."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        hass.config_entries.async_schedule_reload(entry.entry_id)


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    _LOGGER.info("Registering Charge Controller WebSocket commands")
    websocket_api.async_register_command(hass, websocket_discover_chargers)
    websocket_api.async_register_command(hass, websocket_get_chargers)
    websocket_api.async_register_command(hass, websocket_save_charger)
    websocket_api.async_register_command(hass, websocket_delete_charger)

    websocket_api.async_register_command(hass, websocket_get_households)
    websocket_api.async_register_command(hass, websocket_save_household)
    websocket_api.async_register_command(hass, websocket_delete_household)

    websocket_api.async_register_command(hass, websocket_get_settings)
    websocket_api.async_register_command(hass, websocket_save_settings)


# Charger commands
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/chargers/discover",
    }
)
@callback
def websocket_discover_chargers(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Return chargers found in HA that can be controlled."""
    connection.send_result(msg["id"], async_discover_easee_chargers(hass))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/chargers/get",
    }
)
@callback
def websocket_get_chargers(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Return all configured chargers."""
    connection.send_result(msg["id"], _get_store(hass).get_chargers())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/chargers/save",
        vol.Required("charger_id"): str,
        vol.Required("config"): CHARGER_CONFIG_SCHEMA,
    }
)
@websocket_api.async_response
async def websocket_save_charger(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Save charger configuration. The charger id is the HA device id."""
    store = _get_store(hass)
    config = msg["config"]

    if dr.async_get(hass).async_get(msg["charger_id"]) is None:
        connection.send_error(
            msg["id"], websocket_api.ERR_NOT_FOUND, "Charger device not found"
        )
        return
    if store.get_household(config[CH_HOUSEHOLD]) is None:
        connection.send_error(
            msg["id"], websocket_api.ERR_NOT_FOUND, "Household not found"
        )
        return

    charger = await store.async_save_charger(msg["charger_id"], config)
    _async_reload_entries(hass)
    connection.send_result(msg["id"], charger)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/chargers/delete",
        vol.Required("charger_id"): str,
    }
)
@websocket_api.async_response
async def websocket_delete_charger(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Delete a charger configuration."""
    await _get_store(hass).async_delete_charger(msg["charger_id"])
    _async_reload_entries(hass)
    connection.send_result(msg["id"], {"success": True})


# Household commands
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/households/get",
    }
)
@callback
def websocket_get_households(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Return all configured households."""
    connection.send_result(msg["id"], _get_store(hass).get_households())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/households/save",
        vol.Optional("household_id"): str,
        vol.Required("config"): HOUSEHOLD_CONFIG_SCHEMA,
    }
)
@websocket_api.async_response
async def websocket_save_household(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Create a household, or update it when household_id is given."""
    store = _get_store(hass)
    household_id = msg.get("household_id")

    if household_id is None:
        household_id = uuid.uuid4().hex
    elif store.get_household(household_id) is None:
        connection.send_error(
            msg["id"], websocket_api.ERR_NOT_FOUND, "Household not found"
        )
        return

    household = await store.async_save_household(household_id, msg["config"])
    _async_reload_entries(hass)
    connection.send_result(msg["id"], household)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/households/delete",
        vol.Required("household_id"): str,
    }
)
@websocket_api.async_response
async def websocket_delete_household(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Delete a household configuration, unless a charger still uses it."""
    store = _get_store(hass)
    household_id = msg["household_id"]

    users = [
        charger_id
        for charger_id, charger in store.get_chargers().items()
        if charger.get(CH_HOUSEHOLD) == household_id
    ]
    if users:
        connection.send_error(
            msg["id"],
            ERR_HOUSEHOLD_IN_USE,
            "Household is used by a charger, remove the charger configuration first",
        )
        return

    await store.async_delete_household(household_id)
    _async_reload_entries(hass)
    connection.send_result(msg["id"], {"success": True})


# Settings commands
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/settings/get",
    }
)
@callback
def websocket_get_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Get global settings."""
    connection.send_result(msg["id"], _get_store(hass).get_settings())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/settings/save",
        vol.Required("changes"): dict,
    }
)
@websocket_api.async_response
async def websocket_save_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Save global settings."""
    settings = await _get_store(hass).async_save_settings(msg["changes"])
    connection.send_result(msg["id"], settings)
