"""WebSocket API for Charge Controller."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.components.websocket_api import ActiveConnection
    from .coordinator import ChargeControllerCoordinator

_LOGGER = logging.getLogger(__name__)


def _get_coordinator(hass: HomeAssistant) -> ChargeControllerCoordinator | None:
    """Return the ChargeControllerCoordinator from hass.data, or None."""
    return hass.data.get(DOMAIN, {}).get("coordinator")


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    """Register WebSocket commands."""
    _LOGGER.info("Registering Charge Controller WebSocket commands")
    websocket_api.async_register_command(hass, websocket_get_chargers)
    websocket_api.async_register_command(hass, websocket_save_charger)
    websocket_api.async_register_command(hass, websocket_delete_charger)
    
    websocket_api.async_register_command(hass, websocket_get_households)
    websocket_api.async_register_command(hass, websocket_save_household)
    websocket_api.async_register_command(hass, websocket_delete_household)
    
    websocket_api.async_register_command(hass, websocket_get_settings)
    websocket_api.async_register_command(hass, websocket_save_settings)


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
    store = hass.data[DOMAIN]["store"]
    connection.send_result(msg["id"], store.get_chargers())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/chargers/save",
        vol.Required("charger_id"): str,
        vol.Required("config"): dict,
    }
)
@websocket_api.async_response
async def websocket_save_charger(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Save charger configuration."""
    store = hass.data[DOMAIN]["store"]
    charger = await store.async_save_charger(msg["charger_id"], msg["config"])
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
    store = hass.data[DOMAIN]["store"]
    await store.async_delete_charger(msg["charger_id"])
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
    store = hass.data[DOMAIN]["store"]
    connection.send_result(msg["id"], store.get_households())


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/households/save",
        vol.Required("device_id"): str,
        vol.Required("config"): dict,
    }
)
@websocket_api.async_response
async def websocket_save_household(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Save household configuration."""
    store = hass.data[DOMAIN]["store"]
    household = await store.async_save_household(msg["device_id"], msg["config"])
    connection.send_result(msg["id"], household)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/households/delete",
        vol.Required("device_id"): str,
    }
)
@websocket_api.async_response
async def websocket_delete_household(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Delete a household configuration."""
    store = hass.data[DOMAIN]["store"]
    await store.async_delete_household(msg["device_id"])
    connection.send_result(msg["id"], {"success": True})


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
    store = hass.data[DOMAIN]["store"]
    connection.send_result(msg["id"], store.get_settings())


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
    store = hass.data[DOMAIN]["store"]
    settings = await store.async_save_settings(msg["changes"])
    connection.send_result(msg["id"], settings)
