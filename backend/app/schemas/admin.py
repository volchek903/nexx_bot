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


class AdminUserDiscountSummaryResponse(BaseModel):
    id: int
    percent: int
    status: str
    created_at: datetime
    expires_at: datetime | None


class AdminUserLookupResponse(BaseModel):
    user_id: int
    telegram_id: int
    first_name: str
    last_name: str | None
    username: str | None
    active_discount_count: int
    active_discount: AdminUserDiscountSummaryResponse | None


class AdminDiscountDeactivationResponse(BaseModel):
    user_id: int
    telegram_id: int
    username: str | None
    deactivated_discounts: int
