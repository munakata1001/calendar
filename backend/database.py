from typing import Dict, List, Any
from pydantic import EmailStr

# ==============================================================================
# IN-MEMORY DATABASE
# NOTE: 本番環境ではPostgreSQLなどの永続的なデータベースに置き換えるべきです
# ==============================================================================

# 日付ごとの予約スロット情報を格納: {"YYYY-MM-DD": {"slots": [...], ...}}
bookings: Dict[str, Any] = {}
# ユーザーごとの予約履歴を格納: {"user@example.com": [{...}, ...]}
user_bookings: Dict[EmailStr, List[Dict[str, Any]]] = {}