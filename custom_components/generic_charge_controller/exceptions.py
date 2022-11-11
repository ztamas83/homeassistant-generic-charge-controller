"""Generic charger exceptions"""


class NoSensorsError(Exception):
    """Raised when no sensors defined"""


class SensorUnavailableError(Exception):
    """Raised when a sensor is unavailable"""
