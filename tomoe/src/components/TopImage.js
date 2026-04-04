import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '../styles/HomePage.module.css';

function TopImage() {
    const { i18n } = useTranslation();
    const { t } = useTranslation();

    // スライドショーの画像リスト
    const images = [
        "/facade1.jpg", // 適切な画像パスに変更
        "/DSC_0078.jpg",
        "/DSC_0080.jpg"
    ];

    // 現在の言語設定をコンソールに表示
    console.log('Current language:', i18n.language);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    // 現在表示中の画像のインデックス
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [fadeIn, setFadeIn] = useState(true); // フェードイン・アウトの制御


    useEffect(() => {
        const interval = setInterval(() => {
            setFadeIn(false); // フェードアウト開始
            setTimeout(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length); // 次の画像へ
                setFadeIn(true); // フェードイン開始
            }, 500); // フェードアウトの時間に合わせる
        }, 4000); // 4秒ごとに切り替え
        return () => clearInterval(interval); // クリーンアップ
    }, [images.length]);

    return (
        <div className={styles.homepage}>
            <div className={styles.heroSection}>
                {/* 左側のテキスト */}
                <div className={styles.textContainer}>
                    <h1>{t('header.title')}</h1>
                    <p>{t('header.catchphrase')}</p>
                    <div className={styles.buttons}>
                        <Link to={i18n.language === 'ja' ? '/' : '/'}>
                            <button 
                                className={styles.secondaryButton} 
                                onClick={() => changeLanguage(i18n.language === 'ja' ? 'en' : 'ja')}
                            >
                                {i18n.language === 'ja' ? 'English' : '日本語'}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* 右側の画像（スライドショー対応） */}
                <div className={styles.imageContainer}>
                    <img
                        src={`${process.env.PUBLIC_URL}${images[currentImageIndex]}`} // 現在の画像を表示
                        alt={`Slide ${currentImageIndex + 1}`}
                        className={`${styles.backgroundImage} ${fadeIn ? styles.fadeIn : styles.fadeOut
                            }`} // フェードクラスの適用
                    />
                </div>
            </div>
        </div>
    );
}

export default TopImage;
