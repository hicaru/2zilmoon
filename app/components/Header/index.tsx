'use client';

import styles from './Header.module.css';
import { ZilPayConnect } from '../ZilPayConnect';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>2zilmoon</h1>
      <div className={styles.controls}>
        <ZilPayConnect />
      </div>
    </header>
  );
};

export default Header;
