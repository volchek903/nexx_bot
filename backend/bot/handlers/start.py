from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import MenuButtonWebApp, Message, WebAppInfo

from bot.config import settings
from bot.keyboards.webapp import discount_webapp_keyboard

router = Router()

WELCOME_TEXT = """🎮 Добро пожаловать в Nexx!

Nexx — это игровая комната для отдыха с друзьями, дней рождения, PS5, караоке и ярких вечеров.

Мы приготовили для вас мини-игру, в которой можно выиграть персональную скидку на бронь комнаты.

Откройте карточки Nexx, найдите две одинаковые скидки — и ваш приз сразу закрепится за Telegram-профилем 🎁

Играть можно только один раз, поэтому испытайте удачу внимательно.

Нажмите кнопку ниже и заберите свою скидку 👇"""


@router.message(CommandStart())
async def start_handler(message: Message) -> None:
    await message.bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(
            text="Открыть игру",
            web_app=WebAppInfo(url=settings.webapp_url),
        ),
    )
    await message.answer(WELCOME_TEXT, reply_markup=discount_webapp_keyboard())
