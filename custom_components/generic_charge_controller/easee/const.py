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