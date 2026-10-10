"""Simple current calculations with running mean"""

from __future__ import annotations
import numpy
from math import trunc
from typing import Dict

from .abstract_loadbalancer import AbstractLoadBalancer

SAFETY_MARGIN = 1


class Calculator(AbstractLoadBalancer):
    """Target current calculator using running mean"""

    def __init__(self, logger) -> None:
        self._logger = logger
        self._samples: Dict[str, list[float]] = {}

    def _running_mean(self, samples: list[float], window_size: int) -> float:
        """Running mean calculator"""
        valid_window = min(window_size, len(samples))
        if not valid_window:
            return 0.0

        relevant_samples = samples[-valid_window:]
        return sum(relevant_samples) / float(valid_window)

    def _get_new_current(self, rated_current: float, calc_load: float) -> float:
        return float(max(0, rated_current - trunc(calc_load) - SAFETY_MARGIN))

    def calculate_target_current(
        self, 
        charger_id: str, 
        phase_mapping: dict[str, str],
        current_load_ampere: dict[str, float], 
        charger_load_ampere: dict[str, float],
        rated_current_ampere: float
    ) -> dict[str, float]:
        """Calculate target current for a given charger using running mean"""
        
        # Simple implementation ignoring charger_load for now as per previous version
        # but matching signature.
        targets_by_house_phase = {}
        for phase, load in current_load_ampere.items():
            key = f"{charger_id}_{phase}"
            if key not in self._samples:
                self._samples[key] = []
            
            self._samples[key].append(load)
            if len(self._samples[key]) > 6:
                self._samples[key].pop(0)
            
            mean_load = self._running_mean(self._samples[key], 6)
            targets_by_house_phase[phase] = self._get_new_current(rated_current_ampere, mean_load)

        # Apply mapping to charger phases
        charger_targets = {}
        mapping_internal = {
            "L1": phase_mapping.get("house_l1", "cl1"),
            "L2": phase_mapping.get("house_l2", "cl2"),
            "L3": phase_mapping.get("house_l3", "cl3"),
        }

        for house_phase, charger_phase in mapping_internal.items():
            if house_phase in targets_by_house_phase:
                charger_targets[charger_phase] = targets_by_house_phase[house_phase]

        return charger_targets
