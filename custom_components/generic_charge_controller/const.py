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

# Update interval in seconds
UPDATE_INTERVAL = 45

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
MODE_IDLE = "idle"
MODES = [MODE_IDLE]
