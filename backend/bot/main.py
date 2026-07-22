import asyncio
import logging
from typing import Awaitable, Callable

from aiogram import Bot, Dispatcher
from aiogram.exceptions import TelegramAPIError, TelegramConflictError, TelegramNetworkError
from aiogram.types import BotCommand, BotCommandScopeAllPrivateChats, MenuButtonWebApp, WebAppInfo

from bot.config import settings
from bot.handlers.start import router as start_router
from bot.keyboards.webapp import get_webapp_url_issue

logger = logging.getLogger(__name__)
RETRY_DELAY_SECONDS = 5
REQUEST_RETRY_ATTEMPTS = 3
REQUEST_RETRY_DELAY_SECONDS = 2
PRIVATE_COMMANDS = [
    BotCommand(
        command="start",
        description="Открыть приветствие и запустить игру",
    )
]


async def call_telegram_with_retries(
    action_name: str,
    action: Callable[[], Awaitable[object]],
    *,
    required: bool = False,
):
    last_error: TelegramNetworkError | None = None

    for attempt in range(1, REQUEST_RETRY_ATTEMPTS + 1):
        try:
            result = await action()
            if attempt > 1:
                logger.info("%s succeeded on retry %s/%s.", action_name, attempt, REQUEST_RETRY_ATTEMPTS)
            return result
        except TelegramNetworkError as error:
            last_error = error
            logger.warning(
                "%s failed because Telegram API timed out on attempt %s/%s.",
                action_name,
                attempt,
                REQUEST_RETRY_ATTEMPTS,
            )
            if attempt < REQUEST_RETRY_ATTEMPTS:
                await asyncio.sleep(REQUEST_RETRY_DELAY_SECONDS)
        except TelegramAPIError:
            raise

    if required and last_error is not None:
        raise last_error
    return None


async def configure_bot(bot: Bot, dispatcher: Dispatcher) -> None:
    bot_info = await call_telegram_with_retries("getMe", bot.get_me, required=True)
    logger.info(
        "Starting bot @%s (%s) in %s mode.",
        bot_info.username,
        bot_info.id,
        settings.app_env,
    )

    await call_telegram_with_retries(
        "deleteWebhook",
        lambda: bot.delete_webhook(drop_pending_updates=False),
    )
    webhook_info = await call_telegram_with_retries("getWebhookInfo", bot.get_webhook_info)
    if webhook_info is not None and webhook_info.url:
        logger.warning("Telegram webhook is still active: %s", webhook_info.url)
    else:
        logger.info("Telegram webhook is not configured. Long polling can receive updates.")

    await call_telegram_with_retries(
        "setMyCommands",
        lambda: bot.set_my_commands(PRIVATE_COMMANDS, scope=BotCommandScopeAllPrivateChats()),
    )

    webapp_url_issue = get_webapp_url_issue(settings.webapp_url)
    if webapp_url_issue is None:
        await call_telegram_with_retries(
            "setChatMenuButton",
            lambda: bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="Сыграть", web_app=WebAppInfo(url=settings.webapp_url))
            ),
        )
    else:
        message = f"Invalid Telegram WebApp URL: {webapp_url_issue}. Current WEBAPP_URL={settings.webapp_url!r}"
        if settings.app_env == "production":
            raise RuntimeError(message)
        logger.warning(message)

    allowed_updates = dispatcher.resolve_used_update_types()
    logger.info("Enabled update types for polling: %s", ", ".join(allowed_updates))


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s:%(name)s:%(message)s",
        force=True,
    )
    bot = Bot(token=settings.bot_token)
    dispatcher = Dispatcher()
    dispatcher.include_router(start_router)

    try:
        while True:
            try:
                await configure_bot(bot, dispatcher)
                logger.info("Starting Telegram long polling.")
                await dispatcher.start_polling(
                    bot,
                    allowed_updates=dispatcher.resolve_used_update_types(),
                )
                break
            except TelegramConflictError as error:
                logger.error("Telegram polling conflict: %s", error)
                await asyncio.sleep(RETRY_DELAY_SECONDS)
            except TelegramNetworkError:
                logger.warning(
                    "Telegram API timed out during bot startup or polling. Retrying in %s seconds.",
                    RETRY_DELAY_SECONDS,
                )
                await asyncio.sleep(RETRY_DELAY_SECONDS)
            except TelegramAPIError as error:
                logger.exception("Telegram API error during bot startup or polling: %s", error)
                await asyncio.sleep(RETRY_DELAY_SECONDS)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
