import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Masonry from "react-masonry-css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCar, FaUserAlt } from "react-icons/fa";
import styles from "../styles/FacilityDetail.module.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function FacilityDetail() {
    const { id } = useParams();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    // const API_BASE_URL = "http://127.0.0.1:8000/api";
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllImages, setShowAllImages] = useState(false);

    // モバイル用：チェックイン・チェックアウトに当日を初期設定
    const [dateRange, setDateRange] = useState([new Date(), new Date()]);
    const [guests, setGuests] = useState(1);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [pricesData, setPricesData] = useState(null);

    // 最終選択可能日
    const [lastSelectableDate, setLastSelectableDate] = useState(null);

    // 画面サイズ関連（今回は常にモバイル想定）
    const [isMobile, setIsMobile] = useState(true);

    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const [selectingDate, setSelectingDate] = useState("checkin"); // "checkin" or "checkout"
    const [isCalendarLoading, setIsCalendarLoading] = useState(true);
    const [reservationValid, setReservationValid] = useState(false);

    // 料金計算用の状態を追加
    const [totalPrice, setTotalPrice] = useState(0);

    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 施設データ取得
    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/facilities/${id}/?lang=${i18n.language}`);
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                const data = await res.json();
                console.log('facility data', data);
                setFacility(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchFacility();
    }, [id, i18n.language]);

    // 空室情報と価格情報の取得
    useEffect(() => {
        const fetchAvailability = async () => {
            setIsCalendarLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/facilities/${id}/availability/`);
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                const results = await res.json();
                console.log('availability_data', results);

                // データを availability と prices に分離
                const availability = {};
                const prices = {};
                
                Object.entries(results).forEach(([date, data]) => {
                    availability[date] = data.available;
                    prices[date] = data.price;
                });

                setAvailabilityData(availability);
                setPricesData(prices);
            } catch (err) {
                console.error(err);
            } finally {
                setIsCalendarLoading(false);
            }
        };
        fetchAvailability();
    }, [id]);

    // フロントエンドでの料金計算
    const calculatePrice = () => {
        if (!dateRange[0] || !dateRange[1] || !guests || !facility || !pricesData) return;

        let total = 0;
        const currentDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);

        while (currentDate < endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            let dailyPrice = pricesData[dateStr] || facility.price_per_night;
            
            // 追加人数料金の計算（基本人数を超える場合）
            if (guests > facility.base_guests) {
                const extraGuests = guests - facility.base_guests;
                dailyPrice += extraGuests * facility.extra_guest_price;
            }
            
            total += dailyPrice;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setTotalPrice(total);
    };

    // 日付または人数が変更されたときに料金を再計算
    useEffect(() => {
        if (dateRange[0] && dateRange[1] && guests && facility) {
            calculatePrice();
        } else {
            setTotalPrice(0);
        }
    }, [dateRange, guests, facility]);

    // カレンダー外クリックでモーダルを閉じる
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showCalendarModal && !e.target.closest(".calendarModal")) {
                setShowCalendarModal(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showCalendarModal]);

    // 日付入力クリック時
    const handleDateInputClick = (type, e) => {
        const rect = e.target.getBoundingClientRect();
        setCalendarPosition({ top: rect.top - 320, left: rect.left });
        setSelectingDate(type);
        setShowCalendarModal(true);
    };

    // モバイル用：日付選択時
    const handleDateChangeMobile = (date) => {
        let newRange;
        if (selectingDate === "checkin") {
            newRange = [date, dateRange[1] && date > dateRange[1] ? date : dateRange[1]];
            setDateRange(newRange);
            setSelectingDate("checkout");
        } else {
            if (date < dateRange[0]) {
                alert("チェックアウト日はチェックイン日より後の日付を選択してください");
                return;
            }
            newRange = [dateRange[0], date];
            setDateRange(newRange);
            setShowCalendarModal(false);
            checkReservationValidity(newRange);
        }
    };

    // 予約可否チェック
    const checkReservationValidity = (range) => {
        if (!range[0] || !range[1] || !availabilityData) {
            setReservationValid(false);
            return;
        }
        const checkinDateStr = range[0].toISOString().split("T")[0];
        const nextDayDate = new Date(range[0].getTime() + 24 * 60 * 60 * 1000);
        const nextDayStr = nextDayDate.toISOString().split("T")[0];
        if (availabilityData[nextDayStr] === 0) {
            setReservationValid(false);
            return;
        }
        setReservationValid(true);
    };

    // 予約実行
    const handleReservation = () => {
        if (!dateRange[0] || !dateRange[1] || !guests) {
            alert("日程と人数を選択してください");
            return;
        }
        if (!reservationValid) {
            alert("選択された期間に予約不可の日があります。別の日程をお選びください。");
            return;
        }

        // 日ごとの料金リストを作成
        const priceList = [];
        const currentDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);

        while (currentDate < endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            let dailyPrice = pricesData[dateStr] || facility.price_per_night;
            
            // 追加人数料金の計算（基本人数を超える場合）
            if (guests > facility.base_guests) {
                const extraGuests = guests - facility.base_guests;
                dailyPrice += extraGuests * facility.extra_guest_price;
            }
            
            priceList.push(dailyPrice);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // 予約詳細データを作成
        const reservationData = {
            facilityId: facility.id,
            facilityName: facility.name,
            checkInDate: formatDateToYYYYMMDD(dateRange[0]),
            checkOutDate: formatDateToYYYYMMDD(dateRange[1]),
            guests: guests,
            totalPrice: totalPrice,
            priceList: priceList, // 配列として渡す
            basePrice: facility.price_per_night,
            baseGuests: facility.base_guests,
            extraGuestPrice: facility.extra_guest_price,
            extraGuestCharge: guests > facility.base_guests ? 
                (guests - facility.base_guests) * facility.extra_guest_price : 0,
            capacity: facility.capacity,
            imageUrl: facility.images[0]?.image,
            nights: getNights(),
        };

        console.log('facility', reservationData)
        // 検索データを作成
        const searchData = {
            checkIn: dateRange[0].toISOString().split("T")[0],
            checkOut: dateRange[1].toISOString().split("T")[0],
            guests: guests
        };

        // セッションストレージを更新
        sessionStorage.setItem('reservationDetails', JSON.stringify(reservationData));
        sessionStorage.setItem('searchData', JSON.stringify(searchData));

        // 予約確認ページに遷移
        navigate("/reservationDetails", { state: reservationData });
    };

    // 宿泊日数
    const getNights = () => {
        if (!dateRange[0] || !dateRange[1]) return 0;
        return Math.floor((dateRange[1] - dateRange[0]) / (1000 * 60 * 60 * 24));
    };

    // カレンダーの選択可否
    const tileDisabled = ({ date, view }) => {
        if (view !== "month") return false;

        // 今日より前は選択不可
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date <= today) return true;

        const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];

        // チェックイン日選択時
        if (selectingDate === "checkin") {
            return !(availabilityData && availabilityData[dateStr] === 1);
        }

        // チェックアウト日選択時
        else {
            // チェックイン日より前は選択不可
            if (dateRange[0] && date <= dateRange[0]) return true;

            // チェックイン日翌日から最初の予約不可日までを探す
            let firstUnavailableDate = null;
            let currentDate = new Date(dateRange[0]);
            currentDate.setDate(currentDate.getDate() + 1); // チェックイン日翌日から開始

            while (!firstUnavailableDate && availabilityData) {
                const currDateStr = new Date(currentDate.getTime() - currentDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .split("T")[0];

                if (availabilityData[currDateStr] === 0) {
                    firstUnavailableDate = new Date(currentDate);
                    break;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 最初の予約不可日より後は選択不可
            if (firstUnavailableDate && date > firstUnavailableDate) {
                return true;
            }

            // チェックイン日翌日から最初の予約不可日までは選択可能（予約不可日を含む）
            return false;
        }
    };

    // カレンダーの表示内容
    const formatDay = (locale, date) => {
        const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
            .toISOString()
            .split("T")[0];
        const isInRange = dateRange[0] && dateRange[1] && date >= dateRange[0] && date <= dateRange[1];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date <= today) {
            return (
                <div className={`${styles.calendarDay} ${isInRange ? styles.inRange : ""}`}>
                    <span>{date.getDate()}</span>
                    <span className={styles.availabilityMark}>×</span>
                </div>
            );
        }
        let mark = availabilityData && availabilityData[dateStr] === 0 ? "×" : "○";
        return (
            <div className={`${styles.calendarDay} ${isInRange ? styles.inRange : ""}`}>
                <span>{date.getDate()}</span>
                <span className={styles.availabilityMark}>{mark}</span>
            </div>
        );
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!facility) return <p>No facility data found.</p>;

    const imagesToShow = showAllImages ? facility.images : facility.images.slice(0, 4);

    return (
        <>
            <Navbar />
            <div className={styles.facilityContainer}>
                <div className={styles.heroSection}>
                    {facility.images.length > 0 && (
                        <img src={facility.images[0].image} alt={facility.name} className={styles.heroImage} />
                    )}
                    <div className={styles.heroOverlay}>
                        <h1>{facility.name}</h1>
                    </div>
                </div>
                <div className={`${styles.facilityDetail} ${styles.customRowWidth}`}>
                    <div className={styles.contentWrapper}>
                        <div className={styles.leftSection}>
                            <div className={styles.facilityContent}>
                                <p>
                                    <strong>住所:</strong> {facility.location}
                                </p>
                                {facility.booking_url && (
                                    <div className={styles.bookingUrlContainer}>
                                        <a 
                                            href={facility.booking_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className={styles.bookingUrlButton}
                                        >
                                            Booking.com で予約
                                        </a>
                                    </div>
                                )}
                                <p>{facility.description}</p>

                                <div className={styles.facilityInfoGrid}>
                                    <div className={styles.infoBox}>
                                        <h4>{i18n.language === "ja" ? "無料駐車場" : "Free Parking"}</h4>
                                        <span className={styles.infoIcon}>
                                            <FaCar />×{facility.parking_spaces}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <h4>{i18n.language === "ja" ? "収容人数" : "Capacity"}</h4>
                                        <span className={styles.infoIcon}>
                                            <FaUserAlt />×{facility.capacity}
                                        </span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <h4>{i18n.language === "ja" ? "チェックイン" : "Check-in"}</h4>
                                        <span className={styles.infoValue}>15:00~</span>
                                    </div>
                                    <div className={styles.infoBox}>
                                        <h4>{i18n.language === "ja" ? "チェックアウト" : "Check-out"}</h4>
                                        <span className={styles.infoValue}>11:00</span>
                                    </div>
                                </div>
                                <div className={styles.amenitiesAndAppliances}>
                                    <div>
                                        <h3>{i18n.language === "ja" ? "アメニティ&設備" : "Amenities & Appliances"}</h3>
                                        <ul className={styles.amenitiesList}>
                                            {[...facility.amenities, ...facility.features].map((item, idx) => (
                                                <li key={idx}>{i18n.language === "ja" ? item.name_ja : item.name_en}</li>
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
                        </div>

                        {/* モバイル用予約バー */}
                        <div className={styles.mobileBookingBar}>
                            <div className={styles.mobileBookingContent}>
                                <div className={styles.mobileBookingLeft}>
                                    <div className={styles.guestSelect}>
                                        <FaUserAlt />
                                        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                                            {Array.from({length: facility.capacity}, (_, i) => i + 1).map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {i18n.language === "ja" ? "名" : "people"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.dateSelect}>
                                        <input
                                            type="text"
                                            value={
                                                dateRange[0]
                                                    ? dateRange[0].toLocaleDateString("ja-JP", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                    : i18n.language === "ja"
                                                        ? "チェックイン"
                                                        : "Check-in"
                                            }
                                            readOnly
                                            onClick={(e) => handleDateInputClick("checkin", e)}
                                        />
                                        <span className={styles.dateSeparator}>-</span>
                                        <input
                                            type="text"
                                            value={
                                                dateRange[1]
                                                    ? dateRange[1].toLocaleDateString("ja-JP", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                    })
                                                    : i18n.language === "ja"
                                                        ? "チェックアウト"
                                                        : "Check-out"
                                            }
                                            readOnly
                                            onClick={(e) => handleDateInputClick("checkout", e)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.bookingRight}>
                                    <div className={styles.priceDisplay}>
                                        <span className={styles.priceLabel}>
                                            {i18n.language === "ja" ? "合計" : "Total"}
                                        </span>
                                        <span className={styles.priceValue}>
                                            ¥{totalPrice.toLocaleString()}
                                        </span>
                                    </div>
                               </div>
                            </div>
                        </div>
                        {showCalendarModal && (
                            <div
                                className={`${styles.calendarModal} calendarModal`}
                                style={{
                                    top: `${calendarPosition.top}px`,
                                    left: `${calendarPosition.left}px`,
                                }}
                            >
                                {isCalendarLoading ? (
                                    <div className={styles.calendarLoading}>
                                        <div className={styles.loadingSpinner}></div>
                                        <p>
                                            {i18n.language === "ja" ? "空室情報を読み込み中..." : "Loading availability..."}
                                        </p>
                                    </div>
                                ) : (
                                    <Calendar
                                        onChange={handleDateChangeMobile}
                                        value={selectingDate === "checkin" ? dateRange[0] : dateRange[1]}
                                        minDate={selectingDate === "checkout" ? dateRange[0] : new Date()}
                                        formatDay={formatDay}
                                        locale={i18n.language === "ja" ? "ja-JP" : "en-US"}
                                        tileDisabled={tileDisabled}
                                    />
                                    
                                )}
                            </div>
                        )}
                    </div>
                    <Masonry
                        breakpointCols={{ default: 3, 700: 2, 500: 1 }}
                        className={styles["my-masonry-grid"]}
                        columnClassName={styles["my-masonry-grid_column"]}
                    >
                        {imagesToShow.slice(1).map((image, idx) => (
                            <img
                                key={idx}
                                src={image.image}
                                alt={`${facility.name_ja} image ${idx + 2}`}
                                className={styles.image}
                            />
                        ))}
                    </Masonry>
                    {!showAllImages && facility.images.length > 3 && (
                        <div className={styles.buttonContainer}>
                            <button onClick={() => setShowAllImages(true)} className={styles.showMoreButton}>
                                {i18n.language === "ja" ? "もっと見る" : "Show More"}
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.footerSpacer}></div>
                <Footer />
            </div>
        </>
    );
}

export default FacilityDetail;
