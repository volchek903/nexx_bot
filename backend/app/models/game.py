from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.security import utc_now

GAME_STATUS_NOT_STARTED = "not_started"
GAME_STATUS_IN_PROGRESS = "in_progress"
GAME_STATUS_COMPLETED = "completed"
GAME_STATUS_BLOCKED = "blocked"

if TYPE_CHECKING:
    from app.models.discount import Discount
    from app.models.game_card import GameCard
    from app.models.game_move import GameMove
    from app.models.user import User


class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(32), default=GAME_STATUS_IN_PROGRESS)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    winning_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)

    user: Mapped[User] = relationship(back_populates="game")
    cards: Mapped[list[GameCard]] = relationship(
        back_populates="game",
        cascade="all, delete-orphan",
        order_by="GameCard.position",
    )
    discount: Mapped[Discount | None] = relationship(back_populates="game", uselist=False)
    moves: Mapped[list[GameMove]] = relationship(back_populates="game", cascade="all, delete-orphan")
