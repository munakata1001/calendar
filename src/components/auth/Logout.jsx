import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function Logout({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signOut(auth);
      console.log('ログアウト成功');
    } catch (e) {
      setError('ログアウトに失敗しました');
      console.error('ログアウトエラー:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 14, color: '#666' }}>
        ログイン中: {user.email}
      </span>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '6px 12px',
          background: loading ? '#ccc' : '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'ログアウト中...' : 'ログアウト'}
      </button>
      {error && (
        <span style={{ color: '#dc3545', fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}
