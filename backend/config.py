class Config:
    """アプリケーション全体の設定を管理するクラス"""
    # 予約設定
    MAX_PEOPLE_PER_SLOT = 4
    SLOTS_PER_DAY = 8
    SLOT_DURATION_MINUTES = 75
    PRICE_PER_PERSON = 5000
    DAYS_TO_GENERATE = 90
    
    # 時間設定
    START_HOUR = 9
    END_HOUR = 19
    
    # スタッフ名 (循環的に割り当て)
    STAFF_NAMES = ["グラン", "ジータ", "ルリア", "ラカム", "オイゲン", "ビィ", "ノア"]