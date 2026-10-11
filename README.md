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

1. Copy `custom_components/generic_charge_controller` into the
   `custom_components` folder of your Home Assistant configuration.
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
| `make clean` | Remove local `__pycache__` folders |

The work plan and design decisions are in [PLAN.md](PLAN.md).
