// 共通スタイル
export const COMMON_STYLES = {
  // ボタンスタイル
  button: {
    primary: {
      padding: '12px',
      background: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    secondary: {
      padding: '12px',
      background: '#6c757d',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    success: {
      padding: '12px',
      background: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    danger: {
      padding: '12px',
      background: '#dc3545',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    disabled: {
      padding: '12px',
      background: '#ccc',
      color: '#666',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'not-allowed'
    }
  },

  // 入力フィールドスタイル
  input: {
    default: {
      width: '100%',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px'
    },
    error: {
      width: '100%',
      padding: '12px',
      border: '2px solid #dc3545',
      borderRadius: '6px',
      fontSize: '14px'
    }
  },

  // ラベルスタイル
  label: {
    default: {
      display: 'block',
      marginBottom: '4px',
      fontWeight: '500',
      color: '#333'
    }
  },

  // エラーメッセージスタイル
  errorMessage: {
    color: '#dc3545',
    fontSize: '14px',
    padding: '8px',
    background: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px'
  },

  // 成功メッセージスタイル
  successMessage: {
    color: '#155724',
    fontSize: '14px',
    padding: '8px',
    background: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '4px'
  },

  // カードスタイル
  card: {
    background: '#fff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #dee2e6',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },

  // モーダルスタイル
  modal: {
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    content: {
      background: '#fff',
      padding: '24px',
      borderRadius: '8px',
      width: '400px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  },

  // カレンダースタイル
  calendar: {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2px',
      background: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    header: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '2px',
      marginBottom: '20px',
      background: '#f8f9fa',
      borderRadius: '8px'
    },
    dayCell: {
      minHeight: '80px',
      padding: '8px',
      border: '1px solid #dee2e6',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    today: {
      border: '2px solid #007bff'
    },
    currentMonth: {
      background: '#fff',
      opacity: 1
    },
    otherMonth: {
      background: '#f8f9fa',
      opacity: 0.5
    }
  },

  // 凡例スタイル
  legend: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '20px',
      padding: '10px',
      background: '#f8f9fa',
      borderRadius: '8px'
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }
  }
};
