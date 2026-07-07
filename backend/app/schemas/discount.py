from datetime import datetime

from pydantic import BaseModel


class DiscountSchema(BaseModel):
    id: int
    percent: int
    status: str
    created_at: datetime
    used_at: datetime | None
    expires_at: datetime | None


class DiscountShortSchema(BaseModel):
    percent: int
    status: str


class MyDiscountsResponse(BaseModel):
    discounts: list[DiscountSchema]
