"""Tests for charge rate learning."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from custom_components.generic_charge_controller.smart.learning.collector import SampleCollector
from custom_components.generic_charge_controller.smart.learning.manager import LearningManager
from custom_components.generic_charge_controller.smart.learning.model import (
    AverageRateModel,
    model_from_dict,
)

T0 = datetime(2026, 1, 1, tzinfo=timezone.utc)


def test_model_mean_variance():
    m = AverageRateModel()
    assert m.predict_power_kw(None) is None
    m.update(10.0)
    assert m.predict_power_kw(None) == 10.0
    assert m.std_kw == 0
    m.update(12.0)
    assert 10.0 < m.predict_power_kw(None) < 12.0
    assert m.std_kw > 0
    assert m.n_samples == 2


def test_model_confidence_and_roundtrip():
    m = AverageRateModel()
    for _ in range(20):
        m.update(10.0)
    assert m.confidence == pytest.approx(1.0)
    d = m.to_dict()
    assert d["type"] == "average" and "version" in d
    m2 = model_from_dict(d)
    assert m2.n_samples == 20 and m2.predict_power_kw(None) == 10.0


def run(c, ticks, power=10.0, mode="normal", connected=True, step=30):
    out = []
    for i in range(ticks):
        out.append(c.add(T0 + timedelta(seconds=i * step), power, mode, connected))
    return [o for o in out if o is not None]


def test_collector_emits_every_5_min():
    assert run(SampleCollector(), 12) == [pytest.approx(10.0)]


@pytest.mark.parametrize(
    "kw",
    [{"power": None}, {"power": 0.5}, {"mode": "limited"}, {"mode": "failsafe"},
     {"mode": "scheduled_pause"}, {"connected": False}],
)
def test_collector_invalid(kw):
    assert run(SampleCollector(), 30, **kw) == []


def test_collector_invalid_tick_clears():
    c = SampleCollector()
    run(c, 8)
    assert c.add(T0 + timedelta(seconds=240), None, "normal", True) is None
    # restarting: needs a full 5 min again
    out = []
    for i in range(1, 9):
        out.append(c.add(T0 + timedelta(seconds=240 + i * 30), 10.0, "normal", True))
    assert all(o is None for o in out)


def test_collector_gap_clears():
    c = SampleCollector()
    run(c, 8)
    assert c.add(T0 + timedelta(seconds=1000), 10.0, "normal", True) is None
    out = [c.add(T0 + timedelta(seconds=1000 + i * 30), 10.0, "normal", True) for i in range(1, 9)]
    assert all(o is None for o in out)


async def test_manager_feed_and_outlier(hass):
    mgr = LearningManager(hass)
    for _ in range(10):
        mgr._update("a", 10.0 + (0.1 if _ % 2 else -0.1))
    before = mgr.model("a").predict_power_kw(None)
    mgr._update("a", 30.0)
    assert mgr.model("a").predict_power_kw(None) == pytest.approx(before, abs=0.05)


async def test_manager_feed_collects(hass):
    mgr = LearningManager(hass)
    for i in range(12):
        mgr.feed("a", T0 + timedelta(seconds=i * 30), 10.0, "normal", True)
    assert mgr.model("a").n_samples == 1


async def test_manager_persistence_and_reset(hass):
    mgr = LearningManager(hass)
    for _ in range(3):
        mgr._update("a", 8.0)
    await mgr.async_save()
    mgr2 = LearningManager(hass)
    await mgr2.async_load()
    assert mgr2.model("a").n_samples == 3
    mgr2.reset("a")
    assert mgr2.model("a").n_samples == 0


async def test_estimate_gating(hass):
    mgr = LearningManager(hass)
    est = mgr.estimate("a", 22.0, 11.0)
    assert est.source == "fallback" and est.duration == timedelta(hours=2)
    for _ in range(20):
        mgr._update("a", 7.0)
    est = mgr.estimate("a", 14.0, 11.0)
    assert est.source == "learned"
    assert est.duration == timedelta(hours=2)
    assert est.n_samples == 20


async def test_model_type_is_kept(hass, monkeypatch):
    from custom_components.generic_charge_controller.smart.learning import manager as mgr_mod

    class Other(mgr_mod.MODELS["average"]):
        TYPE = "other"

    monkeypatch.setitem(mgr_mod.MODELS, "other", Other)
    mgr = LearningManager(hass)
    mgr._update("a", 7.0, "other")
    mgr._update("a", 7.0, "other")
    assert isinstance(mgr.model("a", "other"), Other)
    assert mgr.model("a", "other").n_samples == 2
    assert mgr.estimate("a", 14.0, 11.0, model_type="other").n_samples == 2


async def test_backfill(hass):
    mgr = LearningManager(hass)
    rows = [{"mean": 7.0}, {"mean": 0.2}, {"mean": 7.2}, {"mean": None}]
    with patch(
        "homeassistant.components.recorder.get_instance"
    ) as gi:
        async def run_job(fn, *args):
            return {"sensor.p": rows}
        gi.return_value.async_add_executor_job = run_job
        await mgr.async_backfill("a", "sensor.p")
        assert mgr.model("a").n_samples == 2
        await mgr.async_backfill("a", "sensor.p")
        assert mgr.model("a").n_samples == 2


async def test_backfill_tolerates_errors(hass):
    mgr = LearningManager(hass)
    with patch(
        "homeassistant.components.recorder.get_instance", side_effect=KeyError("x")
    ):
        await mgr.async_backfill("a", "sensor.p")
    assert mgr.model("a").n_samples == 0


async def test_start_stop(hass):
    mgr = LearningManager(hass)
    unsub = mgr.async_start()
    unsub()
    await mgr.async_stop()
