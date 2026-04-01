import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/PrivacyPolicy.module.css';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
	<>
	<Navbar />
        <div className={styles.container}>
            <div className={styles.wrapper}>

                <h1>{t('privacy.title')}</h1>
                <p>{t('privacy.lastUpdated')}: 2023/10/01</p>

                <h2>1. {t('privacy.collection.title')}</h2>
                <p>{t('privacy.collection.content')}</p>

                <h2>2. {t('privacy.usage.title')}</h2>
                <p>
                    {t('privacy.usage.intro')}:
                    <ul>
                        <li>{t('privacy.usage.purpose1')}</li>
                        <li>{t('privacy.usage.purpose2')}</li>
                        <li>{t('privacy.usage.purpose3')}</li>
                    </ul>
                </p>

                <h2>3. {t('privacy.sharing.title')}</h2>
                <p>{t('privacy.sharing.content')}</p>

                <h2>4. {t('privacy.cookies.title')}</h2>
                <p>{t('privacy.cookies.content')}</p>

                <h2>5. {t('privacy.security.title')}</h2>
                <p>{t('privacy.security.content')}</p>

                <h2>6. {t('privacy.changes.title')}</h2>
                <p>{t('privacy.changes.content')}</p>

                <h2>7. {t('privacy.contact.title')}</h2>
                <p>
                    {t('privacy.contact.content')}
                    <br />
                    Email: hakodateshino0901@gmail.com
                </p>
            </div>
        </div>
	<Footer />
	</>
    );
}

export default PrivacyPolicy; 
