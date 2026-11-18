"""Decides when calculated limits are sent to a charger, and sends them."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import datetime, timedelta

from homeassistant.exceptions import HomeAssistantError

from .abstract_charger import AbstractCharger
from .const import (
    PAUSE_RETRY_INTERVAL_S,
    PAUSE_MAX_ATTEMPTS,
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
        self,
        limits: dict[str, int],
        failsafe: bool,
        overload: bool,
        now: datetime,
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


class PauseController:
    """Pauses and resumes one charger's session for the smart charging schedule.

    - Pauses when desired and not yet paused by us; resumes when no longer desired
      (or control is inactive) and we paused it. A session paused by the user is
      never resumed.
    - A command is sent at once when it differs from the previous one, so Charge
      now resumes immediately. Repeating the same command (after an error, or a
      pause while the charger still charges) waits PAUSE_RETRY_INTERVAL_S.
    - A pause is resent while the charger still charges, PAUSE_MAX_ATTEMPTS in total.
    - An unplugged charger clears the state without sending anything.
    - on_change(paused_by_us) is called when the flag changes, for persistence.
    """

    def __init__(
        self,
        paused_by_us: bool = False,
        on_change: Callable[[bool], None] | None = None,
    ) -> None:
        self.paused_by_us = paused_by_us
        self._on_change = on_change
        self._last_cmd: str | None = None
        self._last_at: datetime | None = None
        self._attempts = 0
        self._warned = False

    def _set(self, value: bool) -> None:
        if value != self.paused_by_us:
            self.paused_by_us = value
            if self._on_change:
                self._on_change(value)
        if not value:
            self._last_cmd = self._last_at = None
            self._attempts = 0
            self._warned = False

    def _wait(self, cmd: str, now: datetime) -> float:
        """Seconds until cmd may be repeated, 0 when it may be sent now."""
        if self._last_cmd != cmd or self._last_at is None:
            return 0.0
        return max(0.0, PAUSE_RETRY_INTERVAL_S - (now - self._last_at).total_seconds())

    async def _send(self, charger: AbstractCharger, cmd: str, now: datetime) -> bool:
        self._last_cmd, self._last_at = cmd, now
        try:
            await (charger.async_pause() if cmd == "pause" else charger.async_resume())
        except HomeAssistantError as err:
            _LOGGER.warning("Charger %s failed: %s", cmd, err)
            return False
        return True

    async def async_apply(
        self,
        charger: AbstractCharger,
        desired_paused: bool,
        connected: bool,
        active: bool,
        now: datetime,
    ) -> float | None:
        """Send a pause or resume when due. Returns seconds until a new check is needed."""
        if not connected:
            self._set(False)
            return None
        if not active:
            desired_paused = False  # no control: leave nothing paused by us
            if not self.paused_by_us:
                return None

        if desired_paused:
            if not self.paused_by_us:
                if (wait := self._wait("pause", now)) > 0:
                    return wait
                if await self._send(charger, "pause", now):
                    self._attempts = 1
                    self._set(True)
                    return PAUSE_RETRY_INTERVAL_S
                return PAUSE_RETRY_INTERVAL_S
            if not charger.is_charging():
                return None
            if (wait := self._wait("pause", now)) > 0:
                return wait if self._attempts < PAUSE_MAX_ATTEMPTS else None
            if self._attempts >= PAUSE_MAX_ATTEMPTS:
                if not self._warned:
                    self._warned = True
                    _LOGGER.warning(
                        "Charger still charging after %s pause commands", self._attempts
                    )
                return None
            self._attempts += 1
            await self._send(charger, "pause", now)
            return PAUSE_RETRY_INTERVAL_S

        if not self.paused_by_us:
            return None
        if (wait := self._wait("resume", now)) > 0:
            return wait
        if await self._send(charger, "resume", now):
            self._set(False)
            return None
        return PAUSE_RETRY_INTERVAL_S
