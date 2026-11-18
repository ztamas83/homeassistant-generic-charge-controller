"""Abstract class for a charger"""

from __future__ import annotations

import abc


class AbstractCharger(abc.ABC):
    """Access to a charger. Phases are the charger's own phases P1-P3."""

    @abc.abstractmethod
    def tracked_entity_ids(self) -> list[str]:
        """Entities whose changes should trigger a new calculation."""

    @abc.abstractmethod
    def phase_currents(self) -> dict[str, float | None]:
        """Current drawn per charger phase in ampere, None if unknown."""

    @abc.abstractmethod
    def is_charging(self) -> bool:
        """True while the charger delivers current to the car."""

    @abc.abstractmethod
    def is_connected(self) -> bool:
        """True while a car is connected, whether charging or not."""

    @abc.abstractmethod
    def max_current(self) -> float | None:
        """Highest current per phase the charger may be set to, None if unknown."""

    @abc.abstractmethod
    async def async_set_limits(self, limits: dict[str, int]) -> None:
        """Limit the current per charger phase (whole ampere, 0 pauses).

        Raises HomeAssistantError when the limits could not be sent.
        """

    @abc.abstractmethod
    async def async_pause(self) -> None:
        """Pause the charging session with the charger's native pause command.

        Raises HomeAssistantError when the command could not be sent.
        """

    @abc.abstractmethod
    async def async_resume(self) -> None:
        """Resume a session paused by async_pause, with the native resume command.

        Raises HomeAssistantError when the command could not be sent.
        """

    @abc.abstractmethod
    async def async_release(self) -> None:
        """Remove the limits set by async_set_limits."""
