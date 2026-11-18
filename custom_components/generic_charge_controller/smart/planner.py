"""Cheapest-slots charge planner.

Pure calculation without Home Assistant dependencies.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta

from .models import ChargeBlock, ChargePlan, PriceSlot

_INF = (math.inf, 0, 0)


def plan_cheapest(
    slots: list[PriceSlot],
    now: datetime,
    deadline: datetime | None,
    duration: timedelta,
    max_blocks: int,
    power_kw: float,
    inputs_key: str = "",
) -> ChargePlan:
    """Pick the cheapest slots for `duration`, in at most `max_blocks` contiguous runs.

    Window: slots ending after `now` and starting before `deadline`. The running
    slot is included and counts as a whole slot.
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
    if not window or duration <= timedelta(0):
        return ChargePlan([], window, 0.0, now, inputs_key, False)

    slot_len = window[0].end - window[0].start
    n_needed = math.ceil(duration / slot_len)
    insufficient = False
    if len(window) <= n_needed:
        insufficient = len(window) < n_needed
        selected = list(range(len(window)))
    else:
        selected = _select(window, n_needed, max(1, max_blocks))

    return _build(window, selected, power_kw, now, inputs_key, insufficient)


def _select(window: list[PriceSlot], n: int, max_blocks: int) -> list[int]:
    """DP: min cost over exactly n slots in at most max_blocks runs."""
    m = len(window)
    # state (j selected, k blocks, last selected?) -> (cost, first index, bitmask)
    cur: dict[tuple[int, int, bool], tuple[float, int, int]] = {(0, 0, False): (0.0, 0, 0)}
    for i, slot in enumerate(window):
        contiguous = i > 0 and window[i - 1].end == slot.start
        nxt: dict[tuple[int, int, bool], tuple[float, int, int]] = {}

        def put(key: tuple[int, int, bool], val: tuple[float, int, int]) -> None:
            old = nxt.get(key)
            if old is None or (val[0], val[1]) < (old[0], old[1]):
                nxt[key] = val

        for (j, k, last), (cost, first, mask) in cur.items():
            # skip slot
            put((j, k, False), (cost, first, mask))
            # take slot
            if j < n and m - i >= n - j:
                if last and contiguous:
                    nk = k
                else:
                    nk = k + 1
                if nk <= max_blocks:
                    nfirst = first if j > 0 else i
                    put(
                        (j + 1, nk, True),
                        (round(cost + slot.price, 9), nfirst, mask | (1 << i)),
                    )
        cur = nxt

    best: tuple[float, int, int, int] | None = None
    for (j, k, _), (cost, first, mask) in cur.items():
        if j != n:
            continue
        cand = (cost, k, first, mask)
        if best is None or cand[:3] < best[:3]:
            best = cand
    assert best is not None
    return [i for i in range(m) if best[3] >> i & 1]


def _build(
    window: list[PriceSlot],
    selected: list[int],
    power_kw: float,
    now: datetime,
    inputs_key: str,
    insufficient: bool,
) -> ChargePlan:
    """Merge selected slots into blocks and compute costs."""
    blocks: list[ChargeBlock] = []
    total = 0.0
    cur_start: datetime | None = None
    cur_end: datetime | None = None
    cur_cost = 0.0
    for idx in selected:
        s = window[idx]
        c = s.price * power_kw * (s.end - s.start).total_seconds() / 3600
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
