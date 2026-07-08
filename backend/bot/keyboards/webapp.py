from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from urllib.parse import urlparse

from bot.config import settings


def is_valid_webapp_url(url: str) -> bool:
    return urlparse(url).scheme == "https"


def discount_webapp_keyboard() -> InlineKeyboardMarkup | None:
    if not is_valid_webapp_url(settings.webapp_url):
        return InlineKeyboardMarkup(
            inline_keyboard=[
                [
                    InlineKeyboardButton(
                        text="🎁 Открыть игру",
                        url=settings.webapp_url,
                    )
                ]
            ]
        )

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎁 Получить скидку",
                    web_app=WebAppInfo(url=settings.webapp_url),
                )
            ]
        ]
    )
