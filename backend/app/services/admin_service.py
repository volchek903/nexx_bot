from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.discount import DISCOUNT_STATUS_ACTIVE, DISCOUNT_STATUS_EXPIRED, DISCOUNT_STATUS_USED, Discount
from app.models.game import GAME_STATUS_COMPLETED, Game
from app.models.user import User
from app.schemas.admin import AdminDiscountResponse, AdminStatsResponse
from app.utils.security import utc_now


async def get_admin_stats(db: AsyncSession) -> AdminStatsResponse:
    users_total = await db.scalar(select(func.count(User.id))) or 0
    miniapp_opened = await db.scalar(select(func.count(User.id)).where(User.miniapp_opened_at.is_not(None))) or 0
    games_started = await db.scalar(select(func.count(Game.id))) or 0
    games_completed = await db.scalar(select(func.count(Game.id)).where(Game.status == GAME_STATUS_COMPLETED)) or 0

    discount_counts = (
        await db.execute(
            select(
                func.sum(case((Discount.status == DISCOUNT_STATUS_ACTIVE, 1), else_=0)),
                func.sum(case((Discount.status == DISCOUNT_STATUS_USED, 1), else_=0)),
                func.sum(case((Discount.status == DISCOUNT_STATUS_EXPIRED, 1), else_=0)),
            )
        )
    ).one()

    percent_rows = (
        await db.execute(select(Discount.percent, func.count(Discount.id)).group_by(Discount.percent).order_by(Discount.percent))
    ).all()

    discounts_by_percent = {str(percent): count for percent, count in percent_rows}
    for percent in (5, 10, 15, 20, 25):
        discounts_by_percent.setdefault(str(percent), 0)

    return AdminStatsResponse(
        users_total=users_total,
        miniapp_opened=miniapp_opened,
        games_started=games_started,
        games_completed=games_completed,
        active_discounts=discount_counts[0] or 0,
        used_discounts=discount_counts[1] or 0,
        expired_discounts=discount_counts[2] or 0,
        discounts_by_percent=discounts_by_percent,
    )


async def update_discount_status(db: AsyncSession, discount_id: int, status: str) -> AdminDiscountResponse:
    if status not in {DISCOUNT_STATUS_ACTIVE, DISCOUNT_STATUS_USED, DISCOUNT_STATUS_EXPIRED}:
        raise ValueError("Invalid discount status")

    discount = await db.get(Discount, discount_id)
    if discount is None:
        raise ValueError("Discount not found")

    discount.status = status
    discount.used_at = utc_now() if status == DISCOUNT_STATUS_USED else None
    await db.commit()
    await db.refresh(discount)

    return AdminDiscountResponse(
        id=discount.id,
        percent=discount.percent,
        status=discount.status,
        used_at=discount.used_at,
    )
