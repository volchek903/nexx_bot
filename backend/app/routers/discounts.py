from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.discount import MyDiscountsResponse
from app.services.discount_service import list_user_discounts
from app.services.telegram_auth import AuthContext, get_auth_context

router = APIRouter(prefix="/api/discounts", tags=["discounts"])


@router.get("/my", response_model=MyDiscountsResponse)
async def my_discounts(auth: AuthContext = Depends(get_auth_context), db: AsyncSession = Depends(get_db)) -> MyDiscountsResponse:
    return await list_user_discounts(db, auth.user.id)
