"""Charge rate models (pure, no Home Assistant imports)."""

from __future__ import annotations

import math
from abc import ABC, abstractmethod
from typing import Any


class ChargeRateModel(ABC):
    """Learns the charging power of an EV."""

    TYPE = ""
    VERSION = 1

    @abstractmethod
    def update(self, power_kw: float, weight: float = 1.0) -> None:
        """Feed one power sample (kW) with a weight in 0..1."""

    @abstractmethod
    def predict_power_kw(self, soc: float | None) -> float | None:
        """Predict charging power at the given SOC, None if unknown."""

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

    def update(self, power_kw: float, weight: float = 1.0) -> None:
        """Update mean and variance."""
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

    def predict_power_kw(self, soc: float | None) -> float | None:
        """Return the mean power, None before any sample."""
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


MODELS: dict[str, type[ChargeRateModel]] = {AverageRateModel.TYPE: AverageRateModel}


def model_from_dict(data: dict[str, Any]) -> ChargeRateModel:
    """Build a model from its serialized form."""
    cls = MODELS.get(data.get("type", "average"), AverageRateModel)
    return cls.from_dict(data)
