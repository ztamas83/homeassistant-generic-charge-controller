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
- Update the status checkboxes, "Decisions" and "Log" in this file as work progresses.

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
Status: [x] implemented 2026-10-10, awaiting verification in HA

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
Status: [x] implemented 2026-10-10, awaiting verification in HA

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
Status: [x] implemented 2026-10-11, awaiting verification in HA

Changes:
- Switch entity "Load balancing active", default off, restored on restart. Off = no commands; charger falls back to its own limit when TTL expires.
- `EaseeCharger.update_limits`: fix 0 A bug; send only on change >= 1 A or keep-alive before TTL expiry; only while car connected/charging.
- Before coding: verify Easee service signature (`device_id` vs charger id, value range, TTL units) against the installed easee_hass version. Not yet confirmed.

Verify:
- Unit tests with mocked service call: sent/not sent, 0 A, keep-alive, switch off.
- HA: switch on while charging -> Easee dynamic circuit limit follows targets; switch off -> no further calls (logbook/debug log).

### Step 4: Faster reaction
Status: [x] implemented 2026-10-11, awaiting verification in HA

Changes:
- Recalculate on phase sensor state change, debounced (~2-5 s); keep periodic refresh as watchdog (also detects stale sensors).
- Command rate limiting from step 3 unchanged.

Verify:
- Unit test: state change triggers recalculation; bursts debounced.
- HA: target reacts within seconds of a load change.

### Step 5: Panel shows live status and settings
Status: [x] implemented 2026-10-11, awaiting verification in HA

Changes:
- Charger detail view: live household load, charger load, targets, mode, switch state; phase mapping editor.
- Settings tab: safety margin, smoothing speed, stale timeout (stored in `settings`).
- Statistics card: remove or wire up (decision 3: use HA recorder).

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

## Decisions

1. Fail-safe target when meter data is missing: 0 A (pause). Decided 2026-10-10.
2. Old store data is discarded in step 1 (store v2). Decided 2026-10-10.
3. `HistoryStore` is deleted (step 6); statistics will use the HA recorder. Decided 2026-10-10.

## Notes for later steps

- Easee `circuit_current` (phase currents) is disabled by default in the Easee integration; without it the balancer assumes 0 A charger current (safe, but targets drop while charging). The charger detail view shows a hint.
- Limits are sent with `time_to_live: 0` (no expiry): the Easee integration skips the API call when the charger already has the requested limits, so a TTL could not be refreshed. Consequence: if HA stops, the charger keeps the last limit. Turning the switch off, or deleting the charger config while active, sets the limit back to the circuit rated current. Removing the whole integration while active does not (unload cannot tell removal from reload); release first.
- After a car connects, the status change triggers a calculation; limits are sent at once if nothing was sent in the last charger update interval, otherwise when it has passed.
- Since step 4 the household load sensors update with every triggered refresh (up to every 3 s), so the recorder stores them about as often as the meter sensors. Exclude them in `recorder:` if database size matters.
- Step 6: `make deploy` extracts over the remote folder and never deletes removed files (e.g. old `loadbalancer/calculator.py` stays on HA). Switch to a clean copy.
- Step 6: `manifest.json` should list `http`, `frontend`, `websocket_api` as dependencies; unused imports in `__init__.py` (`json`, `DATA_HASS_CONFIG`, `VERSION`); old `CONF_*` constants and commented config flow in `config_flow.py`.
- Easee discovery matches entities by unique id `<serial>_<key>`, confirmed in Easee v0.9.74 (`entity.py`: `f"{product.id}_{entity_name}"`).
- Settings (`SETTINGS_RANGES` in `const.py`): charger update interval 30-60 s (30), safety margin 0-5 A (1), ramp-up 1-10 A/min (2), stale after 60-600 s (120). Minimum charging current 6 A stays fixed.

## Log

- 2026-10-10: Gap analysis done. Test env rebuilt (`.venv`, `pytest-homeassistant-custom-component`, `pytest.ini`); all 9 tests pass. Coordinator test now injects `AdvancedCalculator`; runtime default is still `LoggingCalculator` (fixed in step 2).
- 2026-10-10: Step 1 implemented. Store v2 (v1 discarded), validated WS API incl. `chargers/discover`, reload on config change, stale entity/device cleanup, household load sensors (A/mA only, unavailable when source untrusted), charger target/mode sensors (idle, unknown targets), household editor and charger settings with `ha-form`. 43 tests pass, `make build` OK.
- 2026-10-10: Panel JS URL carries a content hash (no stale browser cache after deploy). Households tab first; chargers grouped per household. 44 tests pass.
- 2026-10-10: Step 2 implemented. `SafeLoadBalancer` (fail-safe 0 A on unknown/stale household load, unknown charger current assumed 0 A, load rounded up, immediate decrease, 2 A/min ramp-up, whole-ampere targets capped at circuit rated current, below 6 A -> 0). Read-only Easee adapter by unique id, charger factory, shared `readings.read_current_a` with staleness via `last_reported`. Sensors: target and charger current per charger phase, mode (idle/charging/limited/failsafe) with `reasons` attribute. Old calculators and numpy removed. 73 tests pass.
- 2026-10-10: Panel: charger cards show target currents P1-P3 and load balancing mode; charger detail shows history of targets and mode (own SVG step chart from `history/history_during_period`, 6 h to 7 d, tooltip, table view; HA history-graph card is not usable because `window.loadCardHelpers` is undefined in a custom panel). New WS `entities` returns sensor entity ids per household/charger. 74 tests pass.
- 2026-10-11: Step 3 implemented. Switch "Load balancing active" per charger (off by default, restored on restart). Limits sent via `easee.set_circuit_dynamic_limit` (`current_p1..3`, TTL 0) only while active and a car is connected; decreases at once, increases at most every 60 s, unchanged limits resent every 5 min, fail-safe held for 120 s after start while meters come up. Switch off and charger delete release to circuit rated current. Mode sensor attributes: `control_active`, `last_sent`, `last_sent_at`. Stale entity cleanup moved to entry setup and covers all platforms. 94 tests pass.
- 2026-10-11: Step 4 implemented. State changes of household phase sensors and the charger's status and circuit current entities trigger a refresh through the coordinator debouncer (first change at once, then at most one refresh per 3 s); the 45 s periodic update remains as watchdog and stale detection. 98 tests pass.
- 2026-10-11: Step 4 revised on request: fuses tolerate overload for 1-2 minutes, so sending to the charger is limited to once per "charger update interval" (setting, 30-60 s, default 30, Settings tab in the panel). Calculation stays event-driven. Exception: a household phase above 150 % of the fuse for more than 10 s sends lower limits at once. A scheduled recheck sends held-back limits when the interval has passed and confirms a pending overload after 10 s, even without sensor changes. Watchdog update every 30 s. The old rules (decreases at once, increases every 60 s) are replaced. Mode sensor attribute `overload`. 110 tests pass.
- 2026-10-11: Step 5 implemented. Settings for safety margin, ramp-up speed and stale timeout (validated, defaults, reload on save, Settings tab with helper texts). Charger detail: live status card (switch state with Start/Stop, mode and reasons, per phase household load, charger current and target, fuse, margin, update interval, last sent limits) and a hint when the Easee `circuit_current` entity is disabled (discovery reports disabled entities). Charger cards show whether limits are sent. WS `entities` includes the switch. 118 tests pass.
- 2026-10-11: Charger configuration card is collapsible (header toggles, summary when collapsed); collapsed when configured, expanded when not, collapses after saving.
