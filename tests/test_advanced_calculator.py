"""Tests for AdvancedCalculator."""
import logging
import pytest
from custom_components.generic_charge_controller.loadbalancer.advanced_calculator import AdvancedCalculator

_LOGGER = logging.getLogger(__name__)

def test_calculation_logic():
    """Test the core calculation logic without internal mapping."""
    calc = AdvancedCalculator(_LOGGER)
    
    charger_id = "test_charger"
    rated_current = 16.0
    
    # House loads on phases L1, L2, L3
    current_load = {"L1": 10.0, "L2": 5.0, "L3": 2.0}
    # Charger loads on phases L1, L2, L3
    charger_load = {"L1": 8.0, "L2": 4.0, "L3": 0.0}
    
    # Expected results:
    # Formula: target = limit - (household_total - charger_load) - safety(2)
    # target_L1 = 16 - (10 - 8) - 2 = 12.0
    # target_L2 = 16 - (5 - 4) - 2 = 13.0
    # target_L3 = 16 - (2 - 0) - 2 = 12.0
    
    targets = calc.calculate_target_current(
        charger_id=charger_id,
        phase_mapping={}, # Now unused
        current_load_ampere=current_load,
        charger_load_ampere=charger_load,
        rated_current_ampere=rated_current
    )

    assert targets["L1"] == 12.0
    assert targets["L2"] == 13.0
    assert targets["L3"] == 12.0

def test_ewma_smoothing():
    """Test that EWMA smoothing works correctly across multiple calls."""
    calc = AdvancedCalculator(_LOGGER)
    
    charger_id = "test_charger"
    rated_current = 16.0
    
    # First call: house load 10A, charger load 0A -> non_charger = 10A
    # Smoothed = 10A
    # Target = 16 - 10 - 2 = 4.0
    targets = calc.calculate_target_current(
        charger_id=charger_id,
        phase_mapping={},
        current_load_ampere={"L1": 10.0},
        charger_load_ampere={"L1": 0.0},
        rated_current_ampere=rated_current
    )
    assert targets["L1"] == 4.0
    
    # Second call: house load 20A, charger load 4A -> non_charger = 16A
    # EWMA_ALPHA = 0.25
    # Smoothed = 0.25 * 16 + 0.75 * 10 = 4 + 7.5 = 11.5
    # Target = 16 - int(11.5) - 2 = 16 - 11 - 2 = 3.0
    targets = calc.calculate_target_current(
        charger_id=charger_id,
        phase_mapping={},
        current_load_ampere={"L1": 20.0},
        charger_load_ampere={"L1": 4.0},
        rated_current_ampere=rated_current
    )
    assert targets["L1"] == 3.0
