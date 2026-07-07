import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.types import MenuButtonWebApp, WebAppInfo

from bot.config import settings
from bot.handlers.start import router as start_router


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(start_router)

    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(text="Открыть игру", web_app=WebAppInfo(url=settings.webapp_url))
    )
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
