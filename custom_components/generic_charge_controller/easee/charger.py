"""Read access to Easee chargers through the entities of the Easee integration."""

from __future__ import annotations

from datetime import datetime, timedelta

from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from ..abstract_charger import AbstractCharger
from ..readings import read_current_a
from .const import (
    ATTR_CIRCUIT_RATED_CURRENT,
    ATTR_PHASE_CURRENT_TMP,
    CHRG_DOMAIN,
    EA_CHARGING,
    NOT_CONNECTED_STATES,
    S_NAME_CIRCUITCURRENT,
    S_NAME_STATUS,
    SVC_SET_LIMIT,
)


class EaseeCharger(AbstractCharger):
    """Easee charger, identified by its HA device id.

    Entities are looked up by unique id "<serial>_<key>" on every read, so renamed
    entities and entities registered after setup are found.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        device_id: str,
        stale_after: timedelta | None = None,
        now: datetime | None = None,
    ) -> None:
        self.hass = hass
        self.device_id = device_id
        self._stale_after = stale_after
        self._now = now
        device = dr.async_get(hass).async_get(device_id)
        self.serial = (
            next(
                (ident for domain, ident in device.identifiers if domain == CHRG_DOMAIN),
                None,
            )
            if device
            else None
        )

    def _entity_id(self, key: str) -> str | None:
        if self.serial is None:
            return None
        return er.async_get(self.hass).async_get_entity_id(
            Platform.SENSOR, CHRG_DOMAIN, f"{self.serial}_{key}"
        )

    def phase_currents(self) -> dict[str, float | None]:
        """Circuit current per phase, from the circuit_current sensor attributes."""
        entity_id = self._entity_id(S_NAME_CIRCUITCURRENT)
        return {
            f"P{i}": read_current_a(
                self.hass,
                entity_id,
                attribute=ATTR_PHASE_CURRENT_TMP % i,
                stale_after=self._stale_after,
                now=self._now,
            )
            for i in range(1, 4)
        }

    def is_charging(self) -> bool:
        entity_id = self._entity_id(S_NAME_STATUS)
        state = self.hass.states.get(entity_id) if entity_id else None
        return state is not None and state.state == EA_CHARGING

    def is_connected(self) -> bool:
        entity_id = self._entity_id(S_NAME_STATUS)
        state = self.hass.states.get(entity_id) if entity_id else None
        return state is not None and state.state not in NOT_CONNECTED_STATES

    def max_current(self) -> float | None:
        """Rated current of the charger's circuit."""
        entity_id = self._entity_id(S_NAME_STATUS)
        state = self.hass.states.get(entity_id) if entity_id else None
        if state is None:
            return None
        try:
            value = float(state.attributes.get(ATTR_CIRCUIT_RATED_CURRENT))
        except (TypeError, ValueError):
            return None
        return value if value > 0 else None

    async def async_set_limits(self, limits: dict[str, int]) -> None:
        """Set the dynamic circuit limit per phase, without expiry.

        The Easee integration skips the API call when the charger already has
        these limits, so a time to live could not be refreshed by resending.
        """
        await self.hass.services.async_call(
            CHRG_DOMAIN,
            SVC_SET_LIMIT,
            {
                "device_id": self.device_id,
                "current_p1": limits["P1"],
                "current_p2": limits["P2"],
                "current_p3": limits["P3"],
                "time_to_live": 0,
            },
            blocking=True,
        )

    async def async_release(self) -> None:
        """Set the dynamic circuit limit back to the circuit rated current."""
        rated = self.max_current()
        if rated is None:
            raise HomeAssistantError(
                "Circuit rated current unknown, cannot release the dynamic limit"
            )
        await self.async_set_limits({p: int(rated) for p in ("P1", "P2", "P3")})
