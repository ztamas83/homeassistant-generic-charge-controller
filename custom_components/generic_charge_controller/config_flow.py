"""Adds config flow for generic_charge_controller integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
import homeassistant.helpers.config_validation as cv
import homeassistant.helpers.device_registry as dr

from .const import (
    CONF_ACC_MAX_PRICE_CENTS,
    CONF_CHRG_DOMAIN,
    CONF_CHRG_ID,
    CONF_ENTITYID_CURR_P1,
    CONF_ENTITYID_CURR_P2,
    CONF_ENTITYID_CURR_P3,
    CONF_RATED_CURRENT,
    DOMAIN,
)

DATA_SCHEMA = vol.Schema(
    {
        vol.Required(
            CONF_ENTITYID_CURR_P1,
            msg="Sensor ID for current P1",
            description="Sensor ID for current P1",
        ): cv.string,
        vol.Optional(
            CONF_ENTITYID_CURR_P2,
            msg="Sensor ID for current P2",
            description="Sensor ID for current P2",
        ): cv.string,
        vol.Optional(
            CONF_ENTITYID_CURR_P3,
            msg="Sensor ID for current P3",
            description="Sensor ID for current P3",
        ): cv.string,
        vol.Required(CONF_RATED_CURRENT): cv.positive_int,
        vol.Required(CONF_CHRG_ID): cv.string,
        vol.Optional(CONF_ACC_MAX_PRICE_CENTS): cv.positive_int,
    }
)

_LOGGER = logging.getLogger(__name__)


class ChargeControllerFlowConfig(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the charge controller integration."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""

        self._async_abort_entries_match()

        if user_input is not None:
            charger_device_id = user_input[CONF_CHRG_ID]

            dev_reg = dr.async_get(self.hass)
            charger_device = dev_reg.async_get(charger_device_id)

            errors = {}
            if not charger_device:
                errors[CONF_CHRG_ID] = "Device not found"

            if errors:
                return self.async_show_form(
                    step_id="user",
                    data_schema=DATA_SCHEMA,
                    errors=errors,
                )

            idset = charger_device.identifiers.pop()
            unique_id = idset[1]

            user_input[CONF_CHRG_DOMAIN] = idset[0]

            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=unique_id,
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=DATA_SCHEMA,
            errors={},
        )
