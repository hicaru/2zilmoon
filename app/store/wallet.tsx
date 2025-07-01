'use client';
import { Wallet } from '../lib/types';
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface WalletState {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet | null) => void;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWalletState] = useState<Wallet | null>(null);

  const setWallet = useCallback((newWallet: Wallet | null) => {
    setWalletState(prevWallet => {
      if (!newWallet && !prevWallet) return prevWallet;
      if (!newWallet || !prevWallet) return newWallet;
      if (newWallet.base16 === prevWallet.base16) return prevWallet;
      return newWallet;
    });
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

