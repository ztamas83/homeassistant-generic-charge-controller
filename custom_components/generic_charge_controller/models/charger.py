from dataclasses import dataclass

@dataclass
class ChargerData:
    id: str
    name: str
    serial_number: str
    status: str
    power: float
    current_limit: float
    current_usage: float
    configured: bool
    l1_ref: str
    l2_ref: str
    l3_ref: str
    l1_usage: float
    l2_usage: float
    l3_usage: float

class Charger():
    def __init__(self, name: str, model: str, manufacturer: str, serial_number: str):
        self.name = name
        self.model = model
        self.manufacturer = manufacturer
        self.serial_number = serial_number



  