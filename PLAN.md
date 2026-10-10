# Generic Charge Controller: Work Plan

Branch: `ha_2025`. Last updated: 2026-10-10.

## Goal

Local charge controller in Home Assistant that limits EV charger current per phase so the main fuse is never overloaded.

Inputs:
- Main fuse rating per household (one value for all phases, e.g. 16, 20, 25 A)
- Charger type (Easee now, any HA-controllable charger later)
- Household phase load from arbitrary HA sensors (user picks L1, L2, L3 entities)
- Solar: out of scope for now

Scope: 1 household, 1 charger (data model allows more).

## Working rules

- Every step ends with `make test` green and a deployable integration (`make deploy`) that can be verified in HA.
- The charger is never actuated before step 3, and from step 3 only when the "Load balancing active" switch is on.
- Update the status checkboxes and "Open decisions" in this file as work progresses.

## Dev environment

- Python 3.14 venv in `.venv` (created with `uv venv .venv --python 3.14`, then `VIRTUAL_ENV=.venv uv pip install -r requirements.txt`).
- Tests: `make test` (pytest, `pytest-homeassistant-custom-component`, `asyncio_mode = auto` in `pytest.ini`).
- Fixtures: `hass` is the real HA fixture from the plugin; `mock_hass` in `tests/conftest.py` is the MagicMock variant.
- Frontend: `make build` (Vite, output to `custom_components/generic_charge_controller/frontend/controller-panel.js`).

## Gap analysis (baseline, 2026-10-10)

| Requirement | State | Gap |
|---|---|---|
| Main fuse rating | Read as `rated_current` from charger config, default 16 | Belongs on household; no UI/WS field; config flow has no inputs |
| Charger type | `AbstractCharger` + `EaseeCharger` exist | `EaseeCharger` never instantiated, `update_limits` never called, no factory; frontend guesses entity IDs from device name |
| Household phase load | Coordinator reads `household["L1".."L3"]` | Frontend only detects Tibber Pulse and saves `l1_sensor..l3_sensor`; keys mismatch so load is always 0; no unit handling |
| Limit calculation | 3 calculators exist | Coordinator uses `LoggingCalculator`, which returns `None` |
| Phase mapping | UI saves `house_l1: "cl1"` etc. | Coordinator ignores it and regex-parses sensor strings instead |

Known bugs:
- Sensors read `target_current_l1`, coordinator writes `target_current_P1` (sensors always unknown).
- `sensor.py` calls `coordinator._charger_sensors`, which does not exist (crash once a charger is saved).
- Unavailable sensors are read as 0 A (unsafe: raises charger limit).
- `int()` truncates load (underestimates).
- EWMA smooths load increases (slow reaction to spikes).
- No minimum current (Easee ~6 A) or maximum clamp.
- `EaseeCharger.update_limits` skips 0 A (`if p_curr := ...`), so pause can never be sent.
- Panel removal uses name `"roommind"`; config entry titled `"RoomMind"`; WS commands registered twice.
- New chargers get no entities until reload.

Leftovers / unused: `HistoryStore`, `measurement_data`, settings WS (unused by frontend), `_phase_load_history`, `loadbalancer/core.py`, `models/charger.py`, commented block in `sensor.py`, `DATA_SCHEMA`, `numpy`, RoomMind types in `frontend/src/types/index.ts`, `strings.json` at repo root.

## Plan

### Step 1: Unified data model, working config path, no crashes
Status: [ ] not started

Changes:
- Store schema v2 (discard old data):
  - household: `{name, fuse_a, l1_entity, l2_entity, l3_entity}`
  - charger: `{type: "easee", device_id, household_id, phase_map: {L1: "P?", L2: "P?", L3: "P?"}}`
- WS commands validate payloads with voluptuous schemas; reload config entry after save so entities appear.
- Frontend: household form (name, fuse, 3 entity pickers) replaces Tibber-only detection; Easee detection via entity registry instead of device-name-derived entity IDs.
- Fix: sensor key mismatch, `_charger_sensors` crash, panel name, config flow title, double WS registration.
- New diagnostic sensors per household: "Household load L1/L2/L3" (unit A, device class current, device info); unavailable when source is unavailable.

Verify:
- Unit tests: store, WS schemas, sensor values incl. unavailable.
- HA: configure household in panel, restart, config persists; load sensors match meter sensors.

### Step 2: Safe calculation in shadow mode (no actuation)
Status: [ ] not started

Changes:
- Charger factory + read-only Easee adapter (phase currents, status, circuit max via entity registry); `phase_map` maps charger phases to household phases.
- One `SafeLoadBalancer` replaces the three calculators:
  - non-charger load = household load - charger load, per household phase
  - unavailable or stale input (no update for N s) -> fail-safe target
  - load rounded up
  - asymmetric smoothing: decreases immediate, increases slow
  - clamp to charger/circuit max; below charger minimum -> 0 (pause)
- Coordinator uses it; target sensors per charger phase; new "Charger load L1-L3" and "Mode" (`idle`, `charging`, `limited`, `failsafe`) sensors.
- Remove `Calculator`, `LoggingCalculator`, `core.py`, `numpy`.

Verify:
- Table-driven unit tests: normal, spike, recovery, unavailable, stale, below-minimum, clamp.
- HA: oven/kettle on -> target on that phase drops within one update; a phase sensor unavailable -> mode `failsafe`.

### Step 3: Actuation behind an enable switch
Status: [ ] not started

Changes:
- Switch entity "Load balancing active", default off, restored on restart. Off = no commands; charger falls back to its own limit when TTL expires.
- `EaseeCharger.update_limits`: fix 0 A bug; send only on change >= 1 A or keep-alive before TTL expiry; only while car connected/charging.
- Before coding: verify Easee service signature (`device_id` vs charger id, value range, TTL units) against the installed easee_hass version. Not yet confirmed.

Verify:
- Unit tests with mocked service call: sent/not sent, 0 A, keep-alive, switch off.
- HA: switch on while charging -> Easee dynamic circuit limit follows targets; switch off -> no further calls (logbook/debug log).

### Step 4: Faster reaction
Status: [ ] not started

Changes:
- Recalculate on phase sensor state change, debounced (~2-5 s); keep periodic refresh as watchdog (also detects stale sensors).
- Command rate limiting from step 3 unchanged.

Verify:
- Unit test: state change triggers recalculation; bursts debounced.
- HA: target reacts within seconds of a load change.

### Step 5: Panel shows live status and settings
Status: [ ] not started

Changes:
- Charger detail view: live household load, charger load, targets, mode, switch state; phase mapping editor.
- Settings tab: safety margin, smoothing speed, stale timeout (stored in `settings`).
- Statistics card: remove or wire up (see decision 3).

Verify:
- `make build` passes.
- HA: changing a setting changes computed targets without restart.

### Step 6: Cleanup
Status: [ ] not started

Changes:
- Remove RoomMind leftovers, commented code in `sensor.py`, `models/charger.py`, unused constants.
- Move `strings.json` into the component, add translations.
- Tidy `manifest.json`; README setup instructions.

Verify:
- Full test suite; fresh install in HA following the README.

### Step 7: Generic charger adapter (stretch)
Status: [ ] not started

Changes:
- `type: "generic"` charger: user picks `number` entity (per phase or shared) for the limit and sensors for charger phase currents.

Verify:
- Unit tests; HA test with a template `number` entity as a fake charger.

### Later
- Multiple chargers per household with fair sharing
- Solar charging
- Statistics

## Open decisions

1. Fail-safe target when meter data is missing: pause (0 A) or hold charger minimum (~6 A)? Recommendation: 0 A, the only value that cannot overload the fuse.
2. Discard old store data in step 1? Recommendation: yes.
3. `HistoryStore` (CSV history): keep for statistics or delete and rely on HA recorder? Recommendation: delete.

## Log

- 2026-10-10: Gap analysis done. Test env rebuilt (`.venv`, `pytest-homeassistant-custom-component`, `pytest.ini`); all 9 tests pass. Coordinator test now injects `AdvancedCalculator`; runtime default is still `LoggingCalculator` (fixed in step 2).
