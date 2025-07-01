'use client';

import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>2zilmoon</h1>
      <div className={styles.controls}>
        <button className={styles.connectButton}>Connect Wallet</button>
      </div>
    </header>
  );
};

export default Header;
