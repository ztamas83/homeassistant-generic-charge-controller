"""Batches power readings into samples (pure, no Home Assistant imports)."""

from __future__ import annotations

from datetime import datetime

INVALID_MODES = {"limited", "scheduled_pause", "failsafe"}
MIN_POWER_KW = 1.0
BATCH_SECONDS = 300.0
MAX_GAP_SECONDS = 90.0


class SampleCollector:
    """Time-weighted mean of power; emits one sample per 5 min of valid time."""

    def __init__(self) -> None:
        self._last: datetime | None = None
        self._sum = 0.0
        self._time = 0.0

    def _clear(self) -> None:
        self._sum = 0.0
        self._time = 0.0

    def add(
        self, now: datetime, power_kw: float | None, mode: str, connected: bool
    ) -> float | None:
        """Add a tick. Returns an emitted batch mean (kW) or None."""
        last = self._last
        self._last = now
        valid = (
            power_kw is not None
            and power_kw >= MIN_POWER_KW
            and mode not in INVALID_MODES
            and connected
        )
        if not valid:
            self._clear()
            return None
        if last is None:
            return None
        dt = (now - last).total_seconds()
        if dt <= 0:
            return None
        if dt > MAX_GAP_SECONDS:
            self._clear()
            return None
        assert power_kw is not None
        self._sum += power_kw * dt
        self._time += dt
        if self._time >= BATCH_SECONDS:
            mean = self._sum / self._time
            self._clear()
            return mean
        return None
