'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './store/wallet';
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

  const formatNumber = (value: bigint) => {
    const str = value.toString();
    if (str.length > 12) {
      return `${str.substring(0, 6)}...${str.substring(str.length - 3)}`;
    }
    return str;
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <p className={styles.description}>Zilliqa Staking Dashboard</p>

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
              placeholder="Enter Zilliqa Wallet Address (0x...)"
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
            <h2>Staking Portfolio</h2>
            
            <div className={styles.summaryStats}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Staked</div>
                <div className={styles.statValue} title={`${stakingSummary.totalStaked.toString()} Qa`}>
                  {formatNumber(stakingSummary.totalStaked)} Qa
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Unclaimed Rewards</div>
                <div className={styles.statValue} title={`${stakingSummary.totalRewards.toString()} Qa`}>
                  {formatNumber(stakingSummary.totalRewards)} Qa
                </div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Active Nodes</div>
                <div className={styles.statValue}>
                  {stakingSummary.totalNodes}
                </div>
              </div>
            </div>

            {stakingSummary.nodes.length > 0 ? (
              <div className={styles.grid}>
                {stakingSummary.nodes.map((node) => (
                  <StakingNode key={node.ssnAddress} node={node} />
                ))}
              </div>
            ) : (
              <p className={styles.noStakes}>No active stakes found for this address.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StakingPage;

