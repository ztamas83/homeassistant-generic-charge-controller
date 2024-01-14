"""Generic Charge Controller"""

import logging
from typing import cast

from homeassistant.config import CONF_NAME
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .const import DATA_HASS_CONFIG, DOMAIN

PLATFORMS = [Platform.SENSOR]

CONFIG_SCHEMA = cv.removed(DOMAIN, raise_if_present=False)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the generic_charge_controller component."""
    _LOGGER.debug("Setup component")
    hass.data[DATA_HASS_CONFIG] = config.get(DOMAIN)

    # hass.config_entries.async_setup(conf_entry.entry_id)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up a config entry."""

    _LOGGER.debug("Setup config entry")
    hass.data.setdefault(DOMAIN, {})
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
    if unload_ok := await hass.config_entries.async_unload_platforms(
        config_entry, PLATFORMS
    ):
        hass.data[DOMAIN].pop(config_entry.entry_id)

    return unload_ok
