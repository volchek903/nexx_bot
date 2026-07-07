from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.admin import AdminDiscountResponse, AdminStatsResponse, UpdateDiscountStatusRequest
from app.services.admin_service import get_admin_stats, update_discount_status
from app.services.telegram_auth import AuthContext, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def admin_stats(_: AuthContext = Depends(require_admin), db: AsyncSession = Depends(get_db)) -> AdminStatsResponse:
    return await get_admin_stats(db)


@router.patch("/discounts/{discount_id}/status", response_model=AdminDiscountResponse)
async def patch_discount_status(
    discount_id: int,
    payload: UpdateDiscountStatusRequest,
    _: AuthContext = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminDiscountResponse:
    try:
        return await update_discount_status(db, discount_id, payload.status)
    except ValueError as exc:
        status_code = 400 if str(exc) == "Invalid discount status" else 404
        detail = "Некорректный статус скидки." if status_code == 400 else "Скидка не найдена."
        raise HTTPException(status_code=status_code, detail=detail) from exc
