'use client';

import { useTranslation } from 'react-i18next';
import styles from './Header.module.css';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>{t('title')}</h1>
      <div className={styles.controls}>
        <LanguageSwitcher />
        <button className={styles.connectButton}>{t('connect_wallet')}</button>
      </div>
    </header>
  );
};

export default Header;
