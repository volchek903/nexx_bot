from __future__ import annotations

from collections import Counter
from dataclasses import dataclass

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.discount import DISCOUNT_STATUS_ACTIVE, Discount
from app.models.game import GAME_STATUS_BLOCKED, GAME_STATUS_COMPLETED, GAME_STATUS_IN_PROGRESS, Game
from app.models.game_card import GameCard
from app.models.game_move import GameMove
from app.models.user import User
from app.schemas.discount import DiscountShortSchema
from app.schemas.game import GameCardSchema, GameStateResponse, OpenCardResponse, OpenedCardSchema, StartGameResponse
from app.services.discount_service import build_discount_expiration
from app.utils.security import utc_now
from app.utils.weighted_random import weighted_choice

TARGET_WEIGHTS = {5: 15, 10: 35, 15: 35, 20: 10, 25: 5}
FILLER_WEIGHTS = {5: 20, 10: 35, 15: 30, 20: 10, 25: 5}


@dataclass
class GameSnapshot:
    game: Game
    discount: Discount | None


async def get_user_game_snapshot(db: AsyncSession, user_id: int) -> GameSnapshot | None:
    game = await db.scalar(
        select(Game)
        .options(selectinload(Game.cards), selectinload(Game.discount))
        .where(Game.user_id == user_id)
    )
    if game is None:
        return None
    return GameSnapshot(game=game, discount=game.discount)


def _serialize_discount(discount: Discount | None) -> DiscountShortSchema | None:
    if discount is None:
        return None
    return DiscountShortSchema(percent=discount.percent, status=discount.status)


def _serialize_cards(cards: list[GameCard]) -> list[GameCardSchema]:
    ordered_cards = sorted(cards, key=lambda card: card.position)
    return [
        GameCardSchema(
            card_id=card.card_key,
            is_opened=card.is_opened or card.is_matched,
            is_matched=card.is_matched,
            revealed_percent=card.percent if card.is_opened or card.is_matched else None,
        )
        for card in ordered_cards
    ]


def _build_state_response(game: Game, *, force_blocked: bool = False, message: str | None = None) -> GameStateResponse:
    status = GAME_STATUS_BLOCKED if force_blocked else game.status
    opened_cards_count = sum(1 for card in game.cards if card.is_opened or card.is_matched)
    return GameStateResponse(
        game_id=game.id,
        status=status,
        opened_cards_count=opened_cards_count,
        cards=_serialize_cards(game.cards),
        discount=_serialize_discount(game.discount),
        message=message,
    )


def _pick_filler_percent(counts: Counter[int], max_counts: dict[int, int]) -> int:
    available = {percent: weight for percent, weight in FILLER_WEIGHTS.items() if counts[percent] < max_counts[percent]}
    if not available:
        fallback = {percent: weight for percent, weight in FILLER_WEIGHTS.items() if percent in (5, 10, 15)}
        return weighted_choice(fallback)
    return weighted_choice(available)


def generate_board_layout() -> list[tuple[str, int, int]]:
    target_percent = weighted_choice(TARGET_WEIGHTS)
    counts = Counter({target_percent: 2})
    max_counts = {
        5: 9,
        10: 9,
        15: 9,
        20: 2 if target_percent != 20 else 2,
        25: 1 if target_percent != 25 else 2,
    }
    percents = [target_percent, target_percent]

    while len(percents) < 9:
        percent = _pick_filler_percent(counts, max_counts)
        counts[percent] += 1
        percents.append(percent)

    from random import shuffle

    shuffle(percents)
    return [(f"card_{position + 1}", position, percent) for position, percent in enumerate(percents)]


async def start_or_get_game(db: AsyncSession, user: User) -> StartGameResponse:
    snapshot = await get_user_game_snapshot(db, user.id)
    if snapshot and snapshot.discount:
        state = _build_state_response(
            snapshot.game,
            force_blocked=True,
            message="Вы уже получили свою скидку",
        )
        return StartGameResponse(**state.model_dump())

    if snapshot:
        state = _build_state_response(snapshot.game)
        return StartGameResponse(**state.model_dump())

    game = Game(user_id=user.id, status=GAME_STATUS_IN_PROGRESS)
    db.add(game)
    await db.flush()

    for card_key, position, percent in generate_board_layout():
        db.add(
            GameCard(
                game_id=game.id,
                card_key=card_key,
                position=position,
                percent=percent,
            )
        )

    await db.commit()
    refreshed = await get_user_game_snapshot(db, user.id)
    if refreshed is None:
        raise HTTPException(status_code=500, detail="Не удалось создать игру.")
    state = _build_state_response(refreshed.game)
    return StartGameResponse(**state.model_dump())


async def get_game_state(db: AsyncSession, user: User) -> GameStateResponse:
    snapshot = await get_user_game_snapshot(db, user.id)
    if snapshot is None:
        return GameStateResponse(
            game_id=None,
            status="not_started",
            opened_cards_count=0,
            cards=[],
            discount=None,
            message="Готовы испытать удачу?",
        )
    if snapshot.discount:
        return _build_state_response(
            snapshot.game,
            force_blocked=True,
            message="Вы уже получили свою скидку",
        )
    return _build_state_response(snapshot.game)


async def open_card(db: AsyncSession, user: User, game_id: int, card_id: str) -> OpenCardResponse:
    snapshot = await get_user_game_snapshot(db, user.id)
    if snapshot is None or snapshot.game.id != game_id:
        raise HTTPException(status_code=404, detail="Игра не найдена.")

    game = snapshot.game
    if snapshot.discount or game.status != GAME_STATUS_IN_PROGRESS:
        return OpenCardResponse(
            status=GAME_STATUS_BLOCKED,
            message="Вы уже получили свою скидку",
            discount=_serialize_discount(snapshot.discount),
        )

    target_card = next((card for card in game.cards if card.card_key == card_id), None)
    if target_card is None:
        raise HTTPException(status_code=404, detail="Карточка не найдена.")
    if target_card.is_matched or target_card.is_opened:
        raise HTTPException(status_code=409, detail="Эта карточка уже открыта.")

    currently_opened = [card for card in game.cards if card.is_opened and not card.is_matched]
    if len(currently_opened) >= 2:
        raise HTTPException(status_code=409, detail="Сейчас нельзя открыть новую карточку.")

    target_card.is_opened = True
    target_card.opened_at = utc_now()
    db.add(
        GameMove(
            game_id=game.id,
            user_id=user.id,
            card_id=target_card.card_key,
            revealed_percent=target_card.percent,
        )
    )

    if not currently_opened:
        await db.commit()
        return OpenCardResponse(
            status=GAME_STATUS_IN_PROGRESS,
            opened_card=OpenedCardSchema(card_id=target_card.card_key, revealed_percent=target_card.percent),
            match=None,
            discount=None,
        )

    first_card = currently_opened[0]
    if first_card.percent != target_card.percent:
        first_card.is_opened = False
        target_card.is_opened = False
        await db.commit()
        return OpenCardResponse(
            status=GAME_STATUS_IN_PROGRESS,
            opened_card=OpenedCardSchema(card_id=target_card.card_key, revealed_percent=target_card.percent),
            match=False,
            should_close_cards=[first_card.card_key, target_card.card_key],
            discount=None,
        )

    first_card.is_matched = True
    target_card.is_matched = True
    game.status = GAME_STATUS_COMPLETED
    game.completed_at = utc_now()
    game.winning_percent = target_card.percent

    discount = Discount(
        user_id=user.id,
        game_id=game.id,
        percent=target_card.percent,
        status=DISCOUNT_STATUS_ACTIVE,
        expires_at=build_discount_expiration(),
    )
    db.add(discount)
    await db.commit()

    return OpenCardResponse(
        status=GAME_STATUS_COMPLETED,
        opened_card=OpenedCardSchema(card_id=target_card.card_key, revealed_percent=target_card.percent),
        match=True,
        matched_cards=[first_card.card_key, target_card.card_key],
        discount=_serialize_discount(discount),
    )
