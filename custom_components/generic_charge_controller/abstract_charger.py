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
    def update_limits(self, phase_limits: dict[str, int]) -> None:
        pass