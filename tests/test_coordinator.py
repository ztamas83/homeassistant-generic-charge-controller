"""Tests for ChargeControllerCoordinator."""
from unittest.mock import MagicMock
import pytest
from custom_components.generic_charge_controller.coordinator import ChargeControllerCoordinator
from custom_components.generic_charge_controller.const import DOMAIN

@pytest.mark.asyncio
async def test_coordinator_load_balancing(hass, mock_config_entry, mock_store):
    """Test coordinator load balancing logic with refactored config."""
    hass.data[DOMAIN]["store"] = mock_store
    
    # Setup mock store data with new structure
    mock_store.get_chargers.return_value = {
        "charger_1": {
            "charger_id": "charger_1",
            "household_id": "house_1",
            "rated_current": 16,
            "L1": "sensor.easee.state.attributes[phase 1]",
            "L2": "sensor.easee.state.attributes[phase 2]",
            "L3": "sensor.easee.state.attributes[phase 3]",
        }
    }
    mock_store.get_households.return_value = {
        "house_1": {
            "device_id": "house_1",
            "L1": "sensor.house_l1",
            "L2": "sensor.house_l2",
            "L3": "sensor.house_l3",
        }
    }
    
    # Setup mock states
    def get_state(entity_id):
        if entity_id == "sensor.house_l1":
            return MagicMock(state="10.0")
        if entity_id == "sensor.house_l2":
            return MagicMock(state="5.0")
        if entity_id == "sensor.house_l3":
            return MagicMock(state="2.0")
        if entity_id == "sensor.easee":
            return MagicMock(state="online", attributes={
                "phase 1": 8.0,
                "phase 2": 4.0,
                "phase 3": 0.0
            })
        return None

    hass.states.get.side_effect = get_state
    
    coordinator = ChargeControllerCoordinator(hass, mock_config_entry)
    
    # Trigger update
    data = await coordinator._async_update_data()
    
    # Verify results
    assert "chargers" in data
    charger_data = data["chargers"]["charger_1"]
    
    # Expected results (AdvancedCalculator SAFETY_MARGIN = 2):
    # L1: 16 - (10 - 8) - 2 = 12.0
    # L2: 16 - (5 - 4) - 2 = 13.0
    # L3: 16 - (2 - 0) - 2 = 12.0
    
    # Internal phase mapping from attributes[phase X] -> PX
    assert charger_data["target_current_P1"] == 12.0
    assert charger_data["target_current_P2"] == 13.0
    assert charger_data["target_current_P3"] == 12.0
    assert charger_data["mode"] == "balancing"
