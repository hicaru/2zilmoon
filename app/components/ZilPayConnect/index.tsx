'use client';
import { useEffect, useState } from 'react';
import { useWallet } from '../../store/wallet';
import { zilPay } from '../../lib/zilpay';
import { formatAddress } from '../../lib/formatters';
import styles from './ZilPayConnect.module.css';

export const ZilPayConnect = () => {
  const { wallet, setWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    zilPay.observable(setWallet);
  }, [setWallet]);

  const handleConnect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      const connectedWallet = await zilPay.connect();
      if (connectedWallet) {
        setWallet(connectedWallet);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button 
      className={`${styles.connectButton} ${
        wallet ? styles.connected : connecting ? styles.connecting : ''
      }`}
      onClick={handleConnect}
      disabled={connecting}
    >
      {wallet ? (
        <>
          <span className={styles.statusDot}></span>
          {formatAddress(wallet.bech32)}
        </>
      ) : connecting ? (
        'Connecting...'
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

