'use client';

import styles from './StakingNode.module.css';

interface StakingNodeProps {
  name: string;
  stakedAmount: number;
  rewards: number;
}

const StakingNode: React.FC<StakingNodeProps> = ({ name, stakedAmount, rewards }) => {
  const hasRewards = rewards > 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.nodeName}>{name}</h3>
      <div className={styles.info}>
        <p>Staked Amount: <span className={styles.amount}>{stakedAmount.toLocaleString()}</span></p>
        <p>Rewards: <span className={styles.rewards}>{rewards.toLocaleString()}</span></p>
      </div>
      {hasRewards ? (
        <button className={`${styles.button} ${styles.claimButton}`}>Claim</button>
      ) : (
        <button className={`${styles.button} ${styles.unstakeButton}`}>Unstake</button>
      )}
    </div>
  );
};

export default StakingNode;
