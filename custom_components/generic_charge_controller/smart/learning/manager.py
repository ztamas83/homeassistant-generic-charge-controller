"""Owns charge rate models per EV, persistence and estimates."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Callable

from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from ...const import DOMAIN
from ..models import ChargeEstimate
from .collector import SampleCollector
from .model import ChargeRateModel, model_from_dict, MODELS

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
SAVE_INTERVAL = timedelta(minutes=15)
MIN_SAMPLES = 6
MIN_CONFIDENCE = 0.3
BACKFILL_DAYS = 10
OUTLIER_SIGMA = 4.0
OUTLIER_MIN_SAMPLES = 6
OUTLIER_WEIGHT = 0.01


class LearningManager:
    """Manages learning models for all EVs."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, f"{DOMAIN}_learning")
        self._models: dict[str, ChargeRateModel] = {}
        self._collectors: dict[str, SampleCollector] = {}
        self._dirty = False

    async def async_load(self) -> None:
        """Load persisted models."""
        data: dict[str, Any] | None = await self._store.async_load()
        self._models = {}
        for ev_id, raw in ((data or {}).get("models") or {}).items():
            try:
                self._models[ev_id] = model_from_dict(raw)
            except (KeyError, ValueError, TypeError):
                _LOGGER.debug("Dropping unreadable model for %s", ev_id)

    async def async_save(self) -> None:
        """Persist models."""
        await self._store.async_save(
            {"models": {k: m.to_dict() for k, m in self._models.items()}}
        )
        self._dirty = False

    def async_start(self) -> Callable[[], None]:
        """Schedule periodic saves. Returns the unsubscribe callable."""

        async def _save(_now: datetime) -> None:
            if self._dirty:
                await self.async_save()

        return async_track_time_interval(self._hass, _save, SAVE_INTERVAL)

    async def async_stop(self) -> None:
        """Save on shutdown."""
        await self.async_save()

    def model(self, ev_id: str, model_type: str = "average") -> ChargeRateModel:
        """Return (creating if needed) the model of an EV."""
        existing = self._models.get(ev_id)
        if existing is None or (existing.TYPE != model_type and model_type in MODELS):
            existing = MODELS.get(model_type, MODELS["average"])()
            self._models[ev_id] = existing
        return existing

    def _update(self, ev_id: str, sample: float, model_type: str = "average") -> None:
        model = self.model(ev_id, model_type)
        weight = 1.0
        if (
            model.n_samples >= OUTLIER_MIN_SAMPLES
            and model.std_kw > 0
            and (mean := model.predict_power_kw(None)) is not None
            and abs(sample - mean) > OUTLIER_SIGMA * model.std_kw
        ):
            weight = OUTLIER_WEIGHT
        model.update(sample, weight)
        self._dirty = True

    def feed(
        self,
        ev_id: str,
        now: datetime,
        power_kw: float | None,
        mode: str,
        connected: bool,
        model_type: str = "average",
    ) -> None:
        """Feed a coordinator tick."""
        collector = self._collectors.setdefault(ev_id, SampleCollector())
        sample = collector.add(now, power_kw, mode, connected)
        if sample is not None:
            self._update(ev_id, sample, model_type)

    def reset(self, ev_id: str) -> None:
        """Forget everything learned for an EV."""
        self._models.pop(ev_id, None)
        self._collectors.pop(ev_id, None)
        self._dirty = True

    async def async_backfill(
        self, ev_id: str, power_entity: str, model_type: str = "average"
    ) -> None:
        """Seed an empty model from recorder statistics."""
        if self.model(ev_id, model_type).n_samples > 0:
            return
        try:
            from homeassistant.components.recorder import get_instance
            from homeassistant.components.recorder.statistics import (
                statistics_during_period,
            )

            start = dt_util.utcnow() - timedelta(days=BACKFILL_DAYS)
            result = await get_instance(self._hass).async_add_executor_job(
                statistics_during_period,
                self._hass,
                start,
                None,
                {power_entity},
                "5minute",
                {"power": "kW"},
                {"mean"},
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Backfill failed for %s: %s", power_entity, err)
            return
        for row in (result or {}).get(power_entity, []):
            mean = row.get("mean")
            if mean is not None and mean >= 1.0:
                self._update(ev_id, float(mean), model_type)

    def estimate(
        self,
        ev_id: str,
        energy_kwh: float,
        fallback_power_kw: float,
        soc: float | None = None,
        model_type: str = "average",
    ) -> ChargeEstimate:
        """Estimate charge duration for an energy amount."""
        model = self.model(ev_id, model_type)
        predicted = model.predict_power_kw(soc)
        if (
            predicted is not None
            and predicted > 0
            and model.n_samples >= MIN_SAMPLES
            and model.confidence >= MIN_CONFIDENCE
        ):
            power, source = predicted, "learned"
        else:
            power, source = fallback_power_kw, "fallback"
        hours = max(energy_kwh, 0.0) / power if power > 0 else 0.0
        return ChargeEstimate(
            duration=timedelta(hours=hours),
            power_kw=power,
            source=source,
            confidence=model.confidence,
            n_samples=model.n_samples,
        )
