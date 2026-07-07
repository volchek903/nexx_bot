from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.security import utc_now

DISCOUNT_STATUS_ACTIVE = "active"
DISCOUNT_STATUS_USED = "used"
DISCOUNT_STATUS_EXPIRED = "expired"

if TYPE_CHECKING:
    from app.models.game import Game
    from app.models.user import User


class Discount(Base):
    __tablename__ = "discounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), unique=True, index=True)
    percent: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(32), default=DISCOUNT_STATUS_ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship(back_populates="discounts")
    game: Mapped[Game] = relationship(back_populates="discount")
