'use client';

import { useTranslation } from 'react-i18next';
import styles from './StakingNode.module.css';

interface StakingNodeProps {
  name: string;
  stakedAmount: number;
  rewards: number;
}

const StakingNode: React.FC<StakingNodeProps> = ({ name, stakedAmount, rewards }) => {
  const { t } = useTranslation();
  const hasRewards = rewards > 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.nodeName}>{name}</h3>
      <div className={styles.info}>
        <p>{t('staked_amount')}: <span className={styles.amount}>{stakedAmount.toLocaleString()}</span></p>
        <p>{t('rewards')}: <span className={styles.rewards}>{rewards.toLocaleString()}</span></p>
      </div>
      {hasRewards ? (
        <button className={`${styles.button} ${styles.claimButton}`}>{t('claim')}</button>
      ) : (
        <button className={`${styles.button} ${styles.unstakeButton}`}>{t('unstake')}</button>
      )}
    </div>
  );
};

export default StakingNode;
