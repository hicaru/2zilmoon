'use client';
import { Wallet } from './types';

declare global {
  interface Window {
    zilPay: any;
  }
}

export const zilPay = {
  connect: async (): Promise<Wallet | null> => {
    try {
      const zilPay = await getZilPay();
      const connected = await zilPay.wallet.connect();
      if (connected && zilPay.wallet.defaultAccount) {
        return zilPay.wallet.defaultAccount;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect to ZilPay:', error);
      return null;
    }
  },
  observable: (callback: (wallet: Wallet | null) => void) => {
    getZilPay().then((zilPay) => {
      if (zilPay.wallet.defaultAccount) {
        callback(zilPay.wallet.defaultAccount);
      }
      zilPay.wallet.observableAccount().subscribe((account: Wallet) => {
        callback(account);
      });
    });
  },
};

function getZilPay(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject('Window is not defined');
    }
    let k = 0;
    const i = setInterval(() => {
      if (k >= 10) {
        clearInterval(i);
        return reject(new Error(`ZilPay is not installed.`));
      }
      if (typeof window.zilPay !== `undefined`) {
        clearInterval(i);
        return resolve(window.zilPay);
      }
      k++;
    }, 100);
  });
}
