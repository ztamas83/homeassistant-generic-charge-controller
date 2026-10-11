"""Decides when calculated limits are sent to a charger, and sends them."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from homeassistant.exceptions import HomeAssistantError

from .abstract_charger import AbstractCharger
from .const import (
    CONTROL_MIN_INCREASE_INTERVAL_S,
    CONTROL_RECONCILE_INTERVAL_S,
    CONTROL_STARTUP_GRACE_S,
)

_LOGGER = logging.getLogger(__name__)


class LimitSender:
    """Sends limits to one charger, limiting how often they change.

    - Lower limits are sent at once.
    - Higher limits are sent at most once per minimum increase interval.
    - Unchanged limits are resent after the reconcile interval, so changes made
      outside the integration are corrected.
    - Right after start, fail-safe limits are held back for a grace period while
      meter sensors come up; the charger keeps its previous limit meanwhile.
    """

    def __init__(self, started_at: datetime) -> None:
        self._started_at = started_at
        self.last_sent: dict[str, int] | None = None
        self.last_sent_at: datetime | None = None

    def _should_send(
        self, limits: dict[str, int], failsafe: bool, now: datetime
    ) -> tuple[bool, str | None]:
        if self.last_sent is None or self.last_sent_at is None:
            if failsafe and now - self._started_at < timedelta(seconds=CONTROL_STARTUP_GRACE_S):
                return False, "Waiting for meter readings after start, limits not sent"
            return True, None

        since_last = now - self.last_sent_at
        if any(limits[p] < self.last_sent[p] for p in limits):
            return True, None
        if limits == self.last_sent:
            return since_last >= timedelta(seconds=CONTROL_RECONCILE_INTERVAL_S), None
        if since_last >= timedelta(seconds=CONTROL_MIN_INCREASE_INTERVAL_S):
            return True, None
        return False, "Increase delayed to limit how often limits change"

    async def async_apply(
        self,
        charger: AbstractCharger,
        limits: dict[str, int],
        failsafe: bool,
        now: datetime,
    ) -> list[str]:
        """Send limits when due; return reasons for limits that were not sent."""
        send, reason = self._should_send(limits, failsafe, now)
        if not send:
            return [reason] if reason else []

        try:
            await charger.async_set_limits(limits)
        except HomeAssistantError as err:
            _LOGGER.warning("Sending limits %s failed: %s", limits, err)
            return [f"Sending limits failed: {err}"]

        _LOGGER.debug("Sent limits %s", limits)
        self.last_sent = dict(limits)
        self.last_sent_at = now
        return []
