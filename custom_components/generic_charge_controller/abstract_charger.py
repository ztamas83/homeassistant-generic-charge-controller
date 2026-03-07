"""Abstract class for a charger"""

import abc


class ChargerConfiguration:
    @property
    def charger_id(self) -> str:
        """Unique ID for the charger, e.g. "easee_living_room" or "detected_charger_1"."""
        pass

class AbstractCharger:
    @abc.abstractmethod
    def start(self) -> None:
        pass

    @abc.abstractmethod
    def stop(self) -> None:
        pass

    @abc.abstractmethod
    def update_limits(self, phases: dict[str, float]) -> None:
        pass

    @property
    @abc.abstractmethod
    def phase_currents(self) -> dict[str, float]:
        pass

    @property
    @abc.abstractmethod
    def rated_current(self) -> float:
        pass

    @property
    @abc.abstractmethod
    def charging(self) -> bool:
        pass
