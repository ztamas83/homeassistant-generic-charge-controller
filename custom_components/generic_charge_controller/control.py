"""Decides when calculated limits are sent to a charger, and sends them."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from homeassistant.exceptions import HomeAssistantError

from .abstract_charger import AbstractCharger
from .const import (
    CONTROL_RECONCILE_INTERVAL_S,
    CONTROL_STARTUP_GRACE_S,
    OVERLOAD_DURATION_S,
    OVERLOAD_FACTOR,
)

_LOGGER = logging.getLogger(__name__)


class OverloadDetector:
    """Detects a household phase above OVERLOAD_FACTOR x fuse for OVERLOAD_DURATION_S.

    The overload must be continuous: a reading below the threshold, or an unknown
    reading, starts the duration over.
    """

    def __init__(self) -> None:
        self._since: datetime | None = None

    def update(
        self, loads: dict[str, float | None], fuse_a: float, now: datetime
    ) -> tuple[bool, float | None]:
        """Return (sustained overload, seconds until it would count as sustained).

        The second value is None when there is no overload in progress.
        """
        threshold = fuse_a * OVERLOAD_FACTOR
        overloaded = any(v is not None and v > threshold for v in loads.values())
        if not overloaded:
            self._since = None
            return False, None

        if self._since is None:
            self._since = now
        remaining = OVERLOAD_DURATION_S - (now - self._since).total_seconds()
        if remaining < 0:
            return True, None
        return False, remaining


class LimitSender:
    """Sends limits to one charger, at most once per update interval.

    - The first limits are sent at once.
    - After that, changed limits are sent when the update interval has passed
      since the last send.
    - A sustained overload sends lower limits at once, regardless of the interval.
    - Unchanged limits are resent after the reconcile interval, so changes made
      outside the integration are corrected.
    - Right after start, fail-safe limits are held back for a grace period while
      meter sensors come up; the charger keeps its previous limit meanwhile.
    """

    def __init__(self, started_at: datetime, update_interval: timedelta) -> None:
        self._started_at = started_at
        self._update_interval = update_interval
        self.last_sent: dict[str, int] | None = None
        self.last_sent_at: datetime | None = None

    def _should_send(
        self, limits: dict[str, int], failsafe: bool, overload: bool, now: datetime
    ) -> tuple[bool, str | None]:
        if self.last_sent is None or self.last_sent_at is None:
            in_grace = now - self._started_at < timedelta(seconds=CONTROL_STARTUP_GRACE_S)
            if failsafe and in_grace and not overload:
                return False, "Waiting for meter readings after start, limits not sent"
            return True, None

        since_last = now - self.last_sent_at
        if overload and any(limits[p] < self.last_sent[p] for p in limits):
            return True, None
        if limits == self.last_sent:
            return since_last >= timedelta(seconds=CONTROL_RECONCILE_INTERVAL_S), None
        if since_last >= self._update_interval:
            return True, None
        wait = (self._update_interval - since_last).total_seconds()
        return False, f"New limits are sent in {wait:.0f} s (charger update interval)"

    def seconds_until_due(self, now: datetime) -> float | None:
        """Seconds until held-back limits may be sent, None if nothing was sent yet."""
        if self.last_sent_at is None:
            return None
        return max(0.0, (self._update_interval - (now - self.last_sent_at)).total_seconds())

    async def async_apply(
        self,
        charger: AbstractCharger,
        limits: dict[str, int],
        failsafe: bool,
        overload: bool,
        now: datetime,
    ) -> tuple[bool, list[str]]:
        """Send limits when due.

        Returns whether limits are still waiting to be sent, and reasons for
        limits that were not sent.
        """
        send, reason = self._should_send(limits, failsafe, overload, now)
        if not send:
            return reason is not None, [reason] if reason else []

        try:
            await charger.async_set_limits(limits)
        except HomeAssistantError as err:
            _LOGGER.warning("Sending limits %s failed: %s", limits, err)
            return True, [f"Sending limits failed: {err}"]

        _LOGGER.debug("Sent limits %s%s", limits, " (overload)" if overload else "")
        self.last_sent = dict(limits)
        self.last_sent_at = now
        return False, []
