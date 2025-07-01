'use client';

import { useState } from 'react';
import styles from './StakingNode.module.css';
import { NodeStakeInfo } from '../../lib/zilliqa-stake-checker-client';
import { formatQaWithUnit, formatAddress, formatCommissionRate } from '../../lib/formatters';

interface StakingNodeProps {
  node: NodeStakeInfo;
  onClaim: (ssnAddress: string) => Promise<void>;
  onUnstake: () => void;
  isClaimLoading?: boolean;
}

const StakingNode: React.FC<StakingNodeProps> = ({ 
  node, 
  onClaim, 
  onUnstake, 
  isClaimLoading = false 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const hasRewards = node.rewardsAmount > 0n;

  const handleClaimClick = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await onClaim(node.ssnAddress);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`${styles.card} animate-scale-in`}>
      <div className={styles.header}>
        <h3 className={styles.nodeName}>{node.ssnName}</h3>
        <span
          className={`${styles.statusBadge} ${
            node.status === 'Активен' ? styles.statusActive : styles.statusInactive
          }`}
        >
          {node.status}
        </span>
      </div>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Node Address</span>
          <span className={`${styles.infoValue} ${styles.address}`} title={node.ssnAddress}>
            {formatAddress(node.ssnAddress, 8, 6)}
          </span>
        </div>

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Commission Rate</span>
          <span className={`${styles.infoValue} ${styles.commission}`}>
            {formatCommissionRate(node.commissionRate)}
          </span>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Staked</div>
          <div
            className={`${styles.metricValue} ${styles.amount}`}
            title={`${node.stakeAmount.toString()} Qa`}
          >
            {formatQaWithUnit(node.stakeAmount)}
          </div>
        </div>

        <div className={styles.metric}>
          <div className={styles.metricLabel}>Rewards</div>
          <div
            className={`${styles.metricValue} ${styles.rewards}`}
            title={`${node.rewardsAmount.toString()} Qa`}
          >
            {formatQaWithUnit(node.rewardsAmount)}
          </div>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        {hasRewards ? (
          <button 
            className={`${styles.button} ${styles.claimButton} ${
              isProcessing || isClaimLoading ? styles.loading : ''
            }`} 
            onClick={handleClaimClick}
            disabled={isProcessing || isClaimLoading}
          >
            {isProcessing || isClaimLoading ? (
              <span className={styles.loadingContent}>
                <span className={styles.spinner}></span>
                Processing...
              </span>
            ) : (
              'Claim Rewards'
            )}
          </button>
        ) : (
          <button 
            className={`${styles.button} ${styles.unstakeButton}`} 
            onClick={onUnstake}
          >
            Unstake
          </button>
        )}
      </div>
    </div>
  );
};

export default StakingNode;

