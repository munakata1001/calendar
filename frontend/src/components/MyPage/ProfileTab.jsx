import React from 'react';

const ProfileTab = ({ profileData, setProfileData, handleProfileUpdate, loading }) => {
  return (
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
  );
};

export default ProfileTab;