import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Masonry from "react-masonry-css";
import styles from "../styles/FacilityDetail.module.css";
// import Header from '../components/Header';
import Navbar from "./components/Navbar";
import Footer from './components/Footer';

function FacilityDetail() {
    const { id } = useParams(); // URLから施設のIDを取得
    const [facility, setFacility] = useState(null); // APIから取得する施設データ
    const [loading, setLoading] = useState(true); // ローディング状態
    const [error, setError] = useState(null); // エラー状態
    const [showAllImages, setShowAllImages] = useState(false); // 画像の表示切り替え
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/facilities/${id}/`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setFacility(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacility();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!facility) return <p>No facility data found.</p>;

    // 表示する画像のリストを制御
    const imagesToShow = showAllImages ? facility.images : facility.images.slice(0, 3);

    return (
        <>
            <Navbar />

            <div className={styles.facilityContainer}>
                {/* <Header /> */}
                <div className={`${styles.facilityDetail} ${styles.customRowWidth}`}>
                    <div className={styles.facilityContent}>
                        {/* 施設名 */}
                        <h1>{facility.name_en}</h1>

                        {/* 住所表示 */}
                        <p><strong>Address:</strong> {facility.location_en}</p>

                        {facility.booking_url && (
                            <div className={styles.bookingUrlContainer}>
                                <a 
                                    href={facility.booking_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className={styles.bookingUrlButton}
                                >
                                    Book on Booking.com
                                </a>
                            </div>
                        )}

                        {/* 施設説明文 */}
                        <p>{facility.description_en}</p>


                        {/* アメニティ、家電を表示 */}
                        <div className={styles.amenitiesAndAppliances}>
                            <div>
                                <h3>Amenity</h3>
                                <ul className={styles.amenitiesList}>
                                    {[
                                        ...facility.amenities, // アメニティの配列
                                        ...facility.features, // 設備の配列
                                    ].map((item, idx) => (
                                        <li key={idx}>{item.name_en}</li>
                                    ))}
                                </ul>
                            </div>


                            <div>
                                <iframe
                                    title="Google Maps"
                                    src={facility.map_link}
                                    width="400"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {/* 画像ギャラリーを表示 */}
                    <Masonry
                        breakpointCols={{ default: 3, 700: 2, 500: 1 }}
                        className={styles["my-masonry-grid"]}
                        columnClassName={styles["my-masonry-grid_column"]}
                    >
                        {imagesToShow.map((image, idx) => (
                            <img
                                key={idx}
                                src={image.image} // バックエンドからの画像URL
                                alt={`${facility.name_ja} image ${idx + 1}`}
                                className={styles.image}
                            />
                        ))}
                    </Masonry>

                    {/* 「もっと見る」ボタンを表示 */}
                    {!showAllImages && facility.images.length > 3 && (
                        <div className={styles.buttonContainer}>
                            <button onClick={() => setShowAllImages(true)} className={styles.showMoreButton}>
                                Show more
                            </button>
                        </div>
                    )}
                </div>

            </div>
	<Footer />
        </>
    );
}

export default FacilityDetail;
