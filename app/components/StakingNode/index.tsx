'use client';

import styles from './StakingNode.module.css';
import { NodeStakeInfo } from '../../lib/zilliqa-stake-checker-client';

interface StakingNodeProps {
  node: NodeStakeInfo;
}

const StakingNode: React.FC<StakingNodeProps> = ({ node }) => {
  const hasRewards = node.rewardsAmount > 0n;

  const formatNumber = (value: bigint) => {
    const str = value.toString();
    if (str.length > 15) {
      return `${str.substring(0, 8)}...${str.substring(str.length - 4)}`;
    }
    return str;
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const formatCommissionRate = (rate: bigint) => {
    const rateNumber = Number(rate) / 10000000; // Конвертируем из 10^7 в проценты
    return `${rateNumber.toFixed(2)}%`;
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.nodeName}>{node.ssnName}</h3>
      
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Address</span>
          <span className={`${styles.infoValue} ${styles.address}`} title={node.ssnAddress}>
            {formatAddress(node.ssnAddress)}
          </span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Staked Amount</span>
          <span className={`${styles.infoValue} ${styles.amount} ${node.stakeAmount.toString().length > 15 ? styles.largeNumber : ''}`} title={`${node.stakeAmount.toString()} Qa`}>
            {formatNumber(node.stakeAmount)} Qa
          </span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Rewards</span>
          <span className={`${styles.infoValue} ${styles.rewards} ${node.rewardsAmount.toString().length > 15 ? styles.largeNumber : ''}`} title={`${node.rewardsAmount.toString()} Qa`}>
            {formatNumber(node.rewardsAmount)} Qa
          </span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Commission</span>
          <span className={styles.infoValue}>
            {formatCommissionRate(node.commissionRate)}
          </span>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Status</span>
          <span className={`${styles.infoValue} ${styles.status} ${node.status === 'Активен' ? styles.statusActive : styles.statusInactive}`}>
            {node.status}
          </span>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        {hasRewards ? (
          <button className={`${styles.button} ${styles.claimButton}`}>
            Claim Rewards
          </button>
        ) : (
          <button className={`${styles.button} ${styles.unstakeButton}`}>
            Unstake
          </button>
        )}
      </div>
    </div>
  );
};

export default StakingNode;

