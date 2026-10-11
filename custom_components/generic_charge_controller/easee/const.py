"""Easee charger constants.

Derived from the Easee integration (https://github.com/nordicopen/easee_hass),
verified against version 0.9.74.
"""

CHRG_DOMAIN = "easee"

# Service that sets the dynamic circuit limit per phase
SVC_SET_LIMIT = "set_circuit_dynamic_limit"

# Sensor keys; entity unique ids are "<serial>_<key>", e.g. "EH123456_circuit_current"
S_NAME_CIRCUITCURRENT = "circuit_current"
S_NAME_STATUS = "status"
S_NAME_POWER = "power"
S_NAME_MAX_CIRCUIT_LIMIT = "max_circuit_limit"

ATTR_PHASE_CURRENT_TMP = "state_circuitTotalPhaseConductorCurrentL%s"
ATTR_CIRCUIT_RATED_CURRENT = "circuit_ratedCurrent"  # attribute of the status sensor

# Status sensor values
EA_DISCONNECTED = "disconnected"
EA_CHARGING = "charging"
EA_OFFLINE = "offline"

# Status values (plus unavailable/unknown) in which no car is connected
NOT_CONNECTED_STATES = {EA_DISCONNECTED, EA_OFFLINE, "unavailable", "unknown"}
