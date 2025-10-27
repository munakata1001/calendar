// 日付関連のユーティリティ関数

/**
 * 日付をISO形式（YYYY-MM-DD）にフォーマットする
 * @param {Date} date - フォーマットする日付
 * @returns {string} ISO形式の日付文字列
 */
export const formatDateISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 日付が今日かどうかを判定する
 * @param {Date} date - 判定する日付
 * @returns {boolean} 今日かどうか
 */
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * 日付が指定された月に属するかどうかを判定する
 * @param {Date} date - 判定する日付
 * @param {Date} month - 基準となる月
 * @returns {boolean} 指定された月に属するかどうか
 */
export const isCurrentMonth = (date, month) => {
  return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
};

/**
 * カレンダーグリッド用の日付配列を生成する
 * @param {Date} month - 基準となる月
 * @returns {Date[]} カレンダーグリッド用の日付配列
 */
export const generateCalendarDays = (month) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }
  
  return calendarDays;
};

/**
 * 月を前後に移動する
 * @param {Date} currentMonth - 現在の月
 * @param {number} direction - 移動方向（-1: 前月, 1: 次月）
 * @returns {Date} 移動後の月
 */
export const moveMonth = (currentMonth, direction) => {
  const newMonth = new Date(currentMonth);
  newMonth.setMonth(newMonth.getMonth() + direction);
  return newMonth;
};

// メールアドレス関連のユーティリティ関数

/**
 * メールアドレスの有効性をチェックする
 * @param {string} email - チェックするメールアドレス
 * @returns {boolean} 有効かどうか
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 予約関連のユーティリティ関数

/**
 * 予約状況の記号を取得する
 * @param {Object} bookingInfo - 予約情報
 * @returns {string} 予約状況の記号
 */
export const getBookingStatusSymbol = (bookingInfo) => {
  if (!bookingInfo) {
    return '×';
  }

  const { reserved, limit } = bookingInfo;
  const remaining = limit - reserved;

  if (remaining <= 0) {
    return '×';
  }
  if (remaining <= 3) {
    return '△';
  }
  return '○';
};

/**
 * 予約状況の色を取得する
 * @param {Object} bookingInfo - 予約情報
 * @returns {string} 予約状況の色
 */
export const getBookingStatusColor = (bookingInfo) => {
  if (!bookingInfo) {
    return '#6c757d';
  }

  const { reserved, limit } = bookingInfo;
  const remaining = limit - reserved;

  if (remaining <= 0) {
    return '#dc3545';
  }
  if (remaining <= 3) {
    return '#ffc107';
  }
  return '#28a745';
};

/**
 * 予約が可能かどうかを判定する
 * @param {Object} bookingInfo - 予約情報
 * @returns {boolean} 予約可能かどうか
 */
export const isBookable = (bookingInfo) => {
  if (!bookingInfo) {
    return false;
  }
  return bookingInfo.reserved < bookingInfo.limit;
};

// 文字列関連のユーティリティ関数

/**
 * 数値を3桁区切りの文字列にフォーマットする
 * @param {number} number - フォーマットする数値
 * @returns {string} 3桁区切りの文字列
 */
export const formatNumber = (number) => {
  return number?.toLocaleString() || '0';
};

/**
 * 文字列をトリムして空でないかチェックする
 * @param {string} str - チェックする文字列
 * @returns {boolean} 空でないかどうか
 */
export const isNotEmpty = (str) => {
  return str && str.trim().length > 0;
};
