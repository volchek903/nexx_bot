from functools import lru_cache
from typing import Annotated, Any
from urllib.parse import quote

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    bot_token: str = Field(alias="BOT_TOKEN")
    telegram_bot_username: str = Field(alias="TELEGRAM_BOT_USERNAME")
    telegram_proxy: str | None = Field(default=None, alias="TELEGRAM_PROXY")
    webapp_url: str = Field(alias="WEBAPP_URL")
    api_url: str = Field(alias="API_URL")
    database_url: str = Field(alias="DATABASE_URL")
    admin_tg_ids: Annotated[list[int], NoDecode] = Field(default_factory=list, alias="ADMIN_TG_IDS")
    jwt_secret: str = Field(alias="JWT_SECRET")
    app_env: str = Field(default="development", alias="APP_ENV")
    cors_origins: Annotated[list[str], NoDecode] = Field(default_factory=list, alias="CORS_ORIGINS")
    discount_expires_days: int | None = Field(default=None, alias="DISCOUNT_EXPIRES_DAYS")

    @field_validator("admin_tg_ids", mode="before")
    @classmethod
    def parse_admin_ids(cls, value: Any) -> list[int]:
        if value in (None, "", []):
            return []
        if isinstance(value, list):
            return [int(item) for item in value]
        return [int(item.strip()) for item in str(value).split(",") if item.strip()]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> list[str]:
        if value in (None, "", []):
            return []
        if isinstance(value, list):
            return value
        return [item.strip() for item in str(value).split(",") if item.strip()]

    @field_validator("discount_expires_days", mode="before")
    @classmethod
    def parse_discount_expires_days(cls, value: Any) -> int | None:
        if value in (None, ""):
            return None
        return int(value)

    @field_validator("telegram_proxy", mode="before")
    @classmethod
    def parse_telegram_proxy(cls, value: Any) -> str | None:
        if value in (None, ""):
            return None

        proxy = str(value).strip()
        if not proxy:
            return None
        if "://" in proxy:
            return proxy

        parts = proxy.split(":", 3)
        if len(parts) == 2:
            host, port = parts
            return f"http://{host}:{port}"
        if len(parts) == 4:
            host, port, username, password = parts
            return (
                f"http://{quote(username, safe='')}:{quote(password, safe='')}"
                f"@{host}:{port}"
            )

        raise ValueError(
            "TELEGRAM_PROXY must be a full proxy URL or use host:port[:username:password] format"
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
