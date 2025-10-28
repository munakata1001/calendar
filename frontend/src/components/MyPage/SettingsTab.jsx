import React from 'react';

const SettingsTab = ({ settingsState, setSettingsState, handleChangePassword, handleDeleteAccount, loading }) => {
  return (
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
  );
};

export default SettingsTab;