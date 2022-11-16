"""Abstract class for a charger"""

import abc


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
    @abc.abstractclassmethod
    def phase_currents(self) -> dict[str, float]:
        pass

    @property
    @abc.abstractclassmethod
    def rated_current(self) -> float:
        pass

    @property
    @abc.abstractclassmethod
    def charging(self) -> bool:
        pass
