from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.game import GAME_STATUS_NOT_STARTED, Game
from app.schemas.user import MeResponse
from app.services.telegram_auth import AuthContext, get_auth_context

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/me", response_model=MeResponse)
async def get_me(auth: AuthContext = Depends(get_auth_context), db: AsyncSession = Depends(get_db)) -> MeResponse:
    game = await db.scalar(select(Game).where(Game.user_id == auth.user.id))
    return MeResponse(
        id=auth.user.id,
        telegram_id=auth.user.telegram_id,
        first_name=auth.user.first_name,
        last_name=auth.user.last_name,
        username=auth.user.username,
        photo_url=auth.user.photo_url,
        is_admin=auth.user.is_admin,
        game_status=game.status if game else GAME_STATUS_NOT_STARTED,
    )
