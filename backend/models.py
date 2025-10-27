from pydantic import BaseModel, Field, EmailStr
from config import Config

class Booking(BaseModel):
    """予約リクエスト・レスポンスのためのデータモデル"""
    date: str
    slotId: int = None
    name: str = None
    email: EmailStr = None
    phone: str = None
    people: int = Field(default=1, ge=1, le=Config.MAX_PEOPLE_PER_SLOT)

class UserEmail(BaseModel):
    """メールアドレスのみを受け取るためのデータモデル"""
    email: EmailStr