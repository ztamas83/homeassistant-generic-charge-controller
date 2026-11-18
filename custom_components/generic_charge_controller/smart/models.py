"""Data models for smart charging."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any


@dataclass(frozen=True)
class PriceSlot:
    """One price interval. Price is per kWh."""

    start: datetime
    end: datetime
    price: float


@dataclass(frozen=True)
class ChargeEstimate:
    """Estimated charge duration and power for an energy amount."""

    duration: timedelta
    power_kw: float
    source: str
    confidence: float
    n_samples: int


@dataclass(frozen=True)
class ChargeBlock:
    """A contiguous planned charging run."""

    start: datetime
    end: datetime
    cost: float


@dataclass
class ChargePlan:
    """A charging plan: selected blocks plus the price slots it was made from."""

    blocks: list[ChargeBlock]
    slots: list[PriceSlot]
    cost: float
    created_at: datetime
    inputs_key: str = ""
    insufficient_time: bool = False

    def to_dict(self) -> dict[str, Any]:
        """Serialize for persistence."""
        return {
            "blocks": [
                {"start": b.start.isoformat(), "end": b.end.isoformat(), "cost": b.cost}
                for b in self.blocks
            ],
            "slots": [
                {"start": s.start.isoformat(), "end": s.end.isoformat(), "price": s.price}
                for s in self.slots
            ],
            "cost": self.cost,
            "created_at": self.created_at.isoformat(),
            "inputs_key": self.inputs_key,
            "insufficient_time": self.insufficient_time,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ChargePlan:
        """Deserialize from persisted data."""
        return cls(
            blocks=[
                ChargeBlock(
                    datetime.fromisoformat(b["start"]),
                    datetime.fromisoformat(b["end"]),
                    float(b["cost"]),
                )
                for b in data.get("blocks", [])
            ],
            slots=[
                PriceSlot(
                    datetime.fromisoformat(s["start"]),
                    datetime.fromisoformat(s["end"]),
                    float(s["price"]),
                )
                for s in data.get("slots", [])
            ],
            cost=float(data.get("cost", 0.0)),
            created_at=datetime.fromisoformat(data["created_at"]),
            inputs_key=data.get("inputs_key", ""),
            insufficient_time=bool(data.get("insufficient_time", False)),
        )
