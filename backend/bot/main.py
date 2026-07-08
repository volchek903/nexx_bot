import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import MenuButtonWebApp, WebAppInfo

from bot.config import settings
from bot.handlers.start import router as start_router
from bot.keyboards.webapp import is_valid_webapp_url

logger = logging.getLogger(__name__)


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(start_router)

    try:
        if is_valid_webapp_url(settings.webapp_url):
            await bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="Открыть игру", web_app=WebAppInfo(url=settings.webapp_url))
            )
        else:
            logger.warning("Skipping Telegram WebApp menu button: WEBAPP_URL must use HTTPS.")

        await dispatcher.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
