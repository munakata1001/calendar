import React from 'react';
import { signOut } from 'firebase/auth'; // signOut をインポート
import { auth } from '../firebase'; // auth をインポート

const Header = ({ currentMonth, user, goToPreviousMonth, goToNextMonth, setMyPageOpen, refreshBookings }) => {
  const handleLogout = () => {
    signOut(auth);
    // ログアウト後、予約データをクリアまたは更新
    if (refreshBookings) {
      refreshBookings(); // App.jsのrefreshBookingsを呼び出す
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '24px' }}>
          {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
        </h2>
        <p style={{ margin: '5px 0 0 0', color: '#666' }}>{user.email}でログイン中</p>
      </div>
      <div>
        <button onClick={goToPreviousMonth} style={{ marginRight: '10px' }}>前月へ</button>
        <button onClick={goToNextMonth} style={{ marginRight: '10px' }}>次月へ</button>
        <button onClick={() => setMyPageOpen(true)} style={{ marginRight: '10px' }}>マイページ</button>
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    </div>
  );
};

export default Header;