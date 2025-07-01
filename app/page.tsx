'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './store/wallet';
import { zilPay } from './lib/zilpay';
import { ZilPayConnect } from './components/ZilPayConnect';
import Header from './components/Header';
import StakingNode from './components/StakingNode';
import styles from './page.module.css';
import { ZilliqaStakeChecker, StakedNodesSummary } from './lib/zilliqa-stake-checker-client';

const StakingPage = () => {
  const { wallet } = useWallet();
  const [manualWalletAddress, setManualWalletAddress] = useState<string>('');
  const [stakingSummary, setStakingSummary] = useState<StakedNodesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingData = async (address: string) => {
    if (!address) {
      setError('Please enter a wallet address or connect ZilPay.');
      setStakingSummary(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStakingSummary(null);

    try {
      const checker = new ZilliqaStakeChecker();
      const data = await checker.getStakedNodes(address);
      setStakingSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet && wallet.bech32) {
      try {
        fetchStakingData(wallet.base16);
      } catch (e: any) {
        setError(`Error converting address: ${e.message}`);
      }
    } else {
      setStakingSummary(null);
    }
  }, [wallet]);

  const handleManualAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManualWalletAddress(event.target.value);
  };

  const handleManualFetch = () => {
    fetchStakingData(manualWalletAddress);
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <p className={styles.description}>Zilliqa Staking Checker</p>

        <div className={styles.zilpayConnectContainer}>
          <ZilPayConnect />
          {wallet && wallet.bech32 && (
            <p className={styles.connectedAddress}>Connected: {wallet.bech32}</p>
          )}
        </div>

        {!wallet && (
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="Enter Zilliqa Wallet Address (e.g., 0x...)"
              value={manualWalletAddress}
              onChange={handleManualAddressChange}
              className={styles.addressInput}
            />
            <button onClick={handleManualFetch} disabled={loading} className={styles.fetchButton}>
              {loading ? 'Fetching...' : 'Get Staking Info'}
            </button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {stakingSummary && (
          <div className={styles.summaryContainer}>
            <h2>Staking Summary</h2>
            <p>Total Staked: {stakingSummary.totalStaked.toString()} Qa</p>
            <p>Total Unclaimed Rewards: {stakingSummary.totalRewards.toString()} Qa</p>
            <p>Total Staked Nodes: {stakingSummary.totalNodes}</p>

            {stakingSummary.nodes.length > 0 ? (
              <div className={styles.grid}>
                {stakingSummary.nodes.map((node) => (
                  <StakingNode key={node.ssnAddress} node={node} />
                ))}
              </div>
            ) : (
              <p>No active stakes found for this address.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StakingPage;