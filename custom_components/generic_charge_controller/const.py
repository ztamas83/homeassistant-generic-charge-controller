"""Generic charge controller constants"""


DOMAIN = "generic_charge_controller"

# Store keys
STORE_KEY_CHARGERS = "chargers"
STORE_KEY_HOUSEHOLDS = "households"
STORE_KEY_SETTINGS = "settings"

# Settings (stored in the store's settings, edited in the panel): key -> (default, min, max)
SETTING_CHARGER_UPDATE_INTERVAL = "charger_update_interval_s"  # min time between sends
SETTING_SAFETY_MARGIN = "safety_margin_a"  # kept free below the fuse rating
SETTING_RAMP_UP = "ramp_up_a_per_min"  # how fast higher targets are reached
SETTING_STALE_AFTER = "stale_after_s"  # sensor without report this long counts as unknown
SETTINGS_RANGES = {
    SETTING_CHARGER_UPDATE_INTERVAL: (30, 30, 60),
    SETTING_SAFETY_MARGIN: (1, 0, 5),
    SETTING_RAMP_UP: (2, 1, 10),
    SETTING_STALE_AFTER: (120, 60, 600),
}
DEFAULT_SETTINGS = {key: default for key, (default, _, _) in SETTINGS_RANGES.items()}

# Calculation runs on every change of an input sensor, at most once per cooldown.
# The periodic update is a watchdog that also detects sensors that stopped reporting.
UPDATE_INTERVAL = 30
REFRESH_COOLDOWN_S = 3

# Phases: household phases (L1-L3) and charger phases (P1-P3)
PHASES = ("L1", "L2", "L3")
CHARGER_PHASES = ("P1", "P2", "P3")

# Household config keys
HH_ID = "household_id"
HH_NAME = "name"
HH_FUSE = "fuse_a"
HH_PHASE_ENTITIES = {"L1": "l1_entity", "L2": "l2_entity", "L3": "l3_entity"}
FUSE_MIN_A = 6
FUSE_MAX_A = 250

# Charger config keys
CH_ID = "charger_id"
CH_TYPE = "type"
CH_HOUSEHOLD = "household_id"
CH_PHASE_MAP = "phase_map"

CHARGER_TYPE_EASEE = "easee"
CHARGER_TYPES = [CHARGER_TYPE_EASEE]

# Charger modes
MODE_IDLE = "idle"  # not charging
MODE_CHARGING = "charging"  # charging, not limited by the household load
MODE_LIMITED = "limited"  # charging, limited to protect the main fuse
MODE_FAILSAFE = "failsafe"  # household load unknown, all phases at 0 A
MODES = [MODE_IDLE, MODE_CHARGING, MODE_LIMITED, MODE_FAILSAFE]

# Load balancing
MIN_CHARGING_CURRENT_A = 6  # IEC 61851 minimum; below this a phase is paused (0 A)

# Sending limits to chargers
CONTROL_RECONCILE_INTERVAL_S = 300  # resend unchanged limits to correct drift
# A household phase above this share of the fuse rating for this long is sent at
# once, regardless of the charger update interval
OVERLOAD_FACTOR = 1.5
OVERLOAD_DURATION_S = 10
CONTROL_STARTUP_GRACE_S = 120  # hold the last limit while meters come up after start
