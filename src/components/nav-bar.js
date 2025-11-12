import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { clearAuth } from '../actions/auth';
import styles from './nav-bar.module.css';

export function NavBar(props) {
  const handleLogout = () => {
    props.dispatch(clearAuth());
  };

  return (
    <nav className={styles.navBar}>
      <div className={styles.navLinks}>
        <Link to="/learn" className={styles.navLink}>
          📚 Learn
        </Link>
        <Link to="/stats" className={styles.navLink}>
          📊 Stats
        </Link>
        <Link to="/ml-demo" className={styles.navLink}>
          🤖 ML Demo
        </Link>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>
        🚪 Logout
      </button>
    </nav>
  );
}

export default connect()(NavBar);
