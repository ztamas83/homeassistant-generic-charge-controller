# Generic Charge Controller for Home Assistant

Protects the household main fuse while an EV charges. The integration reads the
current on each household phase from any meter sensors you choose, works out how
much current is left for the charger on each phase, and limits the charger to
that. Everything runs locally in Home Assistant.

Supported chargers: Easee (through the [Easee integration](https://github.com/nordicopen/easee_hass),
tested with version 0.9.74). Other chargers are planned through a generic adapter.

## How it works

For every household phase:

- **Other load** = household load − the charger's own current on that phase, rounded up to whole ampere.
- **Target** = main fuse rating − safety margin − other load, at most the charger circuit's rating.
- Below 6 A (the minimum charging current) a phase gets 0 A.
- Lower targets apply at once; higher targets rise gradually (ramp-up speed).

Safety rules:

- If a household phase sensor is unavailable, not a current in A/mA, or has not
  reported for the stale timeout, all phases get 0 A (**failsafe**).
- If the charger's own currents are unknown, they count as 0 A, so the whole
  household load counts as other load (targets are lower, never higher).

Targets are recalculated whenever a meter or charger value changes. They are
sent to the charger only while its **Load balancing active** switch is on and a
car is connected, at most once per **charger update interval**. A household
phase above 150 % of the fuse rating for more than 10 seconds is sent at once.

Limits are set without expiry. If Home Assistant stops, the charger keeps the
last limit. Turning the switch off sets the charger back to its circuit rating;
turn it off before removing the integration.

## Requirements

- Home Assistant 2026.10 or later.
- Sensors reporting the current per household phase in A or mA (for example
  from a Tibber Pulse or another meter reader).
- For Easee: the Easee integration, with the charger's **Circuit current**
  sensor enabled (it is disabled by default). Without it, targets are lower
  while charging.

## Installation

### HACS

1. In HACS, add `https://github.com/ztamas83/homeassistant-generic-charge-controller`
   as a custom repository (type: Integration).
2. Install **Generic Charge Controller** and restart Home Assistant.

### Manual

1. Download `generic_charge_controller.zip` from the latest
   [release](https://github.com/ztamas83/homeassistant-generic-charge-controller/releases)
   and extract it into `custom_components/generic_charge_controller` in your
   Home Assistant configuration.
2. Restart Home Assistant.

## Setup

1. Settings → Devices & services → Add integration → **Generic Charge Controller**.
2. Open **Charge Controller** in the sidebar.
3. **Households**: add a household with its main fuse rating and the current
   sensors for L1, L2 and L3.
4. **Chargers**: open your charger, pick the household, and map each household
   phase to the charger phase it is wired to. Save.
5. Check the **Load balancing status** card: household load, charger current and
   target per phase. Targets are calculated but not sent yet.
6. Press **Start** (or turn on the **Load balancing active** switch) to send
   limits to the charger.
7. **Settings**: charger update interval (30-60 s), safety margin (0-5 A),
   ramp-up speed (1-10 A/min), stale timeout (60-600 s).

Entities per charger: target current and charger current per phase, a mode
sensor (`idle`, `charging`, `limited`, `failsafe`, with the reasons and the
last sent limits as attributes), and the **Load balancing active** switch.
Entities per household: load per phase.

## Smart charging (beta)

Plans when an EV charges to use the cheapest hours. Each EV is a virtual device
linked to a configured charger.

- Prices come from the core Nord Pool integration, per household (config entry
  and price area).
- The plan uses at most the configured number of charging blocks (hour
  blocks), picking the cheapest ones. An optional ready-by time sets the
  deadline. If it is beyond the known prices, the EV waits for the next price
  publication.
- Outside the planned blocks the charging session is paused with Easee's native
  pause command, and resumed with its resume command (requires the Easee
  integration's `easee.action_command` service). Load balancing limits are not
  changed by this. Only sessions paused by this integration are resumed.

Setup:

1. **Households**: pick the Nord Pool config entry and the price area.
2. **EVs** tab: add an EV, link it to a configured charger, set battery size,
   target SOC, max blocks, optional ready-by, and a power sensor (for example
   the charger power sensor).
3. Set the SOC manually or link a SOC entity. Optionally link a target SOC sensor
   (for example the car's charge limit); the target is then read-only and follows the sensor.

Entities per EV: numbers `current_soc` and `target_soc`; switches
`smart_charging` and `control_charger`; button `start_charging` ("Charge now"); sensors
`status`, `energy_needed`, `estimated_power`, `charge_duration`, `next_charge_start`,
`planned_cost`; binary sensor `charge_now`. Pressing **Charge now** turns Smart charging off
and releases the charger at once (load balancing still applies). Turn Smart charging back on
to replan from now; the charger is then paused at once if now is outside the plan. With **control_charger** off the plan is only calculated (dry
run). With it on, the charger is paused outside planned blocks. Pausing works
only while the charger's **Load balancing active** switch is on; switching it
off resumes a session paused by smart charging.

Learning: the charging power is estimated from the EV's own power samples
while it charges unthrottled, seeded from recorder history. Until 6 samples
exist, the fallback power setting is used.

Known limitations:

- Manual SOC defaults to 0 % until it is set.
- After a plan completes (or the target is reached during a plan) the charger
  stays paused until the car is unplugged. Unplugging clears the plan and
  releases the charger; plugging in plans again. If the car is already at
  target when plugged in, the charger is not paused.
- Without a SOC sensor the SOC is estimated from the energy delivered (power
  sensor), capped at the target. Charging losses are not modelled, so it may
  overestimate. After driving, set the SOC manually or use a SOC sensor.
- No charging efficiency or taper is modelled.
- Cost is shown without currency and grid fees.

## Development

Requirements: Python 3.14, Node.js.

```bash
uv venv .venv --python 3.14
VIRTUAL_ENV=.venv uv pip install -r requirements.txt
make test
```

Deploying to a Home Assistant instance over SSH: copy `.env.example` to `.env`
and fill in the SSH details (see the comments in the file), then:

| Command | Does |
|---|---|
| `make build` | Build the panel (`frontend/` → `custom_components/.../frontend/controller-panel.js`) |
| `make test` | Run the tests |
| `make deploy` | Build and copy the integration to Home Assistant (replaces the folder) |
| `make restart-ha` | Check the configuration and restart Home Assistant Core |
| `make release VERSION=x.y.z` | Set the manifest version, commit, tag `vx.y.z` and push |
| `make clean` | Remove local `__pycache__` folders |

### Releases

Development happens on `master`; releases are tags on it.

```bash
make release VERSION=0.3.0
```

This sets `version` in `manifest.json`, commits, tags `v0.3.0` and pushes both.
The tag triggers the release workflow: it runs the tests, hassfest and HACS
validation, checks the tag matches the manifest version, builds the panel and
publishes a GitHub release with `generic_charge_controller.zip`. HACS offers
that release as an update. A version with a suffix (`0.3.0-beta.1`) becomes a
GitHub pre-release, which HACS shows only to users who enabled beta versions.

The work plan and design decisions are in [PLAN.md](PLAN.md).

## License

[MIT](LICENSE)

Parts of the panel frontend are based on
[RoomMind](https://github.com/snazzybean/roommind) (MIT), see
[THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES).
