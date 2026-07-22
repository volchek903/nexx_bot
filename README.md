# Nexx Telegram Mini App

Telegram Mini App и бот для игровой комнаты Nexx. Стек:

- `backend/`: FastAPI + SQLAlchemy 2.0 + SQLite + Alembic + aiogram 3
- `frontend/`: Next.js + React + TypeScript + Tailwind CSS + Framer Motion
- SQLite хранится в `backend/data/nexx_game.sqlite3`
- бот и API используют один backend-image

## Структура

```text
backend/
frontend/
docker-compose.yml
docker-compose.prod.yml
.env.example
README.md
Makefile
```

## Быстрый старт через Docker

1. Создайте рабочий `.env`:

```bash
cp .env.example .env
```

2. Заполните минимум:

- `BOT_TOKEN`
- `TELEGRAM_BOT_USERNAME`
- `WEBAPP_URL`
- `API_URL`
- `NEXT_PUBLIC_API_URL`
- `ADMIN_TG_IDS`

3. Запустите весь проект:

```bash
docker compose up --build
```

Сервисы:

- `backend-api` на `http://localhost:8000`
- `frontend` на `http://localhost:2023`
- `backend-bot` запускается как `python -m bot.main`

SQLite сохраняется между рестартами через volume:

```yaml
./backend/data:/app/data
```

## Production compose

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

В production frontend запускается через:

```bash
npm run build
npm run start
```

## Makefile

```bash
make dev
make prod
make down
make logs
make migrate
make build-backend
make build-frontend
```

## Локальный запуск backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
mkdir -p data
alembic upgrade head
uvicorn app.main:app --reload
```

## Локальный запуск бота

```bash
cd backend
source venv/bin/activate
python -m bot.main
```

## Локальный запуск frontend

```bash
cd frontend
npm install
npm run dev
```

## ENV

Корневой `.env.example` содержит все основные переменные:

```env
BOT_TOKEN=telegram_bot_token
TELEGRAM_BOT_USERNAME=NexxBot
TELEGRAM_PROXY=
WEBAPP_URL=https://your-mini-app-domain.com
API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_URL=https://your-api-domain.com
DATABASE_URL=sqlite+aiosqlite:///./data/nexx_game.sqlite3
ADMIN_TG_IDS=123456789,987654321
JWT_SECRET=change_me
APP_ENV=development
CORS_ORIGINS=http://localhost:2023,https://your-mini-app-domain.com
DISCOUNT_EXPIRES_DAYS=
```

`DISCOUNT_EXPIRES_DAYS` можно оставить пустым. Тогда скидка не истекает автоматически.

`TELEGRAM_PROXY` необязателен. Если он задан, прокси используется только ботом для обращений к Telegram Bot API. Поддерживаются два формата:

- полный URL, например `http://user:password@host:port`
- сокращённый формат `host:port:user:password`

## Миграции Alembic

Локально:

```bash
cd backend
alembic upgrade head
```

В Docker:

```bash
docker compose exec backend-api alembic upgrade head
```

Первая миграция создаёт таблицы:

- `users`
- `games`
- `game_cards`
- `discounts`
- `game_moves`

## Где хранится база

- путь в контейнере: `/app/data/nexx_game.sqlite3`
- путь в проекте: `backend/data/nexx_game.sqlite3`

Папка `backend/data/` создаётся автоматически.

## Настройка Telegram Mini App

1. Создайте бота через BotFather.
2. Заполните `BOT_TOKEN` и `TELEGRAM_BOT_USERNAME`.
3. Укажите публичный URL Mini App в `WEBAPP_URL`.
4. Укажите публичный backend URL в `API_URL` и `NEXT_PUBLIC_API_URL`.
5. Запустите `backend-bot`.
6. Откройте бота и отправьте `/start`.

Что делает бот:

- отправляет приветственное сообщение;
- показывает inline-кнопку `🎁 Получить скидку`;
- настраивает menu button `Открыть игру` через `WebAppInfo`.

## Как добавить админов

Укажите Telegram ID через запятую:

```env
ADMIN_TG_IDS=123456789,987654321
```

Админка доступна только этим пользователям:

- вкладка `Админка` скрыта для остальных;
- `/admin` на frontend защищён;
- `/api/admin/*` на backend защищён.

## Логотип

Файл логотипа лежит в:

- `frontend/public/logo.png`

Если нужно заменить логотип, положите новый файл по тому же пути. Интерфейс использует именно изображение, а не текстовую замену.

## Логика игры и скидок

Игровое поле:

- `3x3`, всего `9` карточек;
- backend хранит полную раскладку в SQLite;
- frontend получает только безопасное публичное состояние карточек.

Выигрышные вероятности целевой скидки:

- `5%` — `15%`
- `10%` — `35%`
- `15%` — `35%`
- `20%` — `10%`
- `25%` — `5%`

Статусы игры:

- `not_started`
- `in_progress`
- `completed`
- `blocked`

Статусы скидки:

- `active`
- `used`
- `expired`

После нахождения пары:

- создаётся запись в `discounts`;
- игра завершается;
- повторно играть нельзя;
- скидка показывается в профиле.

## Защита от просмотра скрытых карточек

Античит реализован так:

- раскладка процентов хранится только в backend и SQLite;
- frontend не получает массив процентов всех карточек;
- закрытые карточки приходят без `revealed_percent`;
- `POST /api/game/open-card` открывает только конкретную карточку;
- backend проверяет владельца игры, статус игры, существование карточки и rate limit;
- все запросы Mini App требуют `X-Telegram-Init-Data`;
- `initData` валидируется на backend через `BOT_TOKEN`.

Базовый rate limit:

- не более `5` открытий карточек в секунду;
- не более `20` игровых запросов за `10` секунд.

## API

Основные endpoints:

- `GET /api/me`
- `POST /api/game/start`
- `GET /api/game/state`
- `POST /api/game/open-card`
- `GET /api/discounts/my`
- `GET /api/admin/stats`
- `PATCH /api/admin/discounts/{discount_id}/status`

Если Telegram auth невалидна, backend возвращает:

```json
{
  "error": "Invalid Telegram auth"
}
```

## Сборка Docker image

Backend:

```bash
docker build -t nexx-backend:latest ./backend
```

Frontend:

```bash
docker build -t nexx-frontend:latest ./frontend
```

## Push Docker image в registry

```bash
docker tag nexx-backend:latest your-registry/nexx-backend:latest
docker tag nexx-frontend:latest your-registry/nexx-frontend:latest

docker push your-registry/nexx-backend:latest
docker push your-registry/nexx-frontend:latest
```

## Дополнительно

- frontend сделан mobile-first под Telegram WebApp;
- нижняя навигация фиксирована снизу;
- UI использует неоновую палитру Nexx;
- модальное окно правил хранит факт показа в `localStorage`;
- выигрышное окно ведёт в профиль;
- backend и bot используют один Dockerfile из `backend/`.
