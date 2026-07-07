from pydantic import BaseModel


class MeResponse(BaseModel):
    id: int
    telegram_id: int
    first_name: str
    last_name: str | None
    username: str | None
    photo_url: str | None
    is_admin: bool
    game_status: str
