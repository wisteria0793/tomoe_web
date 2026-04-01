import React from 'react';
import { Link } from 'react-router-dom';

import styles from '../../styles/Navbar.module.css';
// import Navbar from './components/Navbar';

function Navbar() {
  return (
    <>

      <header className={styles.header}>
        <div className={styles.container}>
          {/* ロゴ */}
          <div className={styles.logo}>
            <Link to="/english">
              <img src={`${process.env.PUBLIC_URL}/static/tomoe_logo.png`} alt="Tomoe Logo" />
            </Link>
          </div>
          {/* Bookingボタン */}
          <div className={styles.bookingButtonContainer}>
            <Link to="/english/reservation">
              <button className={styles.bookingButton}>Booking</button>
            </Link>
	<Link to="/english/shop">
         <button className={styles.bookingButton}>SHOP</button>
        </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
