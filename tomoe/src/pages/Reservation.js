import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import SearchField from '../components/Search';
import styles from '../styles/Reservation.module.css';
import { Button, Card, Col, Row, Container, Spinner } from 'react-bootstrap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { useTranslation } from 'react-i18next';

function Reservation() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [searchData, setSearchData] = useState({});
    const [dateRange, setDateRange] = useState([null, null]); // 日付の状態
    const [guests, setGuests] = useState({ adult: 1, child: 0, infant: 0 }); // ゲストの状態
    const [loading, setLoading] = useState(false);

    const BASE_URL = "";
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
    const IMAGE_BASE_URL = process.env.REACT_APP_IMAGE_BASE_URL || 'https://127.0.0.1:8000';

    useEffect(() => {
        const savedSearchData = sessionStorage.getItem('searchData');
        const savedResults = sessionStorage.getItem('filteredFacilities');

        if (location.state) {
            const { searchData, filteredFacilities } = location.state;
            if (searchData) {
                setSearchData(searchData);
                setDateRange([searchData.checkIn, searchData.checkOut]); // 日付を復元
                setGuests(searchData.guests); // ゲスト情報を復元
            }
            if (filteredFacilities) setFilteredFacilities(filteredFacilities);
        } else if (savedSearchData) {
            const parsedData = JSON.parse(savedSearchData);
            setSearchData(parsedData);
            setDateRange([parsedData.checkIn, parsedData.checkOut]);
            setGuests(parsedData.guests);
            setFilteredFacilities(JSON.parse(savedResults) || []);
        }
    }, [location.state]);

    const handleSearch = async (data) => {
        setSearchData(data);
        setDateRange([data.checkIn, data.checkOut]); // 日付を更新
        setGuests(data.guests); // ゲスト情報を更新
        setLoading(true);

        try {
            console.log('data', data)
            // const response = await fetch(`${BASE_URL}/api/search/`, {
            const response = await fetch(`${API_BASE_URL}/search/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const result = await response.json();
            console.log("result", result);
            setFilteredFacilities(result.results || []);

            // 古い検索データを削除して新しいデータを保存
            sessionStorage.clear(); // 古いデータをクリア
            sessionStorage.setItem('searchData', JSON.stringify(data));
            sessionStorage.setItem('filteredFacilities', JSON.stringify(result.results || []));
        } catch (error) {
            console.error('Error searching facilities:', error);
        } finally {
            setLoading(false);
        }
    };

    console.log()
    const truncateText = (text, maxLength) => {
        if (text && text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text || ''; // textがnullやundefinedの場合、空文字を返す
    };


    return (
        <>
            <Navbar />
            <div className={styles.reservationContainer}>
                <div className={styles.searchField}>
                    <SearchField
                        onSearch={handleSearch}
                        initialData={{
                            checkIn: dateRange[0],
                            checkOut: dateRange[1],
                            guests,
                        }}
                    />
                </div>
                <Container fluid className={styles.searchBottom}>
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status" variant="primary">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                            <p>{i18n.language === 'ja' ? '検索中です。お待ちください...' : 'Searching... Please wait.'}</p>
                        </div>
                    ) : (
                        <Row className={`g-4 d-flex justify-content-center ${styles['custom-row-width']}`}>
                            {filteredFacilities.length > 0 ? (
                                filteredFacilities.map((facility, idx) => {
                                    const imageUrl = facility.images && facility.images.length > 0
                                        ? `${IMAGE_BASE_URL}${facility.images[0].image}`
                                        : "https://via.placeholder.com/300";

                                    return (
                                        <Col key={idx} xs={12} sm={6} md={6} lg={4}>
                                            <Card className={styles.card}>
                                                <Card.Img
                                                    variant="top"
                                                    src={imageUrl}
                                                    alt={`${facility.name_ja}の画像`}
                                                />
                                                <Card.Body className={styles['card-body']}>
                                                    <Card.Title className={styles['card-title']}>{facility.name_ja}</Card.Title>
                                                    <p>{truncateText(facility.description_ja, 100)}</p>
                                                    {facility.total_price && (
                                                        <p className={styles['price']}>
                                                            {i18n.language === 'ja' ? '宿泊料金' : 'Accommodation Fee'}: ¥{facility.total_price.toLocaleString()} {/* 3桁区切りにフォーマット */}
                                                        </p>
                                                    )}
                                                    <div className={styles['button-container']}>
                                                        <Link to={`/facility/${facility.id}`}>
                                                            <button className={styles.btn}>{i18n.language === 'ja' ? '詳しく見る' : 'View Details'}</button>
                                                        </Link>
                                                        <Link
                                                            to="/reservationDetails"
                                                            state={{
                                                                facilityId: facility.id,
                                                                facilityName: facility.name,
                                                                checkInDate: dateRange[0],
                                                                checkOutDate: dateRange[1],
                                                                guests: guests,
                                                                totalPrice: facility.total_price,
                                                                priceList: facility.prices,
                                                                basePrice: facility.price_per_night,
                                                                baseGuests: facility.base_guests,
                                                                extraGuestPrice: facility.extra_guest_price,
                                                                extraGuestCharge: guests > facility.base_guests ? 
                                                                    (guests - facility.base_guests) * facility.extra_guest_price : 0,
                                                                capacity: facility.capacity,
                                                                imageUrl: imageUrl,
                                                            }}
                                                            onClick={() => {
                                                                const reservationDetails = {
                                                                    facilityId: facility.id,
                                                                    facilityName: facility.name,
                                                                    checkInDate: dateRange[0],
                                                                    checkOutDate: dateRange[1],
                                                                    guests: guests,
                                                                    totalPrice: facility.total_price,
                                                                    priceList: facility.prices,
                                                                    basePrice: facility.price_per_night,
                                                                    baseGuests: facility.base_guests,
                                                                    extraGuestPrice: facility.extra_guest_price,
                                                                    extraGuestCharge: guests > facility.base_guests ? 
                                                                        (guests - facility.base_guests) * facility.extra_guest_price : 0,
                                                                    capacity: facility.capacity,
                                                                    imageUrl: imageUrl,
                                                                };

                                                                const searchData = {
                                                                    checkIn: dateRange[0],
                                                                    checkOut: dateRange[1],
                                                                    guests: guests
                                                                };

                                                                sessionStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
                                                                sessionStorage.setItem('searchData', JSON.stringify(searchData));
                                                            }}
                                                        >
                                                            <button className={styles.btn}>
                                                                {i18n.language === 'ja' ? '予約する' : 'Book Now'}
                                                            </button>
                                                        </Link>
                                                    </div>
                                                </Card.Body>

                                            </Card>
                                        </Col>
                                    );
                                })
                            ) : (
                                <p className={styles['no-results']}>{i18n.language === 'ja' ? '条件に一致する施設がありません。' : 'No facilities found.'}</p>
                            )}
                        </Row>
                    )}
                </Container>

            </div>
            <div className={styles.footerSpacer} />
            <Footer />
        </>
    );
}

export default Reservation;
