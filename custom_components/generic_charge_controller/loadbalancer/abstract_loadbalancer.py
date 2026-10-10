from abc import ABC, abstractmethod


class AbstractLoadBalancer(ABC):
    """Abstract load balancer class"""

    @abstractmethod
    def calculate_target_current(
        self, 
        charger_id: str, 
        phase_mapping: dict[str, str],
        current_load_ampere: dict[str, float], 
        charger_load_ampere: dict[str, float],
        rated_current_ampere: float
    ) -> dict[str, float]:
        """Calculate target current for a given charger.
        :param charger_id: ID of the charger
        :param phase_mapping: Mapping of house phases to charger phases (e.g. {"house_l1": "cl1", "house_l2": "cl2", "house_l3": "cl3"})
        :param current_load_ampere: Current load on each house phase (e.g. {"L1": 5.0, "L2": 3.0, "L3": 0.0})
        :param charger_load_ampere: Current load on each charger phase (e.g. {"cl1": 2.0, "cl2": 0.0, "cl3": 0.0})
        :param rated_current_ampere: Rated current of the charger (main fuse limit, e.g. 16.0)
        :return: Target current for each charger phase (e.g. {"cl1": 10.0, "cl2": 10.0, "cl3": 10.0})
        """
        pass
