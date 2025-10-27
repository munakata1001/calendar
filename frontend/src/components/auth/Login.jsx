import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

export default function Login({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setMessage('ログインしました');
      setEmail('');
      setPassword('');
    } catch (e) {
      let errorMessage = 'ログインに失敗しました';
      if (e.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスのユーザーが見つかりません';
      } else if (e.code === 'auth/wrong-password') {
        errorMessage = 'パスワードが間違っています';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = '有効なメールアドレスを入力してください';
      } else if (e.code === 'auth/user-disabled') {
        errorMessage = 'このアカウントは無効化されています';
      } else if (e.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'grid', 
      placeItems: 'center', 
      zIndex: 1000 
    }}>
      <div style={{ 
        width: 400, 
        background: '#fff', 
        borderRadius: 12, 
        padding: 24, 
        boxShadow: 'rgba(0,0,0,0.2) 0 8px 32px' 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 20 
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>ログイン</h2>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              padding: 4,
              borderRadius: 4
            }}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                メールアドレス
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14
                }} 
                placeholder="example@email.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                パスワード
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14
                }} 
                placeholder="パスワード"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                background: loading ? '#ccc' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
            
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
            
            {message && (
              <div style={{ 
                color: '#155724', 
                fontSize: 14, 
                padding: 8,
                background: '#d4edda',
                border: '1px solid #c3e6cb',
                borderRadius: 4
              }}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
