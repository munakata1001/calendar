import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axiosをインポート
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';

export default function MyPage({ user, open, onClose, onBookingUpdate }) { // onBookingUpdate を受け取る
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: ''
  });
  const [bookingHistory, setBookingHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [settingsState, setSettingsState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    settingsMessage: '',
    settingsError: ''
  });

  // ESCキーで閉じる
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // 予約履歴をサーバーから取得する共通関数
  const fetchBookingHistory = async () => {
    if (user?.email) {
      setLoading(true);
      try {
        console.log("予約履歴を取得中...", user.email);
        const response = await axios.get(`http://127.0.0.1:8000/my-bookings/${encodeURIComponent(user.email)}`);
        console.log("予約履歴の取得結果:", response.data);
        setBookingHistory(response.data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("予約履歴の取得に失敗しました:", error);
        console.error("エラーレスポンス:", error.response?.data);
        setBookingHistory([]); // エラー時は空にする
      } finally {
        setLoading(false);
      }
    }
  };

  // モーダルが開いた時、またはユーザー情報が変わった時に予約履歴を取得
  useEffect(() => {
    if (open && user) { // userがnullでないことを確認
      fetchBookingHistory();
    }
  }, [open, user]); // open と user の変更を監視

  // 予約履歴タブが選択された時にもデータを再取得
  useEffect(() => {
    if (activeTab === 'bookings' && open && user) {
      fetchBookingHistory();
    }
  }, [activeTab, open, user]);

  // リアルタイム更新: マイページが開いている間、定期的に予約履歴を更新
  useEffect(() => {
    let intervalId;
    
    if (open && user) {
      // 初回は即座に取得
      fetchBookingHistory();
      
      // その後は30秒ごとに自動更新
      intervalId = setInterval(() => {
        if (activeTab === 'bookings') {
          console.log("定期更新: 予約履歴を再取得中...");
          fetchBookingHistory();
        }
      }, 30000); // 30秒間隔
    }
    
    // クリーンアップ: マイページが閉じられたらタイマーをクリア
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [open, user, activeTab]);

  if (!open) return null;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('プロフィールを更新しました');
    } catch (error) {
      alert('更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // キャンセル処理をAPI連携に変更
  const handleCancelBooking = async (booking) => {
    const ok = window.confirm('この予約をキャンセルしますか？');
    if (!ok) return;
    
    setLoading(true);
    try {
      console.log("キャンセル処理開始:", booking);
      
      // バックエンドのキャンセルAPIを呼び出す
      const response = await axios.post('http://127.0.0.1:8000/cancel', {
        date: booking.date,
        slotId: booking.slotId,
        email: user?.email,  // ユーザーのメールアドレスも送信
        people: booking.people  // キャンセルする人数も送信
      });
      
      console.log("キャンセルAPI呼び出し完了:", response.data);
      
      // 即座にローカル状態を更新（楽観的更新）
      setBookingHistory(prevHistory => 
        prevHistory.map(item => 
          item.id === booking.id 
            ? { ...item, status: 'cancelled', cancelledAt: new Date().toLocaleString() }
            : item
        )
      );
      
      // 親コンポーネント（App.js）のカレンダー表示を即座に更新
      if (onBookingUpdate) {
        console.log("カレンダー表示を更新中...");
        await onBookingUpdate(); // 非同期で確実に更新
      }
      
      // バックエンドから最新データを取得して同期
      await fetchBookingHistory();

      alert('予約をキャンセルしました');
      console.log("キャンセル処理完了");
    } catch (error) {
      console.error('キャンセル処理に失敗しました:', error);
      console.error('エラーレスポンス:', error.response?.data);
      alert('キャンセル処理に失敗しました。');
      
      // エラー時はデータを再取得して表示をリセット
      await fetchBookingHistory();
    } finally {
      setLoading(false);
    }
  };

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

  // 設定: パスワード変更
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSettingsState(prev => ({ ...prev, settingsMessage: '', settingsError: '' }));

    try {
      if (!user?.email) throw new Error('ログイン情報を取得できません');
      const { currentPassword, newPassword, confirmNewPassword } = settingsState;
      if (!currentPassword || !newPassword) throw new Error('現在と新しいパスワードを入力してください');
      if (newPassword.length < 6) throw new Error('新しいパスワードは6文字以上で入力してください');
      if (newPassword !== confirmNewPassword) throw new Error('新しいパスワードが一致しません');

      setLoading(true);
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setSettingsState(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        settingsMessage: 'パスワードを変更しました',
        settingsError: ''
      }));
    } catch (err) {
      const msg = err?.code === 'auth/wrong-password' ? '現在のパスワードが正しくありません' : err?.message || '変更に失敗しました';
      setSettingsState(prev => ({ ...prev, settingsError: msg }));
    } finally {
      setLoading(false);
    }
  };

  // 設定: アカウント削除
  const handleDeleteAccount = async () => {
    setSettingsState(prev => ({ ...prev, settingsMessage: '', settingsError: '' }));
    const ok = window.confirm('本当にアカウントを削除しますか？すべての予約履歴も完全に削除され、この操作は元に戻せません。');
    if (!ok) return;

    try {
      if (!user?.email) throw new Error('ログイン情報を取得できません');
      setLoading(true);

      // ステップ1: バックエンドの予約履歴を削除
      await axios.post('http://127.0.0.1:8000/delete-my-bookings', {
        email: user.email
      });
      console.log("バックエンドの予約履歴を削除しました。");

      // ステップ2: Firebase Authenticationからユーザーを削除
      if (user) { // userが存在することを確認してから削除
        await deleteUser(user);
        console.log("Firebaseアカウントを削除しました。");
      } else {
        throw new Error('削除対象のユーザー情報が見つかりませんでした。');
      }

      alert('アカウントが正常に削除されました。');
      window.location.reload(); // ページをリロードしてログアウト状態にする

    } catch (err) {
      console.error("アカウント削除に失敗しました:", err);
      const msg = err?.code === 'auth/requires-recent-login'
        ? 'セキュリティのため、再ログインが必要です。一度ログアウトしてから再度お試しください。'
        : err?.response?.data?.message || err?.message || 'アカウントの削除に失敗しました。';

      setSettingsState(prev => ({ ...prev, settingsError: msg }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.3)', 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000 
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{ 
        width: '90%', 
        maxWidth: 800, 
        maxHeight: '90vh',
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: 'rgba(0,0,0,0.2) 0 8px 32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ヘッダー */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: 20,
          borderBottom: '1px solid #eee',
          background: '#f8f9fa'
        }}>
          <h2 style={{ margin: 0, fontSize: 20, color: '#333' }}>マイページ</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4,
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* タブナビゲーション */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #eee',
          background: '#fff'
        }}>
          {[
            { id: 'profile', label: 'プロフィール' },
            { id: 'bookings', label: '予約履歴' },
            { id: 'settings', label: '設定' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: 16,
                background: activeTab === tab.id ? '#007bff' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333' }}>
                プロフィール情報
              </h3>
              
              <form onSubmit={handleProfileUpdate}>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                      お名前
                    </label>
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: 12,
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        fontSize: 14
                      }} 
                      placeholder="山田太郎"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                      メールアドレス
                    </label>
                    <input 
                      type="email" 
                      value={profileData.email}
                      disabled
                      style={{ 
                        width: '100%', 
                        padding: 12,
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        fontSize: 14,
                        background: '#f8f9fa',
                        color: '#6c757d'
                      }} 
                    />
                    <small style={{ color: '#666', fontSize: 12 }}>
                      メールアドレスは変更できません
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                      電話番号
                    </label>
                    <input 
                      type="tel" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: 12,
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        fontSize: 14
                      }} 
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#333' }}>
                      住所
                    </label>
                    <textarea 
                      rows={3}
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      style={{ 
                        width: '100%', 
                        padding: 12,
                        border: '1px solid #ddd',
                        borderRadius: 6,
                        fontSize: 14,
                        resize: 'vertical'
                      }} 
                      placeholder="東京都渋谷区..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: 12,
                      background: loading ? '#ccc' : '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? '更新中...' : 'プロフィールを更新'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 予約履歴タブ */}
          {activeTab === 'bookings' && (
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
          )}

          {/* 設定タブ */}
          {activeTab === 'settings' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#333' }}>
                設定
              </h3>
              
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 16
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#333' }}>
                    通知設定
                  </h4>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: 14 }}>予約確認メールを受け取る</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: 14 }}>予約リマインダーメールを受け取る</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" />
                      <span style={{ fontSize: 14 }}>キャンペーン情報を受け取る</span>
                    </label>
                  </div>
                </div>

                <div style={{
                  border: '1px solid #eee',
                  borderRadius: 8,
                  padding: 16
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#333' }}>
                    アカウント
                  </h4>
                  <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: 12 }}>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>現在のパスワード</span>
                      <input
                        type="password"
                        value={settingsState.currentPassword}
                        onChange={(e) => setSettingsState(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="現在のパスワード"
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
                        required
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>新しいパスワード（6文字以上）</span>
                      <input
                        type="password"
                        value={settingsState.newPassword}
                        onChange={(e) => setSettingsState(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="新しいパスワード"
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
                        minLength={6}
                        required
                      />
                    </label>
                    <label style={{ display: 'grid', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>新しいパスワード（確認）</span>
                      <input
                        type="password"
                        value={settingsState.confirmNewPassword}
                        onChange={(e) => setSettingsState(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                        placeholder="新しいパスワード（確認）"
                        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
                        minLength={6}
                        required
                      />
                    </label>
                    {settingsState.settingsError && (
                      <div style={{ color: '#dc3545', background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 6, padding: 10, fontSize: 13 }}>
                        {settingsState.settingsError}
                      </div>
                    )}
                    {settingsState.settingsMessage && (
                      <div style={{ color: '#155724', background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 6, padding: 10, fontSize: 13 }}>
                        {settingsState.settingsMessage}
                      </div>
                    )}
                    <button type="submit" disabled={loading} style={{ padding: 12, background: loading ? '#ccc' : '#6c757d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}>
                      パスワードを変更
                    </button>
                  </form>
                </div>

                {/* 危険な操作セクション - スクロールしないと見えない位置に配置 */}
                <div style={{
                  border: '1px solid #f8d7da',
                  borderRadius: 8,
                  padding: 16,
                  background: '#fff5f5',
                  marginTop: '20px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#721c24' }}>
                    ⚠️ 危険な操作
                  </h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#721c24', lineHeight: '1.4' }}>
                    アカウントを削除すると、すべての予約履歴とデータが永久に削除されます。<br/>
                    この操作は取り消すことができません。
                  </p>
                  <button 
                    type="button" 
                    onClick={handleDeleteAccount} 
                    disabled={loading} 
                    style={{ 
                      padding: 12, 
                      background: loading ? '#ccc' : '#dc3545', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      fontSize: 14, 
                      cursor: loading ? 'not-allowed' : 'pointer',
                      width: '100%'
                    }}
                  >
                    {loading ? '処理中...' : 'アカウントを削除する'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}