import logging

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, MenuButtonWebApp, Message, WebAppInfo

from bot.config import settings
from bot.keyboards.webapp import BOOK_ROOM_CALLBACK, discount_webapp_keyboard, get_webapp_url_issue

router = Router()
logger = logging.getLogger(__name__)

WELCOME_TEXT = """🎮 Добро пожаловать в Nexx!

Здесь вас ждёт мини-игра от игровой комнаты Nexx: откройте карточки, найдите пару одинаковых процентов и получите свою персональную скидку на бронь.

Скидка сразу закрепится за вашим Telegram-профилем, а шанс на игру даётся только один раз.

Нажмите кнопку ниже и попробуйте выиграть свой процент 👇"""

CONFIG_ERROR_TEXT = (
    "⚠️ Мини-приложение сейчас недоступно. Боту нужен публичный HTTPS-адрес приложения, "
    "иначе Telegram открывает обычную ссылку без данных профиля."
)

BOOKING_TEXT = """✨ Забронируем для вас лучший формат отдыха в Nexx

Хотите провести вечер с друзьями, устроить день рождения, корпоратив или просто красиво отдохнуть? Напишите нам в <a href="https://t.me/nexx_book">@nexx_book</a> — подберём комнату, расскажем по свободным слотам и поможем быстро оформить бронь.

Что поможем сделать:
• подобрать удобное время;
• сориентировать по форматам отдыха;
• ответить на вопросы по бронированию;
• быстро закрепить за вами комнату.

Напишите в <a href="https://t.me/nexx_book">@nexx_book</a> — всё подскажем и организуем 👌"""


@router.message(CommandStart())
async def start_handler(message: Message) -> None:
    logger.info(
        "Received /start from user_id=%s chat_id=%s username=%s",
        message.from_user.id if message.from_user else None,
        message.chat.id,
        message.from_user.username if message.from_user else None,
    )
    webapp_url_issue = get_webapp_url_issue(settings.webapp_url)
    if webapp_url_issue:
        logger.warning("Cannot open WebApp for /start because WEBAPP_URL is invalid: %s", webapp_url_issue)
        await message.answer(f"{WELCOME_TEXT}\n\n{CONFIG_ERROR_TEXT}")
        return

    await message.bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(
            text="Сыграть",
            web_app=WebAppInfo(url=settings.webapp_url),
        ),
    )

    await message.answer(WELCOME_TEXT, reply_markup=discount_webapp_keyboard())


@router.callback_query(F.data == BOOK_ROOM_CALLBACK)
async def book_room_callback(callback: CallbackQuery) -> None:
    logger.info(
        "Received booking callback from user_id=%s chat_id=%s",
        callback.from_user.id,
        callback.message.chat.id if callback.message else None,
    )
    if callback.message is not None:
        await callback.message.answer(BOOKING_TEXT, parse_mode="HTML", disable_web_page_preview=True)
    await callback.answer("Открыли информацию по бронированию")
