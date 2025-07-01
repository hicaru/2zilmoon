'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from './store/wallet';
import Header from './components/Header';
import StakingNode from './components/StakingNode';
import { SkeletonCard, SkeletonSummary } from './components/ui/Skeleton';
import styles from './page.module.css';
import { ZilliqaStakeChecker, StakedNodesSummary } from './lib/zilliqa-stake-checker-client';
import { formatQaWithUnit } from './lib/formatters';
import { zilPay } from './lib/zilpay';
import { updateTransactions } from './store/transactions';

const StakingPage = () => {
  const { wallet } = useWallet();
  const [manualWalletAddress, setManualWalletAddress] = useState<string>('');
  const [stakingSummary, setStakingSummary] = useState<StakedNodesSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [claimingNodes, setClaimingNodes] = useState<Set<string>>(new Set());
  const currentAddressRef = useRef<string>('');
  const stakingContractAddress = '0xa7C67D49C82c7dc1B73D231640B2e4d0661D37c1';

  const fetchStakingData = useCallback(async (address: string) => {
    if (!address || address === currentAddressRef.current) {
      return;
    }

    if (currentAddressRef.current !== address) {
      setStakingSummary(null);
      setError(null);
    }

    currentAddressRef.current = address;
    setLoading(true);

    try {
      const checker = new ZilliqaStakeChecker();
      const data = await checker.getStakedNodes(address);
      
      if (currentAddressRef.current === address) {
        setStakingSummary(data);
        setError(null);
      }
    } catch (err: any) {
      if (currentAddressRef.current === address) {
        setError(err.message || 'Failed to fetch staking data.');
        setStakingSummary(null);
      }
    } finally {
      if (currentAddressRef.current === address) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (wallet?.base16) {
      fetchStakingData(wallet.base16);
      setManualWalletAddress('');
    } else {
      currentAddressRef.current = '';
      setStakingSummary(null);
      setError(null);
    }
  }, [wallet?.base16, fetchStakingData]);

  const handleClaimRewards = useCallback(async (ssnAddress: string) => {
    if (!wallet) {
      setError('Please connect your wallet to claim rewards.');
      return;
    }

    setClaimingNodes(prev => new Set(prev).add(ssnAddress));
    setError(null);

    try {
      const payload = {
        _tag: 'WithdrawStakeRewards',
        params: [
          {
            vname: 'ssnaddr',
            type: 'ByStr20',
            value: ssnAddress,
          },
        ],
      };

      const tx = await zilPay.callTransaction(
        stakingContractAddress, 
        payload, 
        undefined, 
        undefined, 
        100000
      );

      if (tx.ID) {
        updateTransactions(wallet.bech32, [
          { hash: tx.ID, confirmed: false, error: false },
        ]);
        
        if (wallet.base16) {
          setTimeout(() => fetchStakingData(wallet.base16), 2000);
        }
      }
    } catch (err: any) {
      // Обработка отмены пользователем и других ошибок
      console.error('Transaction failed or cancelled:', err);
      if (err.message && !err.message.includes('User rejected')) {
        setError(err.message || 'Failed to send transaction.');
      }
    } finally {
      // Обязательно убираем состояние загрузки
      setClaimingNodes(prev => {
        const newSet = new Set(prev);
        newSet.delete(ssnAddress);
        return newSet;
      });
    }
  }, [wallet, fetchStakingData]);

  const handleManualAddressChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setManualWalletAddress(event.target.value);
  }, []);

  const handleManualFetch = useCallback(() => {
    if (manualWalletAddress.trim()) {
      fetchStakingData(manualWalletAddress.trim());
    }
  }, [manualWalletAddress, fetchStakingData]);

  // Функция для рендера скелетной загрузки
  const renderSkeletonLoading = () => (
    <div className={`${styles.summaryContainer} animate-slide-up`}>
      <SkeletonSummary />
      <div className={styles.grid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        {!wallet && (
          <div className={`${styles.inputContainer} animate-slide-up`}>
            <input
              type="text"
              placeholder="Enter Zilliqa Address (0x...)"
              value={manualWalletAddress}
              onChange={handleManualAddressChange}
              className={styles.addressInput}
            />
            <button
              onClick={handleManualFetch}
              disabled={loading || !manualWalletAddress.trim()}
              className={styles.fetchButton}
            >
              {loading ? 'Loading...' : 'Check Stakes'}
            </button>
          </div>
        )}

        {error && <div className={`${styles.error} animate-scale-in`}>{error}</div>}

        {loading && renderSkeletonLoading()}

        {!loading && stakingSummary && (
          <div className={`${styles.summaryContainer} animate-slide-up`}>
            <h2 className={styles.summaryTitle}>Your Staking Portfolio</h2>

            <div className={styles.summaryStats}>
              <div className={`${styles.statCard} ${styles.totalStaked}`}>
                <div className={styles.statLabel}>Total Staked</div>
                <div
                  className={styles.statValue}
                  title={`${stakingSummary.totalStaked.toString()} Qa`}
                >
                  {formatQaWithUnit(stakingSummary.totalStaked)}
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.totalRewards}`}>
                <div className={styles.statLabel}>Unclaimed Rewards</div>
                <div
                  className={styles.statValue}
                  title={`${stakingSummary.totalRewards.toString()} Qa`}
                >
                  {formatQaWithUnit(stakingSummary.totalRewards)}
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.totalNodes}`}>
                <div className={styles.statLabel}>Active Nodes</div>
                <div className={styles.statValue}>{stakingSummary.totalNodes}</div>
              </div>
            </div>

            {stakingSummary.nodes.length > 0 ? (
              <div className={styles.grid}>
                {stakingSummary.nodes.map((node, index) => (
                  <div key={node.ssnAddress} style={{ animationDelay: `${index * 0.1}s` }}>
                    <StakingNode
                      node={node}
                      onClaim={handleClaimRewards}
                      onUnstake={() => console.log('Unstake from', node.ssnName)}
                      isClaimLoading={claimingNodes.has(node.ssnAddress)}
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

