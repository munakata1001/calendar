from pydantic import BaseModel, Field, EmailStr  # pyright: ignore[reportMissingImports]
from config import Config

class Booking(BaseModel):
    """予約リクエスト・レスポンスのためのデータモデル"""
    date: str
    slotId: int | None = None
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    people: int = Field(default=1, ge=1, le=Config.MAX_PEOPLE_PER_SLOT)

class UserEmail(BaseModel):
    """メールアドレスのみを受け取るためのデータモデル"""
    email: EmailStr