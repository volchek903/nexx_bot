from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.game import GameStateResponse, OpenCardRequest, OpenCardResponse, StartGameResponse
from app.services.game_service import get_game_state, open_card, start_or_get_game
from app.services.telegram_auth import AuthContext, get_auth_context
from app.utils.rate_limit import GAME_API_RULE, OPEN_CARD_RULE, enforce_user_rate_limit

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/start", response_model=StartGameResponse)
async def start_game(auth: AuthContext = Depends(get_auth_context), db: AsyncSession = Depends(get_db)) -> StartGameResponse:
    await enforce_user_rate_limit(auth.user.telegram_id, GAME_API_RULE)
    return await start_or_get_game(db, auth.user)


@router.get("/state", response_model=GameStateResponse)
async def game_state(auth: AuthContext = Depends(get_auth_context), db: AsyncSession = Depends(get_db)) -> GameStateResponse:
    await enforce_user_rate_limit(auth.user.telegram_id, GAME_API_RULE)
    return await get_game_state(db, auth.user)


@router.post("/open-card", response_model=OpenCardResponse)
async def open_game_card(
    payload: OpenCardRequest,
    auth: AuthContext = Depends(get_auth_context),
    db: AsyncSession = Depends(get_db),
) -> OpenCardResponse:
    await enforce_user_rate_limit(auth.user.telegram_id, GAME_API_RULE, OPEN_CARD_RULE)
    return await open_card(db, auth.user, payload.game_id, payload.card_id)
