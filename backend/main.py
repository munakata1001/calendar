from datetime import date, timedelta, datetime
try:
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel, Field, EmailStr
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:
    # 開発環境で仮想環境が読み込まれていない場合の警告を抑制
    pass
import re

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

# 定数定義
class Config:
    # 予約設定
    MAX_PEOPLE_PER_SLOT = 4
    SLOTS_PER_DAY = 8
    SLOT_DURATION_MINUTES = 75
    PRICE_PER_PERSON = 5000
    DAYS_TO_GENERATE = 90
    
    # 時間設定
    START_HOUR = 9
    END_HOUR = 19
    
    # スタッフ名
    STAFF_NAMES = ["グラン", "ジータ", "ルリア", "ラカム", "オイゲン", "ビィ", "ノア"]

# データモデル
class Booking(BaseModel):
    date: str
    slotId: int = None
    name: str = None
    email: EmailStr = None
    phone: str = None
    people: int = Field(default=1, ge=1, le=4)

class UserEmail(BaseModel):
    email: EmailStr

# グローバル変数
bookings = {}
user_bookings = {}

# ユーティリティ関数
def generate_time_slots():
    """時間スロットを生成する"""
    slots = []
    current_time = datetime.strptime(f"{Config.START_HOUR:02d}:00", "%H:%M")
    end_time = datetime.strptime(f"{Config.END_HOUR:02d}:00", "%H:%M")
    
    slot_id = 1
    while current_time < end_time:
        start_str = current_time.strftime("%H:%M")
        
        # 時間を正しく進める（75分 = 1時間15分）
        current_time = current_time + timedelta(minutes=Config.SLOT_DURATION_MINUTES)
        end_str = current_time.strftime("%H:%M")
        
        # スタッフ名を循環的に割り当て
        staff_name = Config.STAFF_NAMES[(slot_id - 1) % len(Config.STAFF_NAMES)]
        
        slots.append({
            "id": slot_id,
            "start": start_str,
            "end": end_str,
            "resourceName": staff_name,
            "status": "available",
            "remaining": Config.MAX_PEOPLE_PER_SLOT,
            "maxCapacity": Config.MAX_PEOPLE_PER_SLOT,
            "price": Config.PRICE_PER_PERSON
        })
        slot_id += 1
    
    return slots

def validate_email(email: str) -> bool:
    """メールアドレスの形式を検証する"""
    if not email:
        return False
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return bool(re.match(email_pattern, email))

def find_slot_by_id(date_str: str, slot_id: int):
    """指定された日付とスロットIDでスロットを検索する"""
    if date_str not in bookings:
        return None
    
    for slot in bookings[date_str]["slots"]:
        if slot["id"] == slot_id:
            return slot
    return None

def update_slot_status(slot):
    """スロットのステータスを更新する"""
    if slot["remaining"] == 0:
        slot["status"] = "full"
    else:
        slot["status"] = "available"

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

# APIエンドポイント
@app.get("/bookings")
def get_bookings():
    """全予約データを取得する"""
    return bookings

@app.post("/book")
def book_date(booking: Booking):
    """予約を作成する"""
    date_str = booking.date
    slot_id = booking.slotId
    email = booking.email
    people = booking.people or 1
    
    # メールアドレスの検証
    if not validate_email(email):
        raise HTTPException(status_code=400, detail="有効なメールアドレスを入力してください")
    
    # 日付の存在確認
    if date_str not in bookings:
        raise HTTPException(status_code=404, detail="指定された日付の予約枠が見つかりません")
    
    # スロットの検索
    slot = find_slot_by_id(date_str, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="指定されたスロットが見つかりません")
    
    # 予約可能かチェック
    if slot["remaining"] < people:
        raise HTTPException(status_code=400, detail="このスロットは満席です")
    
    # 予約処理
    slot["remaining"] -= people
    bookings[date_str]["reserved"] += people
    update_slot_status(slot)
    
    # ユーザー予約履歴に追加
    if email:
        if email not in user_bookings:
            user_bookings[email] = []
        
        booking_record = {
            "id": f"{email}_{date_str}_{slot_id}_{len(user_bookings[email])}",
            "date": date_str,
            "time": f"{slot['start']}-{slot['end']}",
            "resource": slot["resourceName"],
            "status": "confirmed",
            "price": slot["price"],
            "createdAt": datetime.now().strftime('%Y-%m-%d %H:%M'),
            "slotId": slot_id,
            "name": booking.name,
            "phone": booking.phone,
            "people": people
        }
        user_bookings[email].append(booking_record)
        print(f"予約履歴に追加: {email} -> {booking_record}")
    
    return {"message": "予約が完了しました", "data": bookings[date_str]}

@app.post("/cancel")
def cancel_booking(booking: Booking):
    """予約をキャンセルする"""
    date_str = booking.date
    slot_id = booking.slotId
    email = booking.email
    people = booking.people or None
    
    # 日付の存在確認
    if date_str not in bookings:
        raise HTTPException(status_code=404, detail="指定された日付の予約枠が見つかりません")
    
    # スロットの検索
    slot = find_slot_by_id(date_str, slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail="指定されたスロットが見つかりません")
    
    # 復元人数の決定
    restore_people = 1
    if people is not None:
        restore_people = max(1, min(4, int(people)))
    else:
        if email and email in user_bookings:
            for user_booking in reversed(user_bookings[email]):
                if (
                    user_booking["date"] == date_str and
                    user_booking["slotId"] == slot_id and
                    user_booking["status"] == "confirmed"
                ):
                    restore_people = int(user_booking.get("people", 1))
                    break

    # キャンセル処理
    max_per_slot = slot.get("maxCapacity", Config.MAX_PEOPLE_PER_SLOT)
    if slot["remaining"] < max_per_slot:
        print(f"キャンセル前: 残り枠={slot['remaining']}, 予約済み={bookings[date_str]['reserved']}, 復元人数={restore_people}")
        
        old_remaining = slot["remaining"]
        slot["remaining"] = min(max_per_slot, slot["remaining"] + restore_people)
        old_reserved = bookings[date_str]["reserved"]
        bookings[date_str]["reserved"] = max(0, bookings[date_str]["reserved"] - restore_people)
        
        print(f"キャンセル後: 残り枠={slot['remaining']} (+{slot['remaining'] - old_remaining}), 予約済み={bookings[date_str]['reserved']} (-{old_reserved - bookings[date_str]['reserved']})")
        
        update_slot_status(slot)
        
        # ユーザー予約履歴を更新
        if email and email in user_bookings:
            for user_booking in user_bookings[email]:
                if (user_booking["date"] == date_str and 
                    user_booking["slotId"] == slot_id and 
                    user_booking["status"] == "confirmed"):
                    user_booking["status"] = "cancelled"
                    user_booking["cancelledAt"] = datetime.now().strftime('%Y-%m-%d %H:%M')
                    user_booking["people"] = int(user_booking.get("people", restore_people))
                    print(f"予約キャンセル: {email} -> {user_booking}")
                    break
        
        return {"message": "予約をキャンセルしました", "data": bookings[date_str]}
    else:
        raise HTTPException(status_code=400, detail="このスロットに予約はありません")

@app.post("/delete-my-bookings")
def delete_my_bookings(user_email: UserEmail):
    """ユーザーの予約履歴をすべて削除する"""
    email = user_email.email
    
    if email in user_bookings:
        print(f"予約履歴削除リクエスト: {email}")
        del user_bookings[email]
        print(f"予約履歴を削除しました: {email}")
        return {"message": "予約履歴が正常に削除されました"}
    else:
        print(f"削除対象の予約履歴なし: {email}")
        return {"message": "削除対象の予約履歴が見つかりませんでした"}

@app.get("/my-bookings/{email}")
def get_my_bookings(email: str):
    """ユーザーの予約履歴を取得する"""
    print(f"予約履歴取得リクエスト: {email}")
    
    if email in user_bookings:
        print(f"予約履歴を返す: {user_bookings[email]}")
        return user_bookings[email]
    else:
        print(f"予約履歴なし: {email}")
        return []

# ヘルスチェックエンドポイント
@app.get("/health")
def health_check():
    """ヘルスチェック"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

