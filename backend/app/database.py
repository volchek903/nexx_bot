from collections.abc import AsyncGenerator
from pathlib import Path

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def ensure_sqlite_directory(database_url: str) -> None:
    parsed = make_url(database_url)
    if not parsed.drivername.startswith("sqlite") or not parsed.database:
        return
    database_path = Path(parsed.database)
    if not database_path.is_absolute():
        database_path = Path(__file__).resolve().parent.parent / database_path
    database_path.parent.mkdir(parents=True, exist_ok=True)


ensure_sqlite_directory(settings.database_url)


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_async_engine(settings.database_url, future=True, connect_args=connect_args)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
