"""Generic charge controller constants"""


DATA_HASS_CONFIG = "generic_charger_hass_config"
DOMAIN = "generic_charge_controller"


PHASE1 = "P1"
PHASE2 = "P2"
PHASE3 = "P3"

CONF_ENTITYID_CURR_P1 = "current_sensor_phase1"
CONF_ENTITYID_CURR_P2 = "current_sensor_phase2"
CONF_ENTITYID_CURR_P3 = "current_sensor_phase3"
CONF_ENTITYID_PRICE_CENTS = "spot_price_cents"
CONF_ENTITYID_POWER_NOW = "charger_power_sensor"
CONF_ACC_MAX_PRICE_CENTS = "accepted_max_price_cents"
CONF_RATED_CURRENT = "mains_fuse_current"
CONF_CHRG_ID = "charger_device_id"
CONF_CHRG_DOMAIN = "charger_domain"

CHRG_DOMAIN_EASEE = "easee"
CHRG_DOMAINS = CHRG_DOMAIN_EASEE

DETECTED_CHRG_DOMAIN = "detected_charger_domain"

ATTR_LIMIT_Px = "Current limit %s"
