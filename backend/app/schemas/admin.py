from datetime import datetime

from pydantic import BaseModel


class AdminStatsResponse(BaseModel):
    users_total: int
    miniapp_opened: int
    games_started: int
    games_completed: int
    active_discounts: int
    used_discounts: int
    expired_discounts: int
    discounts_by_percent: dict[str, int]


class UpdateDiscountStatusRequest(BaseModel):
    status: str


class AdminDiscountResponse(BaseModel):
    id: int
    percent: int
    status: str
    used_at: datetime | None
