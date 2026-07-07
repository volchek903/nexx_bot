import random
from typing import TypeVar

T = TypeVar("T")


def weighted_choice(weighted_items: dict[T, int]) -> T:
    population = list(weighted_items.keys())
    weights = list(weighted_items.values())
    return random.choices(population, weights=weights, k=1)[0]
