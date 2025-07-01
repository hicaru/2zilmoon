'use client';

import styles from './StakingNode.module.css';

import { NodeStakeInfo } from '../../lib/zilliqa-stake-checker-client';

interface StakingNodeProps {
  node: NodeStakeInfo;
}

const StakingNode: React.FC<StakingNodeProps> = ({ node }) => {
  const hasRewards = node.rewardsAmount > 0n;

  return (
    <div className={styles.card}>
      <h3 className={styles.nodeName}>{node.ssnName}</h3>
      <div className={styles.info}>
        <p>Address: <span className={styles.amount}>{node.ssnAddress}</span></p>
        <p>Staked Amount: <span className={styles.amount}>{node.stakeAmount.toString()}</span></p>
        <p>Rewards: <span className={styles.rewards}>{node.rewardsAmount.toString()}</span></p>
        <p>Commission Rate: <span className={styles.amount}>{node.commissionRate.toString()}</span></p>
        <p>Status: <span className={styles.amount}>{node.status}</span></p>
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
