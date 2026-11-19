"""Charge rate models (pure, no Home Assistant imports)."""

from __future__ import annotations

import math
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone, tzinfo
from typing import Any


class ChargeRateModel(ABC):
    """Learns the charging power of an EV."""

    TYPE = ""
    VERSION = 1

    @abstractmethod
    def update(self, power_kw: float, weight: float = 1.0, at: datetime | None = None) -> None:
        """Feed one power sample (kW) with a weight in 0..1, taken at `at` (aware)."""

    @abstractmethod
    def predict_power_kw(self, soc: float | None, at: datetime | None = None) -> float | None:
        """Predict charging power at the given SOC and time, None if unknown."""

    def hourly_profile(self, tz: tzinfo) -> list[float | None]:
        """Learned power per local hour (24 values), None where unknown."""
        return [None] * 24

    @property
    @abstractmethod
    def confidence(self) -> float:
        """Confidence 0..1."""

    @property
    @abstractmethod
    def n_samples(self) -> int:
        """Number of samples seen."""

    @property
    @abstractmethod
    def std_kw(self) -> float:
        """Standard deviation of power in kW."""

    @abstractmethod
    def to_dict(self) -> dict[str, Any]:
        """Serialize."""

    @classmethod
    @abstractmethod
    def from_dict(cls, data: dict[str, Any]) -> ChargeRateModel:
        """Deserialize."""


class AverageRateModel(ChargeRateModel):
    """Exponentially weighted mean and variance of power.

    The first sample initializes the mean. Later samples use
    alpha_eff = alpha * weight with alpha = 0.1.
    confidence = min(n / 20, 1) * clamp(1 - std / mean, 0, 1).
    """

    TYPE = "average"
    ALPHA = 0.1

    def __init__(self) -> None:
        self._mean = 0.0
        self._var = 0.0
        self._n = 0

    def update(self, power_kw: float, weight: float = 1.0, at: datetime | None = None) -> None:
        """Update mean and variance (`at` is ignored)."""
        if self._n == 0:
            self._mean = power_kw
            self._var = 0.0
        else:
            a = self.ALPHA * max(0.0, min(weight, 1.0))
            diff = power_kw - self._mean
            incr = a * diff
            self._mean += incr
            self._var = (1 - a) * (self._var + diff * incr)
        self._n += 1

    def predict_power_kw(self, soc: float | None, at: datetime | None = None) -> float | None:
        """Return the mean power (`at` is ignored), None before any sample."""
        return self._mean if self._n > 0 else None

    @property
    def confidence(self) -> float:
        """Sample count and stability based confidence."""
        if self._n == 0 or self._mean <= 0:
            return 0.0
        stability = max(0.0, min(1.0, 1 - self.std_kw / self._mean))
        return min(self._n / 20, 1.0) * stability

    @property
    def n_samples(self) -> int:
        """Number of samples seen."""
        return self._n

    @property
    def std_kw(self) -> float:
        """Standard deviation in kW."""
        return math.sqrt(max(self._var, 0.0))

    def to_dict(self) -> dict[str, Any]:
        """Serialize."""
        return {
            "type": self.TYPE,
            "version": self.VERSION,
            "mean": self._mean,
            "var": self._var,
            "n": self._n,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AverageRateModel:
        """Deserialize."""
        model = cls()
        model._mean = float(data.get("mean", 0.0))
        model._var = float(data.get("var", 0.0))
        model._n = int(data.get("n", 0))
        return model


class HourlyRateModel(ChargeRateModel):
    """Hour-of-day power over a sliding window of UTC hour buckets.

    Each bucket (UTC hour start, epoch seconds) holds [weighted_sum_kw, weight_sum].
    On update, buckets older than WINDOW_DAYS before the sample time are dropped. The
    window is relative to the newest sample, so data survives a period without charging.
    Prediction for a time uses the mean of all buckets with the same local hour when that
    hour has at least MIN_HOUR_SAMPLES weight, otherwise the overall window mean.
    An update without `at` goes into the newest bucket (or the current hour when empty)
    and does no pruning.
    std_kw is the weighted std of the bucket means; confidence uses the AverageRateModel
    formula on window values.
    """

    TYPE = "hourly"
    WINDOW_DAYS = 7
    MIN_HOUR_SAMPLES = 3

    def __init__(self) -> None:
        self._buckets: dict[int, list[float]] = {}

    @staticmethod
    def _hour_start(at: datetime) -> int:
        return int(at.timestamp()) // 3600 * 3600

    def update(self, power_kw: float, weight: float = 1.0, at: datetime | None = None) -> None:
        """Add a sample to its hour bucket and prune the window."""
        w = max(0.0, min(weight, 1.0))
        if at is None:
            if self._buckets:
                key = max(self._buckets)
            else:
                key = self._hour_start(datetime.now(timezone.utc))
            prune = False
        else:
            key = self._hour_start(at)
            prune = True
        bucket = self._buckets.setdefault(key, [0.0, 0.0])
        bucket[0] += power_kw * w
        bucket[1] += w
        if prune:
            cutoff = max(self._buckets) - int(timedelta(days=self.WINDOW_DAYS).total_seconds())
            for k in [k for k in self._buckets if k < cutoff]:
                del self._buckets[k]

    def _mean(self, keys: list[int]) -> tuple[float, float] | None:
        total = sum(self._buckets[k][0] for k in keys)
        weight = sum(self._buckets[k][1] for k in keys)
        return (total / weight, weight) if weight > 0 else None

    def _hour_keys(self, hour: int, tz: tzinfo) -> list[int]:
        return [k for k in self._buckets if datetime.fromtimestamp(k, tz).hour == hour]

    def predict_power_kw(self, soc: float | None, at: datetime | None = None) -> float | None:
        """Local-hour mean when known well enough, else the window mean."""
        if at is not None:
            tz = at.tzinfo or timezone.utc
            hour = self._mean(self._hour_keys(at.astimezone(tz).hour, tz))
            if hour is not None and hour[1] >= self.MIN_HOUR_SAMPLES:
                return hour[0]
        overall = self._mean(list(self._buckets))
        return overall[0] if overall else None

    def hourly_profile(self, tz: tzinfo) -> list[float | None]:
        """Mean power per local hour, None for hours under MIN_HOUR_SAMPLES."""
        out: list[float | None] = []
        for hour in range(24):
            m = self._mean(self._hour_keys(hour, tz))
            out.append(m[0] if m is not None and m[1] >= self.MIN_HOUR_SAMPLES else None)
        return out

    @property
    def n_samples(self) -> int:
        """Weighted number of samples in the window (at least 1 when not empty)."""
        if not self._buckets:
            return 0
        return max(1, round(sum(b[1] for b in self._buckets.values())))

    @property
    def std_kw(self) -> float:
        """Weighted standard deviation of the bucket means in the window."""
        overall = self._mean(list(self._buckets))
        if overall is None:
            return 0.0
        mean, weight = overall
        var = sum(
            b[1] * (b[0] / b[1] - mean) ** 2 for b in self._buckets.values() if b[1] > 0
        ) / weight
        return math.sqrt(max(var, 0.0))

    @property
    def confidence(self) -> float:
        """Sample count and stability based confidence."""
        overall = self._mean(list(self._buckets))
        if overall is None or overall[0] <= 0:
            return 0.0
        stability = max(0.0, min(1.0, 1 - self.std_kw / overall[0]))
        return min(self.n_samples / 20, 1.0) * stability

    def to_dict(self) -> dict[str, Any]:
        """Serialize."""
        return {
            "type": self.TYPE,
            "version": self.VERSION,
            "buckets": {str(k): list(v) for k, v in self._buckets.items()},
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> HourlyRateModel:
        """Deserialize."""
        model = cls()
        for k, v in (data.get("buckets") or {}).items():
            model._buckets[int(k)] = [float(v[0]), float(v[1])]
        return model


MODELS: dict[str, type[ChargeRateModel]] = {
    AverageRateModel.TYPE: AverageRateModel,
    HourlyRateModel.TYPE: HourlyRateModel,
}


def model_from_dict(data: dict[str, Any]) -> ChargeRateModel:
    """Build a model from its serialized form."""
    cls = MODELS.get(data.get("type", "average"), AverageRateModel)
    return cls.from_dict(data)
