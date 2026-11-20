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

    def hourly_confidence(self, tz: tzinfo) -> list[float]:
        """Confidence per local hour (24 values), 0.0 where unknown."""
        return [0.0] * 24

    def confidence_at(self, at: datetime) -> float:
        """Confidence behind the prediction for `at`."""
        return self.confidence

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

    Each bucket (UTC hour start, epoch seconds) holds
    [weighted_sum, weight_sum, weighted_sum_sq] of the samples.
    On update, buckets older than WINDOW_DAYS before the sample time are dropped. The
    window is relative to the newest sample, so data survives a period without charging.
    Per local hour, all window buckets of that hour are pooled into n_h (weight), mean_h
    and std_h (pooled sample std). hour_confidence = min(n_h / HOUR_FULL_SAMPLES, 1) *
    clamp(1 - std_h / mean_h). Prediction uses the hour mean when n_h >= MIN_HOUR_SAMPLES
    and hour_confidence >= MIN_HOUR_CONFIDENCE, otherwise the window mean.
    An update without `at` goes into the newest bucket (or the current hour when empty)
    and does no pruning.
    std_kw is the pooled sample std over the window; confidence uses the
    AverageRateModel formula on window values.
    """

    TYPE = "hourly"
    VERSION = 2
    WINDOW_DAYS = 7
    MIN_HOUR_SAMPLES = 3
    HOUR_FULL_SAMPLES = 12
    MIN_HOUR_CONFIDENCE = 0.3

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
        bucket = self._buckets.setdefault(key, [0.0, 0.0, 0.0])
        bucket[0] += power_kw * w
        bucket[1] += w
        bucket[2] += power_kw * power_kw * w
        if prune:
            cutoff = max(self._buckets) - int(timedelta(days=self.WINDOW_DAYS).total_seconds())
            for k in [k for k in self._buckets if k < cutoff]:
                del self._buckets[k]

    def _stats(self, keys: list[int]) -> tuple[float, float, float] | None:
        """Pooled (weight, mean, sample std) of the given buckets, None without weight."""
        total = sum(self._buckets[k][0] for k in keys)
        weight = sum(self._buckets[k][1] for k in keys)
        if weight <= 0:
            return None
        sq = sum(self._buckets[k][2] for k in keys)
        mean = total / weight
        var = max(sq - total * total / weight, 0.0) / (weight - 1) if weight > 1 else 0.0
        return weight, mean, math.sqrt(var)

    @classmethod
    def _confidence_of(cls, stats: tuple[float, float, float] | None, full: float) -> float:
        if stats is None or stats[1] <= 0:
            return 0.0
        weight, mean, std = stats
        return min(weight / full, 1.0) * max(0.0, min(1.0, 1 - std / mean))

    def _hour_keys(self, hour: int, tz: tzinfo) -> list[int]:
        return [k for k in self._buckets if datetime.fromtimestamp(k, tz).hour == hour]

    def _hour_use(self, hour: int, tz: tzinfo) -> tuple[float, float] | None:
        """(mean, confidence) of a local hour when it is used for prediction, else None."""
        stats = self._stats(self._hour_keys(hour, tz))
        if stats is None or stats[0] < self.MIN_HOUR_SAMPLES:
            return None
        conf = self._confidence_of(stats, self.HOUR_FULL_SAMPLES)
        if conf < self.MIN_HOUR_CONFIDENCE:
            return None
        return stats[1], conf

    def predict_power_kw(self, soc: float | None, at: datetime | None = None) -> float | None:
        """Local-hour mean when reliable enough, else the window mean."""
        if at is not None:
            tz = at.tzinfo or timezone.utc
            used = self._hour_use(at.astimezone(tz).hour, tz)
            if used is not None:
                return used[0]
        overall = self._stats(list(self._buckets))
        return overall[1] if overall else None

    def confidence_at(self, at: datetime) -> float:
        """Confidence behind the prediction for `at` (hour or window confidence)."""
        tz = at.tzinfo or timezone.utc
        used = self._hour_use(at.astimezone(tz).hour, tz)
        if used is not None:
            return used[1]
        return self.confidence

    def hourly_profile(self, tz: tzinfo) -> list[float | None]:
        """Mean power per local hour, None for hours not used for prediction."""
        out: list[float | None] = []
        for hour in range(24):
            used = self._hour_use(hour, tz)
            out.append(used[0] if used is not None else None)
        return out

    def hourly_confidence(self, tz: tzinfo) -> list[float]:
        """Confidence per local hour, 0.0 for hours without data."""
        return [
            self._confidence_of(self._stats(self._hour_keys(h, tz)), self.HOUR_FULL_SAMPLES)
            for h in range(24)
        ]

    @property
    def n_samples(self) -> int:
        """Weighted number of samples in the window (at least 1 when not empty)."""
        if not self._buckets:
            return 0
        return max(1, round(sum(b[1] for b in self._buckets.values())))

    @property
    def std_kw(self) -> float:
        """Pooled sample standard deviation over the window."""
        stats = self._stats(list(self._buckets))
        return stats[2] if stats else 0.0

    @property
    def confidence(self) -> float:
        """Sample count and stability based window confidence."""
        return self._confidence_of(self._stats(list(self._buckets)), 20.0)

    def to_dict(self) -> dict[str, Any]:
        """Serialize."""
        return {
            "type": self.TYPE,
            "version": self.VERSION,
            "buckets": {str(k): list(v) for k, v in self._buckets.items()},
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> HourlyRateModel:
        """Deserialize (2-element buckets get zero within-bucket variance)."""
        model = cls()
        for k, v in (data.get("buckets") or {}).items():
            total, weight = float(v[0]), float(v[1])
            if len(v) >= 3:
                sq = float(v[2])
            else:
                sq = total * total / weight if weight > 0 else 0.0
            model._buckets[int(k)] = [total, weight, sq]
        return model


MODELS: dict[str, type[ChargeRateModel]] = {
    AverageRateModel.TYPE: AverageRateModel,
    HourlyRateModel.TYPE: HourlyRateModel,
}


def model_from_dict(data: dict[str, Any]) -> ChargeRateModel:
    """Build a model from its serialized form."""
    cls = MODELS.get(data.get("type", "average"), AverageRateModel)
    return cls.from_dict(data)
