'use client';

import Header from './components/Header';
import StakingNode from './components/StakingNode';
import styles from './page.module.css';

const StakingPage = () => {
  const nodes = [
    { name: 'Node Alpha', stakedAmount: 150000, rewards: 2500 },
    { name: 'Node Beta', stakedAmount: 75000, rewards: 0 },
    { name: 'Node Gamma', stakedAmount: 200000, rewards: 5000 },
    { name: 'Node Delta', stakedAmount: 120000, rewards: 0 },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <p className={styles.description}>Zilliqa Staking Migration</p>
        <div className={styles.grid}>
          {nodes.map((node) => (
            <StakingNode key={node.name} {...node} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default StakingPage;