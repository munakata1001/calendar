import React, { useState, useEffect } from 'react';
import wilnasImage from '../assets/wilnas.png';

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

export default BookingDrawer;