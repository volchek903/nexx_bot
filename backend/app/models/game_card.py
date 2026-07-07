from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.game import Game


class GameCard(Base):
    __tablename__ = "game_cards"
    __table_args__ = (
        UniqueConstraint("game_id", "card_key", name="uq_game_cards_game_key"),
        UniqueConstraint("game_id", "position", name="uq_game_cards_game_position"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    game_id: Mapped[int] = mapped_column(ForeignKey("games.id", ondelete="CASCADE"), index=True)
    card_key: Mapped[str] = mapped_column(String(64))
    position: Mapped[int] = mapped_column(Integer)
    percent: Mapped[int] = mapped_column(Integer)
    is_opened: Mapped[bool] = mapped_column(Boolean, default=False)
    is_matched: Mapped[bool] = mapped_column(Boolean, default=False)
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    game: Mapped[Game] = relationship(back_populates="cards")
