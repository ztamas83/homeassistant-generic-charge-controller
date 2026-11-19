"""Tests for charge rate learning."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest

from custom_components.generic_charge_controller.smart.learning.collector import SampleCollector
from custom_components.generic_charge_controller.smart.learning.manager import LearningManager
from custom_components.generic_charge_controller.smart.learning.model import (
    AverageRateModel,
    HourlyRateModel,
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
    [{"power": None}, {"power": 0.5}, {"mode": "failsafe"},
     {"mode": "scheduled_pause"}, {"connected": False}],
)
def test_collector_invalid(kw):
    assert run(SampleCollector(), 30, **kw) == []


def test_collector_limited_is_valid():
    assert run(SampleCollector(), 12, mode="limited") == [pytest.approx(10.0)]


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
    for i in range(10):
        mgr._update("a", 10.0 + (0.1 if i % 2 else -0.1), at=T0 + timedelta(hours=i))
    before = mgr.model("a").predict_power_kw(None)
    mgr._update("a", 30.0, at=T0 + timedelta(hours=11))
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


def at(day, hour, minute=0):
    return T0 + timedelta(days=day, hours=hour, minutes=minute)


def test_hourly_buckets_and_local_hour_lookup():
    m = HourlyRateModel()
    assert m.predict_power_kw(None, T0) is None
    for d in range(3):
        m.update(4.0, at=at(d, 2, 10))
        m.update(4.0, at=at(d, 2, 40))  # same bucket
        m.update(10.0, at=at(d, 5))
    assert m.n_samples == 9
    # 2 UTC hour: 6 samples at 4.0, 5 UTC hour: 3 samples at 10.0
    assert m.predict_power_kw(None, at(10, 2)) == pytest.approx(4.0)
    assert m.predict_power_kw(None, at(10, 5)) == pytest.approx(10.0)
    # unknown hour falls back to the window mean
    assert m.predict_power_kw(None, at(10, 9)) == pytest.approx((24 + 30) / 9)
    assert m.predict_power_kw(None) == pytest.approx((24 + 30) / 9)
    # local hour: UTC+2 sees the 2 UTC hour as local hour 4
    tz = timezone(timedelta(hours=2))
    assert m.predict_power_kw(None, at(10, 2).astimezone(tz)) == pytest.approx(4.0)
    profile = m.hourly_profile(tz)
    assert profile[4] == pytest.approx(4.0) and profile[7] == pytest.approx(10.0)
    assert profile[0] is None and len(profile) == 24


def test_hourly_min_hour_samples_fallback():
    m = HourlyRateModel()
    m.update(4.0, at=at(0, 2))
    m.update(4.0, at=at(1, 2))
    m.update(10.0, at=at(0, 6))
    m.update(10.0, at=at(1, 6))
    m.update(10.0, at=at(2, 6))
    assert m.predict_power_kw(None, at(5, 2)) == pytest.approx(m.predict_power_kw(None))
    assert m.predict_power_kw(None, at(5, 6)) == pytest.approx(10.0)
    assert m.hourly_profile(timezone.utc)[2] is None


def test_hourly_window_pruning():
    m = HourlyRateModel()
    m.update(4.0, at=at(0, 2))
    m.update(8.0, at=at(6, 2))
    assert m.n_samples == 2
    m.update(10.0, at=at(8, 2))  # day 0 is now older than 7 days
    assert m.n_samples == 2
    assert m.predict_power_kw(None) == pytest.approx(9.0)
    # no charging for a long time: nothing is dropped without a new update
    assert m.predict_power_kw(None, at(100, 2)) == pytest.approx(9.0)


def test_hourly_update_without_at_and_weight():
    m = HourlyRateModel()
    m.update(6.0)
    m.update(6.0)
    assert m.n_samples == 2 and m.predict_power_kw(None) == pytest.approx(6.0)
    m.update(100.0, weight=0.01)
    assert m.predict_power_kw(None) == pytest.approx((12 + 1) / 2.01)


def test_hourly_roundtrip_and_confidence():
    m = HourlyRateModel()
    for i in range(20):
        m.update(10.0, at=at(0, 0, 0) + timedelta(hours=i))
    assert m.confidence == pytest.approx(1.0) and m.std_kw == pytest.approx(0)
    d = m.to_dict()
    assert d["type"] == "hourly" and "version" in d
    assert all(isinstance(k, str) for k in d["buckets"])
    m2 = model_from_dict(d)
    assert isinstance(m2, HourlyRateModel)
    assert m2.n_samples == 20 and m2.predict_power_kw(None, at(1, 3)) == pytest.approx(10.0)


async def test_backfill_hourly_float_and_datetime_starts(hass):
    mgr = LearningManager(hass)
    base = T0.timestamp()
    rows = [
        {"start": base + 3600 * i, "mean": 7.0} for i in range(3)
    ] + [{"start": T0 + timedelta(days=1, hours=i), "mean": 9.0} for i in range(3)]
    with patch("homeassistant.components.recorder.get_instance") as gi:
        async def run_job(fn, *args):
            return {"sensor.p": rows}
        gi.return_value.async_add_executor_job = run_job
        await mgr.async_backfill("a", "sensor.p", "hourly")
    model = mgr.model("a", "hourly")
    assert isinstance(model, HourlyRateModel) and model.n_samples == 6
    assert len(model._buckets) == 6
    assert min(model._buckets) == int(base)


async def test_power_at_and_estimate_over_slots(hass):
    mgr = LearningManager(hass)
    assert mgr.power_at("a", T0, 11.0, None, "hourly") == 11.0
    for d in range(3):
        for _ in range(2):
            mgr._update("a", 4.0, "hourly", at(d, 2))
            mgr._update("a", 8.0, "hourly", at(d, 3))
    assert mgr.power_at("a", at(9, 2), 11.0, None, "hourly") == pytest.approx(4.0)
    est = mgr.estimate("a", 12.0, 11.0, None, "hourly", [at(9, 2), at(9, 3)])
    assert est.power_kw == pytest.approx(6.0)
    assert est.duration == timedelta(hours=2) and est.source == "learned"
    assert len(est.hourly_kw) == 24 and any(v is not None for v in est.hourly_kw)
