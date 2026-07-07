from dataclasses import dataclass

from aiogram.utils.web_app import safe_parse_webapp_init_data
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.utils.security import utc_now


class TelegramAuthError(Exception):
    pass


@dataclass
class AuthContext:
    user: User
    init_data: str


async def get_auth_context(
    db: AsyncSession = Depends(get_db),
    telegram_init_data: str | None = Header(default=None, alias="X-Telegram-Init-Data"),
) -> AuthContext:
    if not telegram_init_data:
        raise TelegramAuthError("Invalid Telegram auth")

    try:
        parsed = safe_parse_webapp_init_data(token=settings.bot_token, init_data=telegram_init_data)
    except ValueError as exc:
        raise TelegramAuthError("Invalid Telegram auth") from exc

    if not parsed.user:
        raise TelegramAuthError("Invalid Telegram auth")

    telegram_user = parsed.user
    existing = await db.scalar(select(User).where(User.telegram_id == telegram_user.id))

    is_admin = telegram_user.id in settings.admin_tg_ids
    now = utc_now()

    if existing is None:
        existing = User(
            telegram_id=telegram_user.id,
            first_name=telegram_user.first_name,
            last_name=telegram_user.last_name,
            username=telegram_user.username,
            photo_url=telegram_user.photo_url,
            is_admin=is_admin,
            last_seen_at=now,
            miniapp_opened_at=now,
        )
        db.add(existing)
    else:
        existing.first_name = telegram_user.first_name
        existing.last_name = telegram_user.last_name
        existing.username = telegram_user.username
        existing.photo_url = telegram_user.photo_url
        existing.is_admin = is_admin
        existing.last_seen_at = now
        if existing.miniapp_opened_at is None:
            existing.miniapp_opened_at = now

    await db.commit()
    await db.refresh(existing)
    return AuthContext(user=existing, init_data=telegram_init_data)


async def require_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if not auth.user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав для доступа к админке.")
    return auth
