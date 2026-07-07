from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.discount import Discount
from app.schemas.discount import DiscountSchema, MyDiscountsResponse
from app.utils.security import utc_now


def build_discount_expiration():
    if settings.discount_expires_days is None:
        return None
    return utc_now() + timedelta(days=settings.discount_expires_days)


async def list_user_discounts(db: AsyncSession, user_id: int) -> MyDiscountsResponse:
    discounts = (
        await db.scalars(select(Discount).where(Discount.user_id == user_id).order_by(Discount.created_at.desc()))
    ).all()
    return MyDiscountsResponse(
        discounts=[
            DiscountSchema(
                id=discount.id,
                percent=discount.percent,
                status=discount.status,
                created_at=discount.created_at,
                used_at=discount.used_at,
                expires_at=discount.expires_at,
            )
            for discount in discounts
        ]
    )
