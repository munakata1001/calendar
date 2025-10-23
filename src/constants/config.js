// アプリケーションの定数
export const APP_CONFIG = {
  TITLE: 'グランブルーファンタジーコラボカフェ',
  WELCOME_MESSAGE: 'グランブルーファンタジーコラボカフェへようこそ',
  LOGIN_REQUIRED_MESSAGE: 'ご利用にはアカウント登録、またはログインが必要です。',
  EMAIL_VERIFICATION_REQUIRED: 'メールアドレスの確認が必要です',
  EMAIL_VERIFICATION_MESSAGE: 'ご登録いただいたメールアドレス 宛に確認メールを送信しました。メールに記載されたリンクをクリックして、登録を完了してください。',
  EMAIL_NOT_RECEIVED_MESSAGE: 'メールが届かない場合は、迷惑メールフォルダをご確認いただくか、下記のボタンから再送信してください。'
};

// API設定
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000',
  ENDPOINTS: {
    BOOKINGS: '/bookings',
    BOOK: '/book',
    CANCEL: '/cancel',
    MY_BOOKINGS: '/my-bookings',
    DELETE_MY_BOOKINGS: '/delete-my-bookings'
  }
};

// 予約設定
export const BOOKING_CONFIG = {
  MAX_PEOPLE: 4,
  MIN_PEOPLE: 1,
  SLOTS_PER_DAY: 8,
  SLOT_DURATION_MINUTES: 75,
  PRICE_PER_PERSON: 5000
};

// スタッフ名
export const STAFF_NAMES = {
  WILNAS: 'ウィルナス',
  WAMUDUS: 'ワムデュス',
  FEDIEL: 'フェディエル'
};

// カレンダー設定
export const CALENDAR_CONFIG = {
  DAYS_IN_WEEK: 7,
  CALENDAR_GRID_SIZE: 42,
  MONTHS_TO_GENERATE: 90
};

// 時間設定
export const TIME_CONFIG = {
  START_HOUR: 9,
  END_HOUR: 19,
  SLOT_INTERVAL_MINUTES: 75
};

// ステータス設定
export const BOOKING_STATUS = {
  AVAILABLE: 'available',
  FULL: 'full',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// ステータス表示設定
export const STATUS_DISPLAY = {
  AVAILABLE: { symbol: '○', color: '#28a745', text: '空きあり' },
  FEW_REMAINING: { symbol: '△', color: '#ffc107', text: '残りわずか' },
  FULL: { symbol: '×', color: '#dc3545', text: '空きなし' }
};

// ステータス色
export const STATUS_COLORS = {
  CONFIRMED: '#28a745',
  COMPLETED: '#6c757d',
  CANCELLED: '#dc3545'
};

// ステータステキスト
export const STATUS_TEXTS = {
  CONFIRMED: '確定',
  COMPLETED: '完了',
  CANCELLED: 'キャンセル済み',
  UNKNOWN: '不明'
};
