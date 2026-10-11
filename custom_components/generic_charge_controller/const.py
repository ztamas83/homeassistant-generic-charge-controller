"""Generic charge controller constants"""


DATA_HASS_CONFIG = "generic_charger_hass_config"
DOMAIN = "generic_charge_controller"
VERSION = "0.0.1"

PHASE_TMP = "l%s"
PHASE1 = "l1"
PHASE2 = "l2"
PHASE3 = "l3"

CONF_ENTITYID_CURR_L1 = "current_sensor_phase1"
CONF_ENTITYID_CURR_L2 = "current_sensor_phase2"
CONF_ENTITYID_CURR_L3 = "current_sensor_phase3"
CONF_ENTITYID_PRICE_CENTS = "spot_price_cents"
CONF_ENTITYID_POWER_NOW = "charger_power_sensor"
CONF_ACC_MAX_PRICE_CENTS = "accepted_max_price_cents"
CONF_RATED_CURRENT = "mains_fuse_current"
CONF_CHRG_ID = "charger_device_id"
CONF_CHRG_DOMAIN = "charger_domain"

CHRG_DOMAIN_EASEE = "easee"
CHRG_DOMAINS = [CHRG_DOMAIN_EASEE]

DETECTED_CHRG_DOMAIN = "detected_charger_domain"
ATTR_LIMIT_Px = "Current limit %s"

# Store keys
STORE_KEY_CHARGERS = "chargers"
STORE_KEY_HOUSEHOLDS = "households"
STORE_KEY_SETTINGS = "settings"

# Settings (stored in the store's settings, edited in the panel)
SETTING_CHARGER_UPDATE_INTERVAL = "charger_update_interval_s"  # min time between sends
CHARGER_UPDATE_INTERVAL_MIN_S = 30
CHARGER_UPDATE_INTERVAL_MAX_S = 60
DEFAULT_SETTINGS = {SETTING_CHARGER_UPDATE_INTERVAL: 30}

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

# Load balancing defaults
MIN_CHARGING_CURRENT_A = 6  # IEC 61851 minimum; below this a phase is paused (0 A)
DEFAULT_SAFETY_MARGIN_A = 1
DEFAULT_RAMP_UP_A_PER_MIN = 2
DEFAULT_STALE_AFTER_S = 120

# Sending limits to chargers
CONTROL_RECONCILE_INTERVAL_S = 300  # resend unchanged limits to correct drift
# A household phase above this share of the fuse rating for this long is sent at
# once, regardless of the charger update interval
OVERLOAD_FACTOR = 1.5
OVERLOAD_DURATION_S = 10
CONTROL_STARTUP_GRACE_S = 120  # hold the last limit while meters come up after start
