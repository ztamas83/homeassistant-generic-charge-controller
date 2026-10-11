"""Config flow for the generic charge controller.

The flow only creates the single config entry; households and chargers are
configured in the Charge Controller panel.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class ChargeControllerFlowConfig(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the charge controller integration."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm setup."""
        if user_input is not None:
            return self.async_create_entry(title="Charge Controller", data={})

        return self.async_show_form(step_id="user")
