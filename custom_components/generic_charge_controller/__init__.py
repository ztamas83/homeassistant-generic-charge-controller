"""Generic Charge Controller"""

import logging
from typing import cast

from homeassistant.exceptions import HomeAssistantError
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.typing import ConfigType

from homeassistant.config import CONF_NAME
from .const import (
    DATA_HASS_CONFIG,
    DOMAIN,
)

PLATFORMS = [Platform.SENSOR]

CONFIG_SCHEMA = cv.removed(DOMAIN, raise_if_present=False)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the generic_charge_controller component."""

    hass.data[DATA_HASS_CONFIG] = config.get(DOMAIN)

    # hass.config_entries.async_setup(conf_entry.entry_id)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a config entry."""

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # set up notify platform, no entry support for notify component yet,
    # have to use discovery to load platform.
    # hass.async_create_task(
    #     discovery.async_load_platform(
    #         hass,
    #         Platform.NOTIFY,
    #         DOMAIN,
    #         {CONF_NAME: DOMAIN},
    #         hass.data[DATA_HASS_CONFIG],
    #     )
    # )
    return True


async def async_unload_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    )
    if unload_ok:
        tibber_connection = hass.data[DOMAIN]
        await tibber_connection.rt_disconnect()
    return unload_ok
