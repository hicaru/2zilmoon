'use client';

import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.switcher}>
      <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'}>
        EN
      </button>
      <button onClick={() => changeLanguage('ru')} disabled={i18n.language === 'ru'}>
        RU
      </button>
    </div>
  );
};

export default LanguageSwitcher;
