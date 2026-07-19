from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from urllib.parse import urlparse

from bot.config import settings


LOCAL_WEBAPP_HOSTS = {"localhost", "0.0.0.0", "::1"}


def get_webapp_url_issue(url: str) -> str | None:
    parsed = urlparse(url)
    hostname = parsed.hostname or ""

    if parsed.scheme != "https":
        return "WEBAPP_URL must use HTTPS"
    if not parsed.netloc:
        return "WEBAPP_URL must include a hostname"
    if hostname in LOCAL_WEBAPP_HOSTS or hostname.startswith("127."):
        return "WEBAPP_URL must point to a public host, not localhost"
    return None


def is_valid_webapp_url(url: str) -> bool:
    return get_webapp_url_issue(url) is None


def discount_webapp_keyboard() -> InlineKeyboardMarkup | None:
    if not is_valid_webapp_url(settings.webapp_url):
        return None

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
