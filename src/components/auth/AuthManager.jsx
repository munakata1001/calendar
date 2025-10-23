import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import Login from './Login';
import Logout from './Logout';

export default function AuthManager() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ fontSize: 14, color: '#666' }}>読み込み中...</div>;
  }

  return (
    <>
      {user ? (
        <Logout user={user} />
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setLoginOpen(true)}
            style={{
              padding: '6px 12px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            ログイン
          </button>
        </div>
      )}
      
      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}