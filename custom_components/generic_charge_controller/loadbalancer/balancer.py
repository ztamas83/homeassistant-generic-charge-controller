"""Per-phase charging current calculation that protects the household main fuse.

Pure calculation without Home Assistant dependencies, so it can be tested in isolation.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class BalancerConfig:
    """Parameters for the load balancer."""

    fuse_a: float
    safety_margin_a: float
    min_current_a: float
    ramp_up_a_per_min: float


@dataclass(frozen=True)
class PhaseLoad:
    """Measured currents on one household phase.

    household_a: total load on the phase including the charger, None if unknown.
    charger_a: the charger's share of that load, None if unknown.
    """

    household_a: float | None
    charger_a: float | None


@dataclass(frozen=True)
class BalancerResult:
    """Target charging current per household phase."""

    targets: dict[str, float]
    failsafe: bool = False
    limited: bool = False
    reasons: list[str] = field(default_factory=list)


class SafeLoadBalancer:
    """Calculates charging current per phase from the load of everything else.

    Safety rules:
    - Unknown household load on any phase: fail-safe, every phase 0 A.
    - Unknown charger load: assumed 0 A, which overestimates the other load.
    - The other load is rounded up to whole ampere.
    - Lower targets apply immediately; higher targets ramp up over time.
    - Targets are whole ampere, at most max_current_a; below the minimum
      charging current a phase gets 0 A.
    """

    def __init__(self, config: BalancerConfig) -> None:
        self.config = config
        self._headroom: dict[str, float] = {}
        self._last_update: datetime | None = None

    def calculate(
        self,
        loads: dict[str, PhaseLoad],
        max_current_a: float | None,
        now: datetime,
    ) -> BalancerResult:
        """Return the target current per household phase."""
        cfg = self.config

        missing = [phase for phase, load in loads.items() if load.household_a is None]
        if missing:
            # Start without history when readings come back
            self._headroom.clear()
            self._last_update = None
            return BalancerResult(
                targets={phase: 0.0 for phase in loads},
                failsafe=True,
                reasons=[f"No valid household load for {', '.join(missing)}"],
            )

        reasons = []
        unknown_charger = [p for p, load in loads.items() if load.charger_a is None]
        if unknown_charger:
            reasons.append(
                f"Charger current unknown for {', '.join(unknown_charger)}, assuming 0 A"
            )

        elapsed_min = (
            max(0.0, (now - self._last_update).total_seconds() / 60)
            if self._last_update is not None
            else 0.0
        )
        cap = cfg.fuse_a - cfg.safety_margin_a
        if max_current_a is not None:
            cap = min(cap, max_current_a)

        targets = {}
        limited = False
        for phase, load in loads.items():
            other_load = max(0.0, load.household_a - (load.charger_a or 0.0))
            headroom = cfg.fuse_a - cfg.safety_margin_a - math.ceil(other_load)

            previous = self._headroom.get(phase)
            if previous is not None and headroom > previous:
                headroom = min(headroom, previous + cfg.ramp_up_a_per_min * elapsed_min)
            self._headroom[phase] = headroom

            target = float(math.floor(min(headroom, cap)))
            if target < cfg.min_current_a:
                target = 0.0
            if target < cap:
                limited = True
            targets[phase] = target

        self._last_update = now
        return BalancerResult(targets=targets, limited=limited, reasons=reasons)
