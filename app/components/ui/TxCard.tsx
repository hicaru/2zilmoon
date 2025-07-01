import React from 'react';

interface TxCardProps {
  tx: any; // Replace 'any' with your actual transaction type
}

export const TxCard: React.FC<TxCardProps> = ({ tx }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
      <p>Hash: {tx.hash}</p>
      <p>Confirmed: {tx.confirmed ? 'Yes' : 'No'}</p>
      {tx.error && <p style={{ color: 'red' }}>Error: {tx.error}</p>}
    </div>
  );
};
