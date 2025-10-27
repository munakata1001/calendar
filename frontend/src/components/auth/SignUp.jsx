import React, { useState } from 'react';
// ★ 1. sendEmailVerification をインポート
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';

export default function SignUp({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    // バリデーション
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not initialized');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);

      // ★ 2. 確認メールを送信する処理を追加
      await sendEmailVerification(userCredential.user);
      
      // ★ 3. ユーザーへのメッセージを変更
      setMessage('確認メールを送信しました。メールボックスを確認し、記載されたリンクをクリックして認証を完了してください。');
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
    } catch (e) {
      console.error('Firebase Auth Error:', e);
      let errorMessage = '登録に失敗しました';
      
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = '有効なメールアドレスを入力してください';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'パスワードは6文字以上で入力してください';
      } else if (e.code === 'auth/operation-not-allowed') {
        errorMessage = 'Firebase Console で Authentication を有効にしてください';
      } else if (e.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Console で Authentication を有効にしてください。\n\n手順:\n1. https://console.firebase.google.com/ にアクセス\n2. プロジェクト test-calendar-ce74c を選択\n3. Authentication → 始める → Sign-in method → メール/パスワードを有効化';
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = 'ネットワークエラーです。インターネット接続を確認してください';
      } else if (e.message.includes('Firebase Auth is not initialized')) {
        errorMessage = 'Firebase設定エラーです。ページを再読み込みしてください';
      } else {
        errorMessage = `登録に失敗しました: ${e.message}`;
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
          <h2 style={{ margin: 0, color: '#333' }}>新規登録</h2>
          <button 
            onClick={() => {
              // フォームを閉じる際にメッセージとエラーをリセット
              setMessage('');
              setError('');
              onClose();
            }}
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
                minLength={6}
                style={{ 
                  width: '100%', 
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14
                }} 
                placeholder="6文字以上"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                パスワード確認
              </label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', 
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14
                }} 
                placeholder="パスワードを再入力"
              />
            </div>
            
            {/* メッセージ表示エリアをボタンの上に移動して見やすくします */}
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

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                background: loading ? '#ccc' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '登録中...' : '登録して確認メールを送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}