import React from 'react';

const CalendarHeader = () => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)', 
      gap: '2px', 
      marginBottom: '20px',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      {['日', '月', '火', '水', '木', '金', '土'].map(day => (
        <div key={day} style={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          padding: '8px',
          background: '#e9ecef',
          borderRadius: '4px'
        }}>
          {day}
        </div>
      ))}
    </div>
  );
};

export default CalendarHeader;