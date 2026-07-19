from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from aiogram.utils.web_app import safe_parse_webapp_init_data
from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError

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


LAST_SEEN_UPDATE_INTERVAL = timedelta(seconds=60)


def _normalize_utc_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _should_update_last_seen(user: User, now: datetime) -> bool:
    last_seen_at = _normalize_utc_datetime(user.last_seen_at)
    return last_seen_at is None or now - last_seen_at >= LAST_SEEN_UPDATE_INTERVAL


async def _commit_user_changes(
    db: AsyncSession,
    *,
    should_commit: bool,
    telegram_id: int,
    init_data: str,
    existing: User,
) -> AuthContext:
    if not should_commit:
        return AuthContext(user=existing, init_data=init_data)

    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        existing = await db.scalar(select(User).where(User.telegram_id == telegram_id))
        if existing is None:
            raise
    return AuthContext(user=existing, init_data=init_data)


async def _get_or_create_local_dev_user(db: AsyncSession) -> AuthContext:
    dev_telegram_id = settings.admin_tg_ids[0] if settings.admin_tg_ids else 123456789
    existing = await db.scalar(select(User).where(User.telegram_id == dev_telegram_id))
    now = utc_now()
    should_commit = False

    if existing is None:
        existing = User(
            telegram_id=dev_telegram_id,
            first_name="Local",
            last_name="Tester",
            username="nexx_local",
            photo_url=None,
            is_admin=dev_telegram_id in settings.admin_tg_ids,
            last_seen_at=now,
            miniapp_opened_at=now,
        )
        db.add(existing)
        should_commit = True
    else:
        if existing.first_name != "Local":
            existing.first_name = "Local"
            should_commit = True
        if existing.last_name != "Tester":
            existing.last_name = "Tester"
            should_commit = True
        if existing.username != "nexx_local":
            existing.username = "nexx_local"
            should_commit = True
        is_admin = dev_telegram_id in settings.admin_tg_ids
        if existing.is_admin != is_admin:
            existing.is_admin = is_admin
            should_commit = True
        if _should_update_last_seen(existing, now):
            existing.last_seen_at = now
            should_commit = True
        if existing.miniapp_opened_at is None:
            existing.miniapp_opened_at = now
            should_commit = True

    return await _commit_user_changes(
        db,
        should_commit=should_commit,
        telegram_id=dev_telegram_id,
        init_data="dev-local",
        existing=existing,
    )


async def get_auth_context(
    db: AsyncSession = Depends(get_db),
    telegram_init_data: str | None = Header(default=None, alias="X-Telegram-Init-Data"),
) -> AuthContext:
    if settings.app_env != "production" and telegram_init_data == "dev-local":
        return await _get_or_create_local_dev_user(db)

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
    should_commit = False

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
        should_commit = True
    else:
        if existing.first_name != telegram_user.first_name:
            existing.first_name = telegram_user.first_name
            should_commit = True
        if existing.last_name != telegram_user.last_name:
            existing.last_name = telegram_user.last_name
            should_commit = True
        if existing.username != telegram_user.username:
            existing.username = telegram_user.username
            should_commit = True
        if existing.photo_url != telegram_user.photo_url:
            existing.photo_url = telegram_user.photo_url
            should_commit = True
        if existing.is_admin != is_admin:
            existing.is_admin = is_admin
            should_commit = True
        if _should_update_last_seen(existing, now):
            existing.last_seen_at = now
            should_commit = True
        if existing.miniapp_opened_at is None:
            existing.miniapp_opened_at = now
            should_commit = True

    return await _commit_user_changes(
        db,
        should_commit=should_commit,
        telegram_id=telegram_user.id,
        init_data=telegram_init_data,
        existing=existing,
    )


async def require_admin(auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if not auth.user.is_admin:
        raise HTTPException(status_code=403, detail="Недостаточно прав для доступа к админке.")
    return auth
