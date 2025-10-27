from datetime import date, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import Config
from database import bookings
from services import generate_time_slots
from routers import booking # booking.pyのルーターをインポート

# FastAPIアプリケーションの初期化
app = FastAPI(title="グランブルーファンタジーカフェ予約システム")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ユーティリティ関数
# def generate_time_slots(): ...
# def validate_email(email: str) -> bool: ...
# def find_slot_by_id(date_str: str, slot_id: int): ...
# def update_slot_status(slot): ...
# 上記4つの関数のブロック全体をここから削除

# アプリケーション起動時の初期化
@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時に予約スロットを生成する"""
    today = date.today()
    
    for i in range(Config.DAYS_TO_GENERATE):
        current_date = today + timedelta(days=i)
        date_str = current_date.strftime("%Y-%m-%d")
        
        slots = generate_time_slots()
        
        bookings[date_str] = {
            "slots": slots,
            "limit": Config.MAX_PEOPLE_PER_SLOT * Config.SLOTS_PER_DAY,
            "reserved": 0
        }

# bookingルーターをアプリケーションに登録
app.include_router(booking.router)

# ヘルスチェックエンドポイント
@app.get("/health")
def health_check():
    """ヘルスチェック"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

