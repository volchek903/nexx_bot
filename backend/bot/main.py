import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.exceptions import TelegramNetworkError
from aiogram.types import MenuButtonWebApp, WebAppInfo

from bot.config import settings
from bot.handlers.start import router as start_router
from bot.keyboards.webapp import get_webapp_url_issue

logger = logging.getLogger(__name__)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(start_router)

    try:
        webapp_url_issue = get_webapp_url_issue(settings.webapp_url)
        if webapp_url_issue is None:
            try:
                await bot.set_chat_menu_button(
                    menu_button=MenuButtonWebApp(text="Открыть игру", web_app=WebAppInfo(url=settings.webapp_url))
                )
            except TelegramNetworkError:
                logger.warning("Failed to set Telegram WebApp menu button because Telegram API timed out.")
        else:
            message = f"Invalid Telegram WebApp URL: {webapp_url_issue}. Current WEBAPP_URL={settings.webapp_url!r}"
            if settings.app_env == "production":
                raise RuntimeError(message)
            logger.warning(message)

        await dispatcher.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
