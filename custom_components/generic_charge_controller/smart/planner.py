"""Cheapest-slots charge planner.

Pure calculation without Home Assistant dependencies.
"""

from __future__ import annotations

import math
from datetime import datetime
from typing import Callable

from .models import ChargeBlock, ChargePlan, PriceSlot

UNITS_PER_KWH = 100  # energy resolution of the DP (0.01 kWh)

# (energy units capped at need, cost, first slot index, bitmask of taken slots)
_State = tuple[int, float, int, int]


def plan_cheapest(
    slots: list[PriceSlot],
    now: datetime,
    deadline: datetime | None,
    energy_kwh: float,
    max_blocks: int,
    power_at: Callable[[datetime], float],
    inputs_key: str = "",
) -> ChargePlan:
    """Pick the cheapest slots delivering `energy_kwh`, in at most `max_blocks` runs.

    Window: slots ending after `now` and starting before `deadline`. The running
    slot is included and counts as a whole slot. A slot delivers
    power_at(slot.start) * slot hours.
    """
    window = sorted(
        (
            s
            for s in slots
            if s.end > now and (deadline is None or s.start < deadline)
            and (deadline is None or s.end <= deadline)
        ),
        key=lambda s: s.start,
    )
    if not window or energy_kwh <= 0:
        return ChargePlan([], window, 0.0, now, inputs_key, False)

    energies = [max(0.0, power_at(s.start)) * (s.end - s.start).total_seconds() / 3600 for s in window]
    need = math.ceil(energy_kwh * UNITS_PER_KWH - 1e-6)
    units = [round(e * UNITS_PER_KWH) for e in energies]
    insufficient = False
    if sum(units) <= need:
        insufficient = sum(units) < need
        selected = list(range(len(window)))
    else:
        selected = _select(window, energies, units, need, max(1, max_blocks))

    return _build(window, energies, selected, energy_kwh, now, inputs_key, insufficient)


def _prune(states: list[_State]) -> list[_State]:
    """Keep the Pareto front: more energy and lower cost win, then earlier first slot."""
    states.sort(key=lambda s: (-s[0], s[1], s[2]))
    out: list[_State] = []
    best_cost = math.inf
    for st in states:
        if st[1] < best_cost:
            out.append(st)
            best_cost = st[1]
    return out


def _select(
    window: list[PriceSlot],
    energies: list[float],
    units: list[int],
    need: int,
    max_blocks: int,
) -> list[int]:
    """DP: min cost to reach `need` energy units in at most max_blocks runs."""
    m = len(window)
    suffix = [0] * (m + 1)
    for i in range(m - 1, -1, -1):
        suffix[i] = suffix[i + 1] + units[i]
    # (blocks used, previous slot taken) -> Pareto front
    cur: dict[tuple[int, bool], list[_State]] = {(0, False): [(0, 0.0, 0, 0)]}
    for i, slot in enumerate(window):
        contiguous = i > 0 and window[i - 1].end == slot.start
        cand: dict[tuple[int, bool], list[_State]] = {}
        for (k, last), front in cur.items():
            for e, cost, first, mask in front:
                if e + suffix[i + 1] >= need:
                    cand.setdefault((k, False), []).append((e, cost, first, mask))
                if e >= need:
                    continue
                nk = k if (last and contiguous) else k + 1
                if nk > max_blocks:
                    continue
                ne = min(need, e + units[i])
                if ne + suffix[i + 1] < need:
                    continue
                cand.setdefault((nk, True), []).append(
                    (
                        ne,
                        round(cost + slot.price * energies[i], 9),
                        first if mask else i,
                        mask | (1 << i),
                    )
                )
        cur = {key: _prune(v) for key, v in cand.items()}

    best: tuple[float, int, int, int] | None = None
    for (k, _), front in cur.items():
        for e, cost, first, mask in front:
            if e >= need and mask:
                c = (cost, k, first, mask)
                if best is None or c[:3] < best[:3]:
                    best = c
    assert best is not None
    return [i for i in range(m) if best[3] >> i & 1]


def _build(
    window: list[PriceSlot],
    energies: list[float],
    selected: list[int],
    energy_kwh: float,
    now: datetime,
    inputs_key: str,
    insufficient: bool,
) -> ChargePlan:
    """Merge selected slots into blocks and compute costs.

    In chronological order the last slot's energy is cut to what is still needed.
    """
    blocks: list[ChargeBlock] = []
    total = 0.0
    remaining = energy_kwh
    cur_start: datetime | None = None
    cur_end: datetime | None = None
    cur_cost = 0.0
    for idx in selected:
        s = window[idx]
        e = min(energies[idx], max(remaining, 0.0))
        remaining -= e
        c = s.price * e
        total += c
        if cur_end is not None and cur_end == s.start:
            cur_end = s.end
            cur_cost += c
        else:
            if cur_start is not None and cur_end is not None:
                blocks.append(ChargeBlock(cur_start, cur_end, cur_cost))
            cur_start, cur_end, cur_cost = s.start, s.end, c
    if cur_start is not None and cur_end is not None:
        blocks.append(ChargeBlock(cur_start, cur_end, cur_cost))
    return ChargePlan(blocks, window, total, now, inputs_key, insufficient)
