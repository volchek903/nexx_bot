from collections import defaultdict, deque
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
import asyncio
import time

from fastapi import HTTPException


@dataclass(frozen=True)
class RateLimitRule:
    name: str
    limit: int
    window_seconds: float
    message: str


class MemoryRateLimiter:
    def __init__(self) -> None:
        self._storage: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def enforce(self, key: str, rule: RateLimitRule) -> None:
        now = time.monotonic()
        async with self._lock:
            bucket = self._storage[f"{rule.name}:{key}"]
            cutoff = now - rule.window_seconds
            while bucket and bucket[0] < cutoff:
                bucket.popleft()
            if len(bucket) >= rule.limit:
                raise HTTPException(status_code=429, detail=rule.message)
            bucket.append(now)


rate_limiter = MemoryRateLimiter()

GAME_API_RULE = RateLimitRule(
    name="game_api",
    limit=20,
    window_seconds=10.0,
    message="Слишком много запросов к игре. Попробуйте через несколько секунд.",
)
OPEN_CARD_RULE = RateLimitRule(
    name="open_card",
    limit=5,
    window_seconds=1.0,
    message="Слишком частые открытия карточек. Снизьте темп.",
)


async def enforce_user_rate_limit(user_id: int, *rules: RateLimitRule) -> None:
    for rule in rules:
        await rate_limiter.enforce(str(user_id), rule)
