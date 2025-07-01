import React from 'react';

interface AccountCardProps {
  wallet: any; // Replace 'any' with your actual wallet type
}

export const AccountCard: React.FC<AccountCardProps> = ({ wallet }) => {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
      <p>Address: {wallet?.bech32}</p>
      <p>Balance: ...</p>
    </div>
  );
};
