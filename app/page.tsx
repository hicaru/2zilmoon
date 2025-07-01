'use client';

import { useState } from 'react';
import Header from './components/Header';
import StakingNode from './components/StakingNode';
import styles from './page.module.css';
import { ZilliqaStakeChecker, StakedNodesSummary } from './lib/zilliqa-stake-checker-client';

const StakingPage = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [stakingSummary, setStakingSummary] = useState<StakedNodesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress(event.target.value);
  };

  const fetchStakingData = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address.');
      setStakingSummary(null);
      return;
    }

    setLoading(true);
    setError(null);
    setStakingSummary(null);

    try {
      const checker = new ZilliqaStakeChecker();
      const data = await checker.getStakedNodes(walletAddress);
      setStakingSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staking data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <p className={styles.description}>Zilliqa Staking Checker</p>

        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Enter Zilliqa Wallet Address (e.g., 0x...)"
            value={walletAddress}
            onChange={handleWalletAddressChange}
            className={styles.addressInput}
          />
          <button onClick={fetchStakingData} disabled={loading} className={styles.fetchButton}>
            {loading ? 'Fetching...' : 'Get Staking Info'}
          </button>
        </div>

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