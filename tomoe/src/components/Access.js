import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../styles/Access.module.css';

function Access() {
    const { t } = useTranslation();

    return (
        <div className={styles.accessContainer}>
            {/* <h1 className={styles.title}>アクセス</h1> */}
            <div className="title">
                <p className="text-center fs-1">{t('access.title')}</p>
            </div>
            <div className={styles.contentWrapper}>
                <div className={styles.leftSection}>
                    <div className={styles.infoSection}>
                        <h2 className={styles.facilityName}>{t('access.facilityName')}</h2>
                        <div className={styles.addressInfo}>
                            <p className={styles.text}>〒040-0035</p>
                            <p className={styles.text}>{t('access.address')}</p>
                            <p className={styles.text}>{t('access.phone')}</p>
                            <p className={styles.text}>{t('access.email')}</p>
                        </div>
                    </div>
                    <div className={styles.transportSection}>
                        <h3 className={styles.transportTitle}>{t('access.accessMethod')}</h3>
                        <ul className={styles.transportList}>
                            <li className={styles.transportListItem}>
                                {t('access.station')} ~ {t('access.facilityName')} /&nbsp;<img src={`${process.env.PUBLIC_URL}/images/icons/walk.png`} alt="walk" className={styles.icon} />({t('access.walkTime')})
                            </li>
                            <li className={styles.transportListItem}>
                                {t('access.shinkansen')} ~ {t('access.station')} /&nbsp;<img src={`${process.env.PUBLIC_URL}/images/icons/train.png`} alt="train" className={styles.icon} />({t('access.trainTime')})
                            </li>
                            <li className={styles.transportListItem}>
                                {t('access.airport')} ~ {t('access.station')} /&nbsp;<img src={`${process.env.PUBLIC_URL}/images/icons/bus.png`} alt="bus" className={styles.icon} />({t('access.busTime')})
                            </li>

                            <li className={styles.transportListItem}>
                                {t('access.port')} ~ {t('access.facilityName')} /&nbsp;<img src={`${process.env.PUBLIC_URL}/images/icons/taxi.png`} alt="taxi" className={styles.icon} />({t('access.taxiTime')})
                            </li>

                        </ul>
                    </div>
                </div>
                <div className={styles.mapSection}>
                    <iframe
                        className={styles.map}
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2975.718514928102!2d140.73036747626523!3d41.76972637125397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5f9ef30f57056717%3A0xdf442a3228a756ff!2z44Ky44K544OI44OP44Km44K55be0LmNvbQ!5e0!3m2!1sja!2sjp!4v1738571236864!5m2!1sja!2sjp"
                        // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.890123456789!2d139.6917063153157!3d35.6894879801916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188c0a4d8f1234%3A0x1234567890abcdef!2z44CSMTYwLTAwMTIg5p2x5Lqs6YO95paw5a6_5Yy65p2x5Lqs6YO95paw5a6_!5e0!3m2!1sja!2sjp!4v1611234567890!5m2!1sja!2sjp"
                        width="600"
                        height="450"
                        allowFullScreen=""
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    );
}
<iframe src="" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
export default Access; 