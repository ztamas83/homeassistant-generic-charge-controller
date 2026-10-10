"""Abstract class for a charger"""

from __future__ import annotations

import abc


class AbstractCharger(abc.ABC):
    """Read access to a charger. Phases are the charger's own phases P1-P3."""

    @abc.abstractmethod
    def phase_currents(self) -> dict[str, float | None]:
        """Current drawn per charger phase in ampere, None if unknown."""

    @abc.abstractmethod
    def is_charging(self) -> bool:
        """True while the charger delivers current to the car."""

    @abc.abstractmethod
    def max_current(self) -> float | None:
        """Highest current per phase the charger may be set to, None if unknown."""
