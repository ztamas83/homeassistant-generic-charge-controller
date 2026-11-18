"""Generic charge controller constants"""


DOMAIN = "generic_charge_controller"

# Store keys
STORE_KEY_CHARGERS = "chargers"
STORE_KEY_HOUSEHOLDS = "households"
STORE_KEY_SETTINGS = "settings"
STORE_KEY_EVS = "evs"

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
HH_PRICE_CONFIG_ENTRY = "price_config_entry"
HH_PRICE_AREA = "price_area"
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
MODE_SCHEDULED_PAUSE = "scheduled_pause"  # smart charging plan says wait, all phases at 0 A
MODES = [MODE_IDLE, MODE_CHARGING, MODE_LIMITED, MODE_FAILSAFE, MODE_SCHEDULED_PAUSE]

# Load balancing
MIN_CHARGING_CURRENT_A = 6  # IEC 61851 minimum; below this a phase is paused (0 A)

# Sending limits to chargers
CONTROL_RECONCILE_INTERVAL_S = 300  # resend unchanged limits to correct drift
# A household phase above this share of the fuse rating for this long is sent at
# once, regardless of the charger update interval
OVERLOAD_FACTOR = 1.5
OVERLOAD_DURATION_S = 10
CONTROL_STARTUP_GRACE_S = 120  # hold the last limit while meters come up after start


# Price areas supported by the price source
PRICE_AREAS = [
    "EE", "LT", "LV", "AT", "BE", "FR", "GER", "NL", "PL", "DK1", "DK2", "FI",
    "NO1", "NO2", "NO3", "NO4", "NO5", "SE1", "SE2", "SE3", "SE4", "BG", "TEL", "SYS",
]

# EV config keys
EV_ID = "ev_id"
EV_NAME = "name"
EV_CHARGER_ID = "charger_id"
EV_BATTERY_KWH = "battery_kwh"
EV_SOC_ENTITY = "soc_entity"
EV_POWER_ENTITY = "power_entity"
EV_FALLBACK_POWER_KW = "fallback_power_kw"
EV_MAX_BLOCKS = "max_blocks"
EV_READY_BY = "ready_by"
EV_MODEL = "model"

EV_DEFAULT_FALLBACK_POWER_KW = 11.0
EV_DEFAULT_MAX_BLOCKS = 2
EV_MAX_BLOCKS_RANGE = (1, 6)
EV_DEFAULT_TARGET_SOC = 80
EV_DEFAULT_MODEL = "average"
EV_MODELS = [EV_DEFAULT_MODEL]
EV_BATTERY_KWH_RANGE = (1, 300)
EV_FALLBACK_POWER_KW_RANGE = (0.5, 50)

# Keys of the per-EV entities
EV_ENTITY_KEYS = (
    "current_soc",
    "target_soc",
    "smart_charging",
    "control_charger",
    "status",
    "energy_needed",
    "estimated_power",
    "charge_duration",
    "next_charge_start",
    "planned_cost",
    "charge_now",
)

# Platform of each per-EV entity (looked up by unique id)
EV_ENTITY_DOMAINS = {
    "current_soc": "number",
    "target_soc": "number",
    "smart_charging": "switch",
    "control_charger": "switch",
    "status": "sensor",
    "energy_needed": "sensor",
    "estimated_power": "sensor",
    "charge_duration": "sensor",
    "next_charge_start": "sensor",
    "planned_cost": "sensor",
    "charge_now": "binary_sensor",
}

# Smart charging status of an EV
STATUS_DISABLED = "disabled"
STATUS_NO_CHARGING_NEEDED = "no_charging_needed"
STATUS_NO_PRICE_SOURCE = "no_price_source"
STATUS_WAITING_FOR_PRICES = "waiting_for_prices"
STATUS_PLANNED = "planned"
STATUS_CHARGING = "charging"
STATUS_INSUFFICIENT_TIME = "insufficient_time"
STATUS_COMPLETED = "completed"
STATUSES = [
    STATUS_DISABLED,
    STATUS_NO_CHARGING_NEEDED,
    STATUS_NO_PRICE_SOURCE,
    STATUS_WAITING_FOR_PRICES,
    STATUS_PLANNED,
    STATUS_CHARGING,
    STATUS_INSUFFICIENT_TIME,
    STATUS_COMPLETED,
]
