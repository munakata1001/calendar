import axios from 'axios';

// バックエンドAPIから予約データを取得する処理
export const fetchBookings = async () => {
  try {
    console.log("予約データを取得中...");
    const response = await axios.get('http://127.0.0.1:8000/bookings');
    console.log("予約データ取得完了:", response.data);
    console.log("取得したデータの例:", Object.keys(response.data).slice(0, 3).map(key => ({ [key]: response.data[key] })));
    return response.data;
  } catch (error) {
    console.error("予約データの取得に失敗しました:", error);
    if (error.response) {
      console.error('エラーレスポンス:', error.response.data);
    } else if (error.request) {
      console.error('リクエストエラー:', error.request);
      console.error('バックエンドサーバーが起動していない可能性があります');
    }
    return {};
  }
};

// 予約を送信する処理
export const submitBooking = async (date, slotId, formData) => {
  try {
    console.log('予約処理開始:', { date, slotId, formData });
    
    const response = await axios.post('http://127.0.0.1:8000/book', {
      date: date,
      slotId: slotId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      people: formData.people
    });
    
    console.log('予約処理成功:', response.data);
    return response.data;
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