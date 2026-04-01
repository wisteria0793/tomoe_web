import React from 'react';
import styles from '../styles/Footer.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
    const { t } = useTranslation();

      

    return (
        <footer className={styles.footer}>
            <p>{t('footer.copyright')}</p>
            <Link to={t('footer.privacyLink')} className={styles.privacyPolicy}>{t('footer.privacy')}</Link>
        </footer>
    );
}

export default Footer; 
