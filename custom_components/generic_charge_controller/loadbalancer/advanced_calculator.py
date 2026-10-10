"""Advanced current calculations using EWMA"""

from __future__ import annotations
from typing import Dict

from .abstract_loadbalancer import AbstractLoadBalancer

SAFETY_MARGIN = 2
EWMA_ALPHA = 0.25  # Smoothing factor for Exponential Weighted Moving Average


class AdvancedCalculator(AbstractLoadBalancer):
    """Target current calculator using EWMA smoothing"""

    def __init__(self, logger) -> None:
        self._logger = logger
        self._smoothed_loads: Dict[str, float] = {}

    def _ewma(self, prev_smoothed: float, current_sample: float, alpha: float = EWMA_ALPHA) -> float:
        """
        Calculate Exponential Weighted Moving Average (EWMA).
        Formula: smoothed = alpha * current + (1 - alpha) * prev_smoothed
        """
        return alpha * current_sample + (1 - alpha) * prev_smoothed

    def _get_new_current(self, rated_current: float, calc_load: float) -> float:
        return float(max(0, rated_current - int(calc_load) - SAFETY_MARGIN))

    def calculate_target_current(
        self, 
        charger_id: str, 
        phase_mapping: dict[str, str],  # Now ignored or removed from call
        current_load_ampere: dict[str, float], 
        charger_load_ampere: dict[str, float],
        rated_current_ampere: float
    ) -> dict[str, float]:
        """
        Calculate target current for each phase.
        Expects current_load_ampere and charger_load_ampere to be aligned 
        (e.g. both use "L1", "L2", "L3" as keys representing household phases).
        """

        targets = {}
        for phase in current_load_ampere:
            total_load = current_load_ampere[phase]
            this_charger_load = charger_load_ampere.get(phase, 0.0)
            
            # Load from everything except this charger
            non_charger_load = total_load - this_charger_load
            
            key = f"{charger_id}_{phase}"
            if key not in self._smoothed_loads:
                smoothed = non_charger_load
            else:
                smoothed = self._ewma(self._smoothed_loads[key], non_charger_load)
            
            self._smoothed_loads[key] = smoothed
            targets[phase] = self._get_new_current(
                rated_current_ampere, smoothed
            )

        return targets
