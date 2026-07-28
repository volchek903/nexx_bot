from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.admin import (
    AdminDiscountDeactivationResponse,
    AdminDiscountResponse,
    AdminStatsResponse,
    AdminUserLookupResponse,
    UpdateDiscountStatusRequest,
)
from app.services.admin_service import (
    deactivate_user_active_discounts,
    find_user_by_username,
    get_admin_stats,
    update_discount_status,
)
from app.services.telegram_auth import AuthContext, require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def admin_stats(_: AuthContext = Depends(require_admin), db: AsyncSession = Depends(get_db)) -> AdminStatsResponse:
    return await get_admin_stats(db)


@router.get("/users/by-username", response_model=AdminUserLookupResponse)
async def admin_user_by_username(
    username: str,
    _: AuthContext = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUserLookupResponse:
    try:
        return await find_user_by_username(db, username)
    except ValueError as exc:
        if str(exc) == "Username required":
            raise HTTPException(status_code=400, detail="Укажите username пользователя.") from exc
        if str(exc) == "Username is ambiguous":
            raise HTTPException(
                status_code=409,
                detail="По этому username найдено несколько пользователей. Уточните пользователя другим способом.",
            ) from exc
        raise HTTPException(status_code=404, detail="Пользователь с таким username не найден.") from exc


@router.post("/users/{user_id}/deactivate-discount", response_model=AdminDiscountDeactivationResponse)
async def deactivate_discount_for_user(
    user_id: int,
    _: AuthContext = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminDiscountDeactivationResponse:
    try:
        return await deactivate_user_active_discounts(db, user_id)
    except ValueError as exc:
        if str(exc) == "User not found":
            raise HTTPException(status_code=404, detail="Пользователь не найден.") from exc
        if str(exc) == "No active discount":
            raise HTTPException(status_code=400, detail="У пользователя нет активной скидки.") from exc
        raise HTTPException(status_code=400, detail="Не удалось деактивировать скидку.") from exc


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
