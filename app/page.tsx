'use client';

import { useState, useEffect } from 'react';
import { useWallet } from './store/wallet';
import Header from './components/Header';
import StakingNode from './components/StakingNode';
import styles from './page.module.css';
import { ZilliqaStakeChecker, StakedNodesSummary } from './lib/zilliqa-stake-checker-client';
import { formatQaWithUnit, formatAddress } from './lib/formatters';

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
        <div className={`${styles.hero} animate-fade-in`}>
          <h1 className={styles.title}>2zilmoon</h1>
          <p className={styles.description}>
            Seamless Zilliqa Staking Management - Track, Claim, and Migrate Your Stakes
          </p>
        </div>

        <div className={`${styles.walletSection} ${wallet ? styles.walletConnected : ''} animate-slide-up`}>
          <h2 className={styles.walletTitle}>
            {wallet ? 'Wallet Connected' : 'Connect Your Wallet'}
          </h2>
          
          {wallet ? (
            <div className={styles.connectedInfo}>
              <span>✅ Connected to:</span>
              <span className={styles.connectedAddress}>
                {formatAddress(wallet.bech32, 10, 8)}
              </span>
            </div>
          ) : (
            <div className={styles.inputContainer}>
              <input
                type="text"
                placeholder="Enter Zilliqa Address (0x...)"
                value={manualWalletAddress}
                onChange={handleManualAddressChange}
                className={styles.addressInput}
              />
              <button 
                onClick={handleManualFetch} 
                disabled={loading} 
                className={styles.fetchButton}
              >
                {loading ? 'Loading...' : 'Check Stakes'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className={`${styles.error} animate-scale-in`}>
            {error}
          </div>
        )}

        {loading && (
          <div className={`${styles.loading} animate-fade-in`}>
            <div className={styles.loadingSpinner}></div>
            <p>Fetching your staking data...</p>
          </div>
        )}

        {stakingSummary && (
          <div className={`${styles.summaryContainer} animate-slide-up`}>
            <h2 className={styles.summaryTitle}>Your Staking Portfolio</h2>
            
            <div className={styles.summaryStats}>
              <div className={`${styles.statCard} ${styles.totalStaked}`}>
                <div className={styles.statLabel}>Total Staked</div>
                <div className={styles.statValue} title={`${stakingSummary.totalStaked.toString()} Qa`}>
                  {formatQaWithUnit(stakingSummary.totalStaked)}
                </div>
              </div>
              
              <div className={`${styles.statCard} ${styles.totalRewards}`}>
                <div className={styles.statLabel}>Unclaimed Rewards</div>
                <div className={styles.statValue} title={`${stakingSummary.totalRewards.toString()} Qa`}>
                  {formatQaWithUnit(stakingSummary.totalRewards)}
                </div>
              </div>
              
              <div className={`${styles.statCard} ${styles.totalNodes}`}>
                <div className={styles.statLabel}>Active Nodes</div>
                <div className={styles.statValue}>
                  {stakingSummary.totalNodes}
                </div>
              </div>
            </div>

            {stakingSummary.nodes.length > 0 ? (
              <div className={styles.grid}>
                {stakingSummary.nodes.map((node, index) => (
                  <div key={node.ssnAddress} style={{ animationDelay: `${index * 0.1}s` }}>
                    <StakingNode 
                      node={node} 
                      onClaim={() => console.log('Claim rewards for', node.ssnName)}
                      onUnstake={() => console.log('Unstake from', node.ssnName)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${styles.noStakes} animate-scale-in`}>
                <p>No active stakes found for this address.</p>
                <p>Start staking to see your portfolio here!</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StakingPage;

