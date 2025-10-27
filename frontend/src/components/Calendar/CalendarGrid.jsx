import React from 'react';
import BookingStatus from '../BookingStatus'; 
import { formatDateISO } from '../../utils/date'; // このパスが正しいか確認

const CalendarGrid = ({ currentMonth, bookings, openDrawer }) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }
  
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)', 
      gap: '2px',
      background: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {calendarDays.map((date, index) => {
        const dateString = formatDateISO(date);
        const bookingInfo = bookings[dateString];
        const isCurrentMonth = date.getMonth() === month;
        const isToday = date.toDateString() === today.toDateString();
        
        // 過去の日付かどうかを判定
        const isPastDate = date < today && !isToday;
        
        // 予約可能かどうかの判定（過去の日付は除外）
        const isBookable = !isPastDate && bookingInfo && bookingInfo.reserved < bookingInfo.limit;
        
        return (
          <div 
            key={dateString} 
            onClick={() => {
              console.log('カレンダー日付クリック:', { dateString, bookingInfo, isBookable, isPastDate });
              if (isBookable) {
                openDrawer(dateString);
              } else if (isPastDate) {
                console.log('過去の日付のため予約不可:', dateString);
                alert('過去の日付は予約できません。');
              } else {
                console.log('予約不可:', { reserved: bookingInfo?.reserved, limit: bookingInfo?.limit });
                alert('この時間帯は満席です。');
              }
            }}
            style={{
              minHeight: '80px',
              padding: '8px',
              background: isPastDate ? '#f8f9fa' : (isCurrentMonth ? '#fff' : '#f8f9fa'),
              border: isToday ? '2px solid #007bff' : '1px solid #dee2e6',
              cursor: isBookable ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              opacity: isPastDate ? 0.3 : (isCurrentMonth ? 1 : 0.5)
            }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: isToday ? 'bold' : 'normal',
              color: isPastDate ? '#ccc' : (isToday ? '#007bff' : isCurrentMonth ? '#333' : '#999'),
              marginBottom: '4px'
            }}>
              {date.getDate()}
            </div>
            <BookingStatus bookingInfo={bookingInfo} />
            {isBookable && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                fontSize: '10px',
                color: '#28a745',
                fontWeight: 'bold'
              }}>
                  ご予約可
              </div>
            )}
            {isPastDate && (
              <div style={{
                position: 'absolute',
                bottom: '4px',
                fontSize: '10px',
                color: '#ccc',
                fontWeight: 'bold'
              }}>
                過去
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;