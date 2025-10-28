import React from 'react';

const Legend = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap: '20px', 
      marginBottom: '20px',
      padding: '10px',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#28a745', fontSize: '20px', fontWeight: 'bold' }}>○</span>
        <span>空きあり</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#ffc107', fontSize: '20px', fontWeight: 'bold' }}>△</span>
        <span>残りわずか</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ color: '#dc3545', fontSize: '20px', fontWeight: 'bold' }}>×</span>
        <span>空きなし</span>
      </div>
    </div>
  );
};

export default Legend;