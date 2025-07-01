'use client';

import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import Header from './components/Header';
import StakingNode from './components/StakingNode';
import styles from './page.module.css';

const StakingPage = () => {
  const { t } = useTranslation();

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
        <p className={styles.description}>{t('description')}</p>
        <div className={styles.grid}>
          {nodes.map((node) => (
            <StakingNode key={node.name} {...node} />
          ))}
        </div>
      </main>
    </div>
  );
};

const Page = () => (
  <I18nextProvider i18n={i18n}>
    <StakingPage />
  </I18nextProvider>
);

export default Page;