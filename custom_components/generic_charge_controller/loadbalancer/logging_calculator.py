"""MVP calculator that logs requests and returns None."""

from __future__ import annotations
import logging
from .abstract_loadbalancer import AbstractLoadBalancer

_LOGGER = logging.getLogger(__name__)

class LoggingCalculator(AbstractLoadBalancer):
    """Calculator that logs and returns no actions."""

    def __init__(self, logger: logging.Logger | None = None) -> None:
        self._logger = logger or _LOGGER

    def calculate_target_current(
        self, 
        charger_id: str, 
        phase_mapping: dict[str, str],
        current_load_ampere: dict[str, float], 
        charger_load_ampere: dict[str, float],
        rated_current_ampere: float
    ) -> dict[str, float] | None:
        """Log the request and return None to indicate no action."""
        
        self._logger.info(
            "LoggingCalculator received request for charger %s: "
            "phase_mapping=%s, current_load=%s, charger_load=%s, rated=%s",
            charger_id,
            phase_mapping,
            current_load_ampere,
            charger_load_ampere,
            rated_current_ampere
        )
        
        return None
