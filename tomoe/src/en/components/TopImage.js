import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import styles from '../../styles/HomePage.module.css';

function TopImage() {
    // スライドショーの画像リスト
    const images = [
        "/images/build1/facade1.jpg", // 適切な画像パスに変更
        "/images/build1/DSC_0078.jpg",
        "/images/build1/DSC_0080.jpg"
    ];

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
                    <h1>GuestHouse Tomoe.com</h1>
                    <p>Not just a place to stay—an experience to remember.</p>
                    <div className={styles.buttons}>
                        <Link to="/english/reservation">
                            <button className={styles.primaryButton}>Booking</button>
                        </Link>
                        <Link to="/">
                            <button className={styles.secondaryButton}>Japanese</button>
                        </Link>
                    </div>
                </div>

                {/* 右側の画像（スライドショー対応） */}
                <div className={styles.imageContainer}>
                    <img
                        src={images[currentImageIndex]} // 現在の画像を表示
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
