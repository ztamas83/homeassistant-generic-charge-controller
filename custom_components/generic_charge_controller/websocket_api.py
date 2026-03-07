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
    websocket_api.async_register_command(hass, websocket_get_chargers)
    websocket_api.async_register_command(hass, websocket_add_charger)
    websocket_api.async_register_command(hass, websocket_remove_charger)
    websocket_api.async_register_command(hass, websocket_get_settings)
    websocket_api.async_register_command(hass, websocket_save_settings)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "charge_controller/chargers/get",
    }
)
@callback
def websocket_get_chargers(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Return a list of detected/configured chargers."""
    # Placeholder: In the future, this will fetch from the store or coordinator
    chargers = [
        {
            "id": "mock_charger_1",
            "name": "Main Garage Charger",
            "status": "Charging",
            "current_limit": 16,
            "current_usage": 12.5,
        },
        {
            "id": "mock_charger_2",
            "name": "Guest Parking",
            "status": "Idle",
            "current_limit": 32,
            "current_usage": 0,
        }
    ]
    connection.send_result(msg["id"], chargers)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "charge_controller/chargers/add",
        vol.Required("charger_id"): str,
        vol.Optional("name"): str,
    }
)
@websocket_api.async_response
async def websocket_add_charger(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Add a new charger configuration."""
    # Placeholder for adding a charger to the store
    _LOGGER.info("Adding charger: %s", msg["charger_id"])
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "charge_controller/chargers/remove",
        vol.Required("charger_id"): str,
    }
)
@websocket_api.async_response
async def websocket_remove_charger(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Remove a charger configuration."""
    # Placeholder for removing a charger from the store
    _LOGGER.info("Removing charger: %s", msg["charger_id"])
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "charge_controller/settings/get",
    }
)
@callback
def websocket_get_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Get global settings."""
    settings = {
        "mains_fuse_current": 25,
        "update_interval": 45,
    }
    connection.send_result(msg["id"], settings)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "charge_controller/settings/save",
        vol.Optional("mains_fuse_current"): int,
        vol.Optional("update_interval"): int,
    }
)
@websocket_api.async_response
async def websocket_save_settings(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict,
) -> None:
    """Save global settings."""
    # Placeholder for saving settings to the store
    _LOGGER.info("Saving settings: %s", msg)
    connection.send_result(msg["id"], {"success": True})
