from datetime import datetime
from fastapi import APIRouter, HTTPException  # pyright: ignore[reportMissingImports]
from models import Booking, UserEmail
from database import bookings, user_bookings
from config import Config
from services import (
    validate_email,
    find_slot_by_id,
    update_slot_status
)

router = APIRouter()

# APIエンドポイント
@router.get("/bookings")
def get_bookings():
    """全予約データを取得する"""
    return bookings

@router.post("/book")
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

@router.post("/cancel")
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

@router.post("/delete-my-bookings")
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

@router.get("/my-bookings/{email}")
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
@router.get("/health")
def health_check():
    """ヘルスチェック"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}