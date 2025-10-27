import re
from datetime import datetime, timedelta
from typing import Dict, List, Any

from config import Config
from database import bookings

def generate_time_slots() -> List[Dict[str, Any]]:
    """1日分の予約時間スロットを生成する"""
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

def find_slot_by_id(date_str: str, slot_id: int) -> Dict[str, Any] | None:
    """指定された日付とスロットIDでスロットを検索する"""
    if date_str not in bookings:
        return None
    
    for slot in bookings[date_str]["slots"]:
        if slot["id"] == slot_id:
            return slot
    return None

def update_slot_status(slot: Dict[str, Any]):
    """スロットのステータスを更新する"""
    if slot["remaining"] == 0:
        slot["status"] = "full"
    else:
        slot["status"] = "available"