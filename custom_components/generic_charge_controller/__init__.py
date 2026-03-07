"""Generic Charge Controller"""

import logging
import json
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.http import StaticPathConfig

import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import (
    DATA_HASS_CONFIG,
    DOMAIN,
    VERSION
)

from .websocket_api import async_register_websocket_commands

from homeassistant.components.frontend import (
    async_register_built_in_panel,
)

PLATFORMS = [Platform.SENSOR]
CONFIG_SCHEMA = cv.removed(DOMAIN, raise_if_present=False)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the generic_charge_controller component."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DATA_HASS_CONFIG] = config.get(DOMAIN)

    async_register_websocket_commands(hass)
    await _async_register_panel(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a config entry."""
    hass.data.setdefault(DOMAIN, {})
    await _async_register_panel(hass)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    )
    return unload_ok


async def _async_register_panel(hass: HomeAssistant) -> None:
    """Register the ChargeController custom panel in the sidebar."""
    if hass.data[DOMAIN].get("panel_registered"):
        return

    panel_js = Path(__file__).parent / "frontend" / "controller-panel.js"
    if not panel_js.exists():
        _LOGGER.warning(
            "Charge Controller panel JS not found at %s – sidebar panel not registered. Run 'make build' in the frontend folder.",
            panel_js,
        )
        return

    try:
        await hass.http.async_register_static_paths(
            [StaticPathConfig("/charge-controller/controller-panel.js",
                              str(panel_js), False)]
        )
    except RuntimeError:
        _LOGGER.debug("Charge Controller static path already registered")

    try:
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Charge Controller",
            sidebar_icon="mdi:ev-station",
            frontend_url_path="charge-controller",
            config={
                "_panel_custom": {
                    "name": "charge-controller-panel",
                    "embed_iframe": False,
                    "trust_external": False,
                    "js_url": "/charge-controller/controller-panel.js",
                }
            },
        )
    except Exception:
        _LOGGER.debug("Charge Controller panel already registered")

    hass.data[DOMAIN]["panel_registered"] = True
    _LOGGER.info("Charge Controller panel registered in sidebar")
