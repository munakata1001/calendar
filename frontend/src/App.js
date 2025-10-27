// コードを使うっていう宣言
import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {onAuthStateChanged, signOut} from 'firebase/auth';
import {auth} from './firebase';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import MyPage from './components/MyPage';
import './App.css';
import wilnasImage from './assets/wilnas.png';
import sixDragonsImage from './assets/six_dragons.jpg';

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

// 日付フォーマット
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// BookingDrawer: 担当者選択 + 予約フォーム + 完了画面
function BookingDrawer({ open, date, slots, onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: 担当者選択, 2: 情報入力, 3: 確認, 4: 完了
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', people: 1 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedSlot(null);
      setFormData({ name: '', email: '', phone: '', people: 1 });
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  // メールアドレスの有効性をチェックする関数
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedSlot) {
        setError('スタッフを選択してください');
        return;
      }
      setStep(2);
      setError('');
    } else if (step === 2) {
      if (!formData.name.trim() || !formData.email.trim()) {
        setError('名前とメールアドレスは必須です');
        return;
      }
      
      // メールアドレスの形式チェック
      if (!isValidEmail(formData.email)) {
        setError('有効なメールアドレスを入力してください（例: example@email.com）');
        return;
      }
      
      setStep(3); // 確認画面へ
      setError('');
    } else if (step === 3) {
      // 予約確定処理
      handleConfirmBooking();
    }
  };

  // 予約の最終確認→送信→結果処理
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('予約確認処理開始:', { selectedSlot, formData });
      await onSubmit(selectedSlot, formData);
      console.log('予約確認処理成功');
      setStep(4); // 完了画面へ
    } catch (error) {
      console.error('予約確認処理エラー:', error);
      const errorMessage = error.message || '予約処理に失敗しました。もう一度お試しください。';
      setError(errorMessage);
      setStep(2); // 入力画面に戻る
    } finally {
      setLoading(false);
    }
  };

  // 予約可能日時を選んで入力し、確認からの確定画面まで
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}>
        {step === 1 && (
          <>
            <h2>{date} のスタッフ選択</h2>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {slots.map(slot => (
                <div key={slot.id} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                  <label>
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      disabled={slot.status !== 'available' || slot.remaining < formData.people} // 人数選択に応じてdisabledを調整
                      onChange={() => setSelectedSlot(slot)}
                    />{' '}
                    {slot.start} - {slot.end} / {slot.resourceName} / 残り{slot.remaining}人まで予約可能 {slot.price && `¥${slot.price}`}
                  </label>
                </div>
              ))}
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button onClick={onClose} style={{ flex: 1 }}>キャンセル</button>
              <button onClick={handleNext} style={{ flex: 1, background: '#28a745', color: '#fff' }}>次へ</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>ご予約情報入力</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                  お名前 <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="山田太郎"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                  メールアドレス <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: formData.email && !isValidEmail(formData.email) ? '2px solid #dc3545' : '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
                    ⚠️ 有効なメールアドレスを入力してください
                  </div>
                )}
                {formData.email && isValidEmail(formData.email) && (
                  <div style={{ color: '#28a745', fontSize: 12, marginTop: 4 }}>
                    ✓ 有効なメールアドレスです
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                  電話番号
                </label>
                <input
                  type="tel"
                  placeholder="090-1234-5678"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                />
              </div>
              
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontWeight: 500, color: '#333' }}>人数（最大4人）</span>
                <select
                  value={formData.people}
                  onChange={e => setFormData({ ...formData, people: Number(e.target.value) })}
                  style={{
                    padding: 12,
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: 14
                  }}
                >
                  {[1,2,3,4].map(n => (
                    <option key={n} value={n}>{n}人</option>
                  ))}
                </select>
              </label>
              
              {error && (
                <div style={{ 
                  color: '#dc3545', 
                  fontSize: 14, 
                  padding: 8,
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: 4
                }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1 }}>戻る</button>
                <button 
                  onClick={handleNext} 
                  style={{ 
                    flex: 1, 
                    background: '#007bff', 
                    color: '#fff',
                    padding: 12,
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  ご確認へ
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>ご予約内容の確認</h2>
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>ご予約詳細</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div><strong>日時:</strong> {date} {selectedSlot.start}-{selectedSlot.end}</div>
                <div><strong>スタッフ:</strong> {selectedSlot.resourceName}</div>
                <div><strong>人数:</strong> {formData.people}人</div>
                <div><strong>料金:</strong> ¥{selectedSlot.price?.toLocaleString()} × {formData.people}人 = ¥{(selectedSlot.price * formData.people).toLocaleString()}</div>
              </div>
              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dee2e6' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>お客様情報</h4>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div><strong>お名前:</strong> {formData.name}</div>
                  <div><strong>メール:</strong> {formData.email}</div>
                  <div><strong>電話番号:</strong> {formData.phone || '未入力'}</div>
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={() => setStep(2)} 
                style={{ flex: 1 }}
                disabled={loading}
              >
                修正する
              </button>
              <button 
                onClick={handleNext} 
                style={{ flex: 1, background: '#28a745', color: '#fff' }}
                disabled={loading}
              >
                {loading ? '処理中...' : 'ご予約を確定する'}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>ご予約完了</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img 
                src={wilnasImage} 
                alt="予約完了キャラクター" 
                style={{ 
                  width: '80%', 
                  maxWidth: '250px', 
                  height: 'auto',
                  marginBottom: '16px'
                }} 
              />
              <h3 style={{ color: '#28a745', margin: '0 0 16px 0' }}>
                {formData.name}様のご予約が完了しました！
              </h3>
            </div>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ margin: '0 0 12px 0' }}>ご予約詳細</h4>
              <div style={{ display: 'grid', gap: '6px' }}>
                <div><strong>日時:</strong> {date} {selectedSlot.start}-{selectedSlot.end}</div>
                <div><strong>スタッフ:</strong> {selectedSlot.resourceName}</div>
                <div><strong>人数:</strong> {formData.people}人</div>
                <div><strong>合計料金:</strong> ¥{(selectedSlot.price * formData.people).toLocaleString()}</div>
              </div>
            </div>

            <div style={{ 
              background: '#d1ecf1', 
              border: '1px solid #bee5eb', 
              borderRadius: '6px', 
              padding: '12px', 
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <strong>重要:</strong> ご予約確認メールを {formData.email} に送信いたしました。<br/>
              当日はご予約時間の10分前にお越しください。
            </div>
            
            <button 
              onClick={onClose} 
              style={{ 
                width: '100%',
                padding: '12px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              マイページでご確認
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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

  const handleLogout = () => {
    signOut(auth);
  };

  // バックエンドAPIから予約データを取得して React の state に保存する処理
  const refreshBookings = async () => {
    try {
      console.log("予約データを取得中...");
      const response = await axios.get('http://127.0.0.1:8000/bookings');
      console.log("予約データ取得完了:", response.data);
      console.log("取得したデータの例:", Object.keys(response.data).slice(0, 3).map(key => ({ [key]: response.data[key] })));
      setBookings(response.data);
    } catch (error) {
      console.error("予約データの取得に失敗しました:", error);
      if (error.response) {
        console.error('エラーレスポンス:', error.response.data);
      } else if (error.request) {
        console.error('リクエストエラー:', error.request);
        console.error('バックエンドサーバーが起動していない可能性があります');
      }
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
      console.log('予約処理開始:', { date: drawerDate, slotId: slot.id, formData });
      
      const response = await axios.post('http://127.0.0.1:8000/book', {
        date: drawerDate,
        slotId: slot.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        people: formData.people
      });
      
      console.log('予約処理成功:', response.data);
      await refreshBookings();
    } catch (error) {
      console.error('予約処理に失敗しました:', error);
      if (error.response) {
        console.error('エラーレスポンス:', error.response.data);
        throw new Error(error.response.data.message || '予約処理に失敗しました');
      } else if (error.request) {
        console.error('リクエストエラー:', error.request);
        throw new Error('サーバーに接続できません。バックエンドサーバーが起動しているか確認してください。');
      } else {
        throw new Error('予約処理中にエラーが発生しました');
      }
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

      {/* 凡例 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '20px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#28a745', fontSize: '20px', fontWeight: 'bold' }}>○</span>
          <span>空きあり</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#ffc107', fontSize: '20px', fontWeight: 'bold' }}>△</span>
          <span>残りわずか</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#dc3545', fontSize: '20px', fontWeight: 'bold' }}>×</span>
          <span>空きなし</span>
        </div>
      </div>

      {/* カレンダーヘッダー */}
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

      {/* カレンダーグリッド */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '2px',
        background: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {(() => {
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
          
          return calendarDays.map((date, index) => {
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
          });
        })()}
      </div>

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