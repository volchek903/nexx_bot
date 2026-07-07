from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import ensure_sqlite_directory
from app.routers.admin import router as admin_router
from app.routers.discounts import router as discounts_router
from app.routers.game import router as game_router
from app.routers.users import router as users_router
from app.services.telegram_auth import TelegramAuthError

ensure_sqlite_directory(settings.database_url)

app = FastAPI(title="Nexx Telegram Mini App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(TelegramAuthError)
async def telegram_auth_exception_handler(_, exc: TelegramAuthError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"error": str(exc)})


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(users_router)
app.include_router(game_router)
app.include_router(discounts_router)
app.include_router(admin_router)
