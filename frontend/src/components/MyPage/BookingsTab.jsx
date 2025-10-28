import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'confirmed': return '#28a745';
    case 'completed': return '#6c757d';
    case 'cancelled': return '#dc3545';
    default: return '#6c757d';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'confirmed': return '確定';
    case 'completed': return '完了';
    case 'cancelled': return 'キャンセル済み';
    default: return '不明';
  }
};

const BookingsTab = ({ bookingHistory, loading, lastUpdated, fetchBookingHistory, handleCancelBooking }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#333' }}>
            予約履歴
          </h3>
          {bookingHistory.length > 0 && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              総予約数: {bookingHistory.length}件
              {bookingHistory.filter(b => b.people > 1).length > 0 && (
                <span style={{ color: '#007bff', marginLeft: 8 }}>
                  （複数人予約: {bookingHistory.filter(b => b.people > 1).length}件）
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={fetchBookingHistory}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: loading ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>
      
      {lastUpdated && (
        <div style={{ 
          fontSize: 12, 
          color: '#666', 
          marginBottom: 16,
          textAlign: 'right'
        }}>
          最終更新: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          予約履歴を読み込み中...
        </div>
      ) : bookingHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          予約履歴がありません
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {bookingHistory.map(booking => (
            <div key={booking.id} style={{
              border: booking.people > 1 ? '2px solid #007bff' : '1px solid #eee',
              borderRadius: 8,
              padding: 16,
              background: booking.people > 1 ? '#f8f9ff' : '#fff',
              position: 'relative'
            }}>
              {booking.people > 1 && (
                <div style={{
                  position: 'absolute',
                  top: -8,
                  right: 12,
                  background: '#007bff',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  グループ予約
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 16, color: '#333' }}>
                    {booking.date} {booking.time}
                  </div>
                  <div style={{ color: '#666', fontSize: 14 }}>
                    {booking.resource}
                  </div>
                  {booking.people && (
                    <div style={{ 
                      color: booking.people > 1 ? '#007bff' : '#666', 
                      fontSize: 13,
                      fontWeight: booking.people > 1 ? 'bold' : 'normal'
                    }}>
                      {booking.people > 1 ? `👥 ${booking.people}人での予約` : '👤 1人での予約'}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: getStatusColor(booking.status),
                    fontWeight: 'bold',
                    fontSize: 12,
                    marginBottom: 4
                  }}>
                    {getStatusText(booking.status)}
                  </div>
                  <div style={{ fontWeight: 500, color: '#28a745' }}>
                    {booking.people && booking.people > 1 ? (
                      <div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ¥{booking.price?.toLocaleString()} × {booking.people}人
                        </div>
                        <div>
                          ¥{(booking.price * booking.people).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div>¥{booking.price?.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <small style={{ color: '#666' }}>
                    予約日: {booking.createdAt}
                  </small>
                  {booking.status === 'cancelled' && booking.cancelledAt && (
                    <small style={{ color: '#dc3545' }}>
                      キャンセル日: {booking.cancelledAt}
                    </small>
                  )}
                </div>
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancelBooking(booking)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;