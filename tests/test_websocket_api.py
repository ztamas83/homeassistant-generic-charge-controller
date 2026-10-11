"""Tests for the WebSocket API."""

import pytest
from homeassistant.helpers import entity_registry as er

from custom_components.generic_charge_controller.const import DOMAIN

from .conftest import EASEE_SERIAL, HOUSEHOLD_CONFIG, PHASE_MAP, setup_integration

pytestmark = pytest.mark.usefixtures("enable_custom_integrations", "mock_panel")


@pytest.fixture
async def ws(hass, hass_ws_client, hass_storage):
    """WebSocket client with the integration set up and an empty store."""
    await setup_integration(hass)
    client = await hass_ws_client(hass)
    msg_id = 0

    async def call(msg_type: str, **kwargs) -> dict:
        nonlocal msg_id
        msg_id += 1
        await client.send_json({"id": msg_id, "type": f"{DOMAIN}/{msg_type}", **kwargs})
        return await client.receive_json()

    return call


async def _create_household(ws) -> str:
    result = await ws("households/save", config=HOUSEHOLD_CONFIG)
    assert result["success"], result
    return result["result"]["household_id"]


async def test_create_and_get_household(hass, ws):
    """A new household gets an id and creates load sensors."""
    result = await ws("households/save", config={**HOUSEHOLD_CONFIG, "name": "  Home  "})

    assert result["success"]
    household = result["result"]
    assert household["name"] == "Home"
    assert household["fuse_a"] == 20

    result = await ws("households/get")
    assert result["result"] == {household["household_id"]: household}

    await hass.async_block_till_done()
    assert er.async_get(hass).async_get_entity_id(
        "sensor", DOMAIN, f"{DOMAIN}_household_{household['household_id']}_load_l1"
    )


async def test_update_household(hass, ws):
    """Saving with a household id updates that household."""
    household_id = await _create_household(ws)

    result = await ws(
        "households/save",
        household_id=household_id,
        config={**HOUSEHOLD_CONFIG, "fuse_a": "25"},
    )

    assert result["success"]
    assert result["result"]["fuse_a"] == 25
    assert len((await ws("households/get"))["result"]) == 1


async def test_update_unknown_household(hass, ws):
    """Updating a household that does not exist fails."""
    result = await ws("households/save", household_id="nope", config=HOUSEHOLD_CONFIG)

    assert not result["success"]
    assert result["error"]["code"] == "not_found"


@pytest.mark.parametrize(
    "config",
    [
        {**HOUSEHOLD_CONFIG, "fuse_a": 5},
        {**HOUSEHOLD_CONFIG, "fuse_a": 251},
        {**HOUSEHOLD_CONFIG, "name": "   "},
        {**HOUSEHOLD_CONFIG, "l1_entity": "switch.meter_l1"},
        {**HOUSEHOLD_CONFIG, "l1_entity": "not an entity"},
        {**HOUSEHOLD_CONFIG, "unexpected": 1},
        {k: v for k, v in HOUSEHOLD_CONFIG.items() if k != "l3_entity"},
    ],
)
async def test_invalid_household(hass, ws, config):
    """Invalid household configs are rejected."""
    result = await ws("households/save", config=config)

    assert not result["success"]
    assert result["error"]["code"] == "invalid_format"


async def test_save_charger(hass, ws, easee_device):
    """A charger linked to a household creates charger sensors."""
    household_id = await _create_household(ws)
    config = {"type": "easee", "household_id": household_id, "phase_map": PHASE_MAP}

    result = await ws("chargers/save", charger_id=easee_device.id, config=config)

    assert result["success"], result
    assert result["result"] == {"charger_id": easee_device.id, **config}

    await hass.async_block_till_done()
    assert er.async_get(hass).async_get_entity_id(
        "sensor", DOMAIN, f"{DOMAIN}_{easee_device.id}_mode"
    )


async def test_save_charger_unknown_device(hass, ws):
    """A charger must be an existing HA device."""
    household_id = await _create_household(ws)

    result = await ws(
        "chargers/save",
        charger_id="nope",
        config={"type": "easee", "household_id": household_id, "phase_map": PHASE_MAP},
    )

    assert result["error"]["code"] == "not_found"


async def test_save_charger_unknown_household(hass, ws, easee_device):
    """A charger must reference an existing household."""
    result = await ws(
        "chargers/save",
        charger_id=easee_device.id,
        config={"type": "easee", "household_id": "nope", "phase_map": PHASE_MAP},
    )

    assert result["error"]["code"] == "not_found"


@pytest.mark.parametrize(
    "phase_map",
    [
        {"L1": "P1", "L2": "P1", "L3": "P3"},
        {"L1": "P1", "L2": "P2"},
        {"L1": "P1", "L2": "P2", "L3": "P4"},
    ],
)
async def test_invalid_phase_map(hass, ws, easee_device, phase_map):
    """Each household phase maps to a distinct charger phase."""
    household_id = await _create_household(ws)

    result = await ws(
        "chargers/save",
        charger_id=easee_device.id,
        config={"type": "easee", "household_id": household_id, "phase_map": phase_map},
    )

    assert result["error"]["code"] == "invalid_format"


async def test_delete_household_in_use(hass, ws, easee_device):
    """A household cannot be deleted while a charger uses it."""
    household_id = await _create_household(ws)
    await ws(
        "chargers/save",
        charger_id=easee_device.id,
        config={"type": "easee", "household_id": household_id, "phase_map": PHASE_MAP},
    )

    result = await ws("households/delete", household_id=household_id)
    assert result["error"]["code"] == "household_in_use"

    assert (await ws("chargers/delete", charger_id=easee_device.id))["success"]
    assert (await ws("households/delete", household_id=household_id))["success"]
    assert (await ws("households/get"))["result"] == {}

    await hass.async_block_till_done()
    assert not er.async_get(hass).async_get_entity_id(
        "sensor", DOMAIN, f"{DOMAIN}_household_{household_id}_load_l1"
    )


async def test_discover_chargers(hass, ws, easee_device):
    """Easee chargers are found with their sensor entity ids."""
    result = await ws("chargers/discover")

    assert result["result"] == [
        {
            "device_id": easee_device.id,
            "name": "Garage charger",
            "serial": EASEE_SERIAL,
            "model": "Home",
            "entities": {
                "status": "sensor.garage_charger_status",
                "power": "sensor.garage_charger_power",
                "circuit_current": "sensor.garage_charger_circuit_current",
                "max_circuit_limit": "sensor.garage_charger_max_circuit_limit",
            },
            "disabled_entities": [],
        }
    ]


async def test_discover_reports_disabled_entities(hass, ws, easee_device):
    """A disabled circuit_current entity is reported, so the panel can show a hint."""
    er.async_get(hass).async_update_entity(
        "sensor.garage_charger_circuit_current",
        disabled_by=er.RegistryEntryDisabler.INTEGRATION,
    )

    charger = (await ws("chargers/discover"))["result"][0]

    assert "circuit_current" not in charger["entities"]
    assert charger["disabled_entities"] == ["circuit_current"]


async def test_entities(hass, ws, easee_device):
    """Entity ids of the integration's sensors are returned per household and charger."""
    household_id = await _create_household(ws)
    await ws(
        "chargers/save",
        charger_id=easee_device.id,
        config={"type": "easee", "household_id": household_id, "phase_map": PHASE_MAP},
    )
    await hass.async_block_till_done()

    result = (await ws("entities"))["result"]

    assert result["households"] == {
        household_id: {
            "L1": "sensor.home_load_l1",
            "L2": "sensor.home_load_l2",
            "L3": "sensor.home_load_l3",
        }
    }
    charger = result["chargers"][easee_device.id]
    assert charger["control_switch"] == "switch.garage_charger_load_balancing_load_balancing_active"
    assert charger["target_current_P1"] == "sensor.garage_charger_load_balancing_target_current_p1"
    assert charger["charger_current_P3"] == "sensor.garage_charger_load_balancing_charger_current_p3"
    assert charger["mode"] == "sensor.garage_charger_load_balancing_mode"


async def test_settings_defaults(hass, ws):
    result = await ws("settings/get")

    assert result["result"] == {
        "charger_update_interval_s": 30,
        "safety_margin_a": 1,
        "ramp_up_a_per_min": 2,
        "stale_after_s": 120,
    }


async def test_save_update_interval(hass, ws):
    result = await ws("settings/save", changes={"charger_update_interval_s": "45"})
    assert result["success"]
    assert result["result"]["charger_update_interval_s"] == 45
    assert result["result"]["safety_margin_a"] == 1

    await hass.async_block_till_done()
    coordinator = hass.data[DOMAIN]["coordinator"]
    assert coordinator._charger_update_interval().total_seconds() == 45


@pytest.mark.parametrize(
    "changes",
    [
        {"charger_update_interval_s": 29},
        {"charger_update_interval_s": 61},
        {"safety_margin_a": -1},
        {"safety_margin_a": 6},
        {"ramp_up_a_per_min": 0},
        {"ramp_up_a_per_min": 11},
        {"stale_after_s": 59},
        {"stale_after_s": 601},
        {"unknown": 1},
    ],
)
async def test_invalid_settings(hass, ws, changes):
    result = await ws("settings/save", changes=changes)

    assert result["error"]["code"] == "invalid_format"


async def test_settings_change_calculation(hass, ws, easee_device):
    """A larger safety margin lowers the targets after saving."""
    for phase in ("l1", "l2", "l3"):
        hass.states.async_set(f"sensor.meter_{phase}", "0", {"unit_of_measurement": "A"})
    household_id = await _create_household(ws)
    await ws(
        "chargers/save",
        charger_id=easee_device.id,
        config={"type": "easee", "household_id": household_id, "phase_map": PHASE_MAP},
    )
    await hass.async_block_till_done()
    target = "sensor.garage_charger_load_balancing_target_current_p1"
    assert float(hass.states.get(target).state) == 19  # 20 A fuse - 1 A margin

    await ws("settings/save", changes={"safety_margin_a": 4})
    await hass.async_block_till_done()

    assert float(hass.states.get(target).state) == 16
