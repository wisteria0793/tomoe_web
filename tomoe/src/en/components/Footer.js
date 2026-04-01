import React from 'react';
import styles from '../../styles/Footer.module.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>© 2024 Tomoe. All rights reserved.</p>
      <Link to="/privacy-policy" className={styles.privacyPolicyLink}>Privacy Policy</Link>
    </footer>
  );
}

export default Footer; 
