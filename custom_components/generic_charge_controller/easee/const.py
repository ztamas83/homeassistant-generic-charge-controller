"""Easee charger constants
Derived from https://github.com/fondberg/easee_hass/blob/master/custom_components/easee/services.py
"""

ACTION_COMMAND = "action_command"
ACTION_START = "start"
ACTION_STOP = "stop"
ACTION_PAUSE = "pause"
ACTION_RESUME = "resume"
ACTION_TOGGLE = "toggle"
ACTION_REBOOT = "reboot"
ACTION_UPDATE_FIRMWARE = "update_firmware"
ACTION_OVERRIDE_SCHEDULE = "override_schedule"
ACTION_DELETE_BASIC_CHARGE_PLAN = "delete_basic_charge_plan"
ACTIONS = {
    ACTION_START,
    ACTION_STOP,
    ACTION_PAUSE,
    ACTION_RESUME,
    ACTION_TOGGLE,
    ACTION_REBOOT,
    ACTION_UPDATE_FIRMWARE,
    ACTION_OVERRIDE_SCHEDULE,
    ACTION_DELETE_BASIC_CHARGE_PLAN,
}

SVC_SET_LIMIT = "set_circuit_dynamic_limit"

# "unique_id": "EHXHKM7G_circuit_current",

CHRG_DOMAIN = "easee"

S_NAME_CIRCUITCURRENT = "circuit_current"
S_NAME_ONLINE = "online"
S_NAME_STATUS = "status"
ATTR_PHASE_CURRENT_TMP = "state_circuitTotalPhaseConductorCurrentL%s"


EA_DISCONNECTED = "disconnected"
EA_AWAITING_START = "awaiting_start"
EA_CHARGING = "charging"
EA_COMPLETED = "completed"
EA_ERROR = "error"
EA_READY_TO_CHARGE = "ready_to_charge"

EASEE_STATUS = {
    1: EA_DISCONNECTED,
    2: EA_AWAITING_START,
    3: EA_CHARGING,
    4: EA_COMPLETED,
    5: EA_ERROR,
    6: EA_READY_TO_CHARGE,
}


DEVICE_STATES = {
    S_NAME_CIRCUITCURRENT: {
        "key": "state.circuitTotalPhaseConductorCurrentL1",
        "attrs": [
            "circuit.id",
            "circuit.circuitPanelId",
            "circuit.panelName",
            "circuit.ratedCurrent",
            "state.circuitTotalAllocatedPhaseConductorCurrentL1",
            "state.circuitTotalAllocatedPhaseConductorCurrentL2",
            "state.circuitTotalAllocatedPhaseConductorCurrentL3",
            "state.circuitTotalPhaseConductorCurrentL1",
            "state.circuitTotalPhaseConductorCurrentL2",
            "state.circuitTotalPhaseConductorCurrentL3",
        ],
    },
    S_NAME_ONLINE: {},
}
