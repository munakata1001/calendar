import React from 'react';

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getMonthMatrix(viewDate) {
  const start = startOfMonth(viewDate);
  const end = endOfMonth(viewDate);
  const startWeekDay = start.getDay(); // 0 Sun - 6 Sat
  const daysInMonth = end.getDate();

  const cells = [];
  // Leading days from previous month to fill first week
  for (let i = 0; i < startWeekDay; i++) {
    const d = addDays(start, -(startWeekDay - i));
    cells.push({ date: d, inCurrentMonth: false });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(start);
    d.setDate(i);
    cells.push({ date: d, inCurrentMonth: true });
  }
  // Trailing days to complete 6 weeks grid (6x7 = 42)
  const total = 42;
  let after = 1;
  while (cells.length < total) {
    const d = addDays(end, after);
    cells.push({ date: d, inCurrentMonth: false });
    after += 1;
  }

  // chunk by 7
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export default function MonthCalendar({ valueISO, onSelectDate, onMonthChange }) {
  const viewDate = valueISO ? new Date(valueISO) : new Date();
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const monthLabel = `${y}年 ${m + 1}月`;

  const weeks = getMonthMatrix(viewDate);
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="month-calendar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #eee' }}>
        <button onClick={() => onMonthChange(-1)}>前月</button>
        <div style={{ fontWeight: 600 }}>{monthLabel}</div>
        <button onClick={() => onMonthChange(1)}>翌月</button>
        <button style={{ marginLeft: 'auto' }} onClick={() => onSelectDate(todayISO)}>今日</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 12px', color: '#888', fontSize: 12 }}>
        {['日','月','火','水','木','金','土'].map((wd) => (
          <div key={wd} style={{ padding: '4px 6px' }}>{wd}</div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: '0 8px 8px 8px' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {week.map((cell, di) => {
              const iso = cell.date.toISOString().slice(0, 10);
              const isToday = iso === todayISO;
              const isSelected = iso === valueISO;
              return (
                <button
                  key={iso}
                  onClick={() => onSelectDate(iso)}
                  style={{
                    border: '1px solid #f2f2f2',
                    padding: '12px 8px',
                    background: isSelected ? '#e6f4ff' : isToday ? '#f7fbff' : '#fff',
                    color: cell.inCurrentMonth ? '#222' : '#bbb',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: isSelected ? 700 : 500 }}>{cell.date.getDate()}</div>
                  {/* placeholder for badges (availability count, etc.) */}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


