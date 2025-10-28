// コードを使うっていう宣言
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from './firebase';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import MyPage from './components/MyPage';
import './App.css';
import BookingDrawer from './components/BookingDrawer';
import BookingStatus from './components/BookingStatus';
import { formatDateISO } from './utils/date';
import sixDragonsImage from './assets/six_dragons.jpg';
import CalendarGrid from './components/Calendar/CalendarGrid';
import { fetchBookings, submitBooking } from './api/bookingAPI';
import Header from './components/Header';
import Legend from './components/Legend';
import CalendarHeader from './components/Calendar/CalendarHeader'; // これを追加

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bookings, setBookings] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState(null);
  const [drawerSlots, setDrawerSlots] = useState([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(true);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  
  // バックエンドAPIから予約データを取得して React の state に保存する処理
  const refreshBookings = async () => {
    try {
      console.log("予約データを取得中...");
      const data = await fetchBookings(); // bookingAPI から取得
      console.log("予約データ取得完了:", data);
      setBookings(data);
    } catch (error) {
      console.error("予約データの取得に失敗しました:", error);
      setBookings({});
    }
  };

  // ログイン状態（ユーザー情報）の変化を監視し、それに応じて予約データを更新する
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        refreshBookings();
      } else {
        setBookings({});
      }
    });

    return () => {
      unsubAuth();
    };
  }, []);


  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  const openDrawer = (date) => {
    console.log('予約ドロワーを開く:', date);
    const slots = bookings[date]?.slots || [];
    console.log('利用可能なスロット:', slots);
    setDrawerDate(date);
    setDrawerSlots(slots);
    setDrawerOpen(true);
  };

  const handleSubmitBooking = async (slot, formData) => {
    try {
      // submitBooking 関数を呼び出すように変更
      await submitBooking(drawerDate, slot.id, formData);
      await refreshBookings(); // 予約成功後、最新の予約情報を再度取得
    } catch (error) {
      console.error('予約処理に失敗しました:', error);
      throw error; // エラーをBookingDrawerに伝える
    }
  };

  if (authLoading) return <div>読み込み中...</div>;

  if (!user) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ padding: '50px 20px 20px 20px' }}>
          <img 
            src={sixDragonsImage} 
            alt="グランブルーファンタジー 六竜" 
            style={{ 
              width: '100%', 
              maxWidth: '600px', 
              height: 'auto',
              marginBottom: '20px',
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }} 
          />
          <h1 style={{ fontSize: '2em', marginBottom: '10px', color: '#333' }}>
            グランブルーファンタジーカフェへようこそ
          </h1>
          <p style={{ fontSize: '1.1em', color: '#555', marginBottom: '30px' }}>
            ご利用にはアカウント登録、またはログインが必要です。
          </p>
          <button onClick={() => { setSignUpOpen(false); setLoginOpen(true); }} style={{marginRight: '10px'}}>ログイン</button>
          <button onClick={() => { setLoginOpen(false); setSignUpOpen(true); }}>新規登録</button>
        </div>
        <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
        <SignUp open={signUpOpen} onClose={() => setSignUpOpen(false)} />
      </div>
    );
  }


  return (
    <div style={{ padding: 16 }}>
      <h1>グランブルーファンタジーカフェ</h1>
      
      {/* ヘッダー部分をHeaderコンポーネントに置き換え */}
      <Header
        currentMonth={currentMonth}
        user={user}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        setMyPageOpen={setMyPageOpen}
        refreshBookings={refreshBookings}
      />
   {/* 凡例 */}
   <Legend />

{/* カレンダーヘッダー */}
<CalendarHeader />

{/* カレンダーグリッド */}
<CalendarGrid
        currentMonth={currentMonth}
        bookings={bookings}
        openDrawer={openDrawer}
      />

      <BookingDrawer
        open={drawerOpen}
        date={drawerDate}
        slots={drawerSlots}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmitBooking}
      />

      <MyPage
        open={myPageOpen}
        onClose={() => setMyPageOpen(false)}
        user={user}
        onBookingUpdate={refreshBookings}
      />
    </div>
  );
}

export default App;