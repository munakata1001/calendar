import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase'; // パスを修正
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import ProfileTab from './ProfileTab';
import BookingsTab from './BookingsTab';
import SettingsTab from './SettingsTab'; // これを追加


export default function MyPage({ user, open, onClose, onBookingUpdate }) {
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

  // getStatusColor と getStatusText 関数をここから削除します

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
            <ProfileTab
              profileData={profileData}
              setProfileData={setProfileData}
              handleProfileUpdate={handleProfileUpdate}
              loading={loading}
            />
          )}

          {/* 予約履歴タブ */}
          {activeTab === 'bookings' && (
            <BookingsTab
              bookingHistory={bookingHistory}
              loading={loading}
              lastUpdated={lastUpdated}
              fetchBookingHistory={fetchBookingHistory}
              handleCancelBooking={handleCancelBooking}
            />
          )}

          {/* 設定タブ */}
          {activeTab === 'settings' && (
            <SettingsTab
              settingsState={settingsState}
              setSettingsState={setSettingsState}
              handleChangePassword={handleChangePassword}
              handleDeleteAccount={handleDeleteAccount}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}