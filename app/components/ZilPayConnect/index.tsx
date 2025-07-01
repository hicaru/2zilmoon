'use client';
import { useEffect } from 'react';
import { useWallet } from '../../store/wallet';
import { zilPay } from '../../lib/zilpay';
import styles from './ZilPayConnect.module.css';

export const ZilPayConnect = () => {
  const { wallet, setWallet } = useWallet();

  useEffect(() => {
    zilPay.observable(setWallet);
  }, [setWallet]);

  const handleConnect = async () => {
    const connectedWallet = await zilPay.connect();
    if (connectedWallet) {
      setWallet(connectedWallet);
    }
  };

  const trimAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      {wallet ? (
        <button className={styles.connectButton}>
          {trimAddress(wallet.bech32)}
        </button>
      ) : (
        <button className={styles.connectButton} onClick={handleConnect}>
          Connect
        </button>
      )}
    </div>
  );
};
