import React from 'react';

// 予約状況を表示するコンポーネント（記号表示）
const BookingStatus = ({ bookingInfo }) => {
  if (!bookingInfo) {
    return <span style={{ color: '#6c757d', fontSize: '20px' }}>×</span>;
  }

  const { reserved, limit } = bookingInfo;
  const remaining = limit - reserved;

  if (remaining <= 0) {
    return <span style={{ color: '#dc3545', fontSize: '20px', fontWeight: 'bold' }}>×</span>;
  }
  if (remaining <= 3) { // 予約可能人数が4人なので、残り3人以下で「残りわずか」
    return <span style={{ color: '#ffc107', fontSize: '20px', fontWeight: 'bold' }}>△</span>;
  }
  return <span style={{ color: '#28a745', fontSize: '20px', fontWeight: 'bold' }}>○</span>;
};

export default BookingStatus;