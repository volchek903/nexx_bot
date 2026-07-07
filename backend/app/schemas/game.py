from pydantic import BaseModel

from app.schemas.discount import DiscountShortSchema


class GameCardSchema(BaseModel):
    card_id: str
    is_opened: bool
    is_matched: bool
    revealed_percent: int | None


class GameStateResponse(BaseModel):
    game_id: int | None
    status: str
    opened_cards_count: int
    cards: list[GameCardSchema]
    discount: DiscountShortSchema | None = None
    message: str | None = None


class StartGameResponse(GameStateResponse):
    pass


class OpenCardRequest(BaseModel):
    game_id: int
    card_id: str


class OpenedCardSchema(BaseModel):
    card_id: str
    revealed_percent: int


class OpenCardResponse(BaseModel):
    status: str
    opened_card: OpenedCardSchema | None = None
    match: bool | None = None
    matched_cards: list[str] | None = None
    should_close_cards: list[str] | None = None
    discount: DiscountShortSchema | None = None
    message: str | None = None
