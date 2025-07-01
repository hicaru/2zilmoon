'use client';

import { useStore } from 'react-stores';
import styles from './Header.module.css';
import { ZilPayConnect } from '../ZilPayConnect';
import { $settings, updateSettingsStore, Themes } from '../../store/settings';

const Header = () => {
  const settings = useStore($settings);

  const toggleTheme = () => {
    const newTheme = settings.theme === Themes.Light ? Themes.Dark : Themes.Light;
    updateSettingsStore({ theme: newTheme });
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.logo}>2zilmoon</h1>
        <div className={styles.controls}>
          <button 
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {settings.theme === Themes.Light ? '🌙' : '☀️'}
          </button>
          <ZilPayConnect />
        </div>
      </div>
    </header>
  );
};

export default Header;

