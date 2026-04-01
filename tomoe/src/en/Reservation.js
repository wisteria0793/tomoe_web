import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import SearchField from './components/Search';
import styles from '../styles/Reservation.module.css';
import { Button, Card, Col, Row, Container, Spinner } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function Reservation() {
    const navigate = useNavigate();
    const location = useLocation();
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [searchData, setSearchData] = useState({});
    const [dateRange, setDateRange] = useState([null, null]); // 日付の状態
    const [guests, setGuests] = useState({ adult: 1, child: 0, infant: 0 }); // ゲストの状態
    const [loading, setLoading] = useState(false);

    const BASE_URL = "http://127.0.0.1:8000";
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
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
            console.log(data)
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
                            <p>Searchibg...</p>
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
                                                    alt={`${facility.name_en}の画像`}
                                                />
                                                <Card.Body className={styles['card-body']}>
                                                    <Card.Title className={styles['card-title']}>{facility.name_en}</Card.Title>
                                                    <p>{truncateText(facility.description_en, 100)}</p>
                                                    {facility.total_price && (
                                                        <p className={styles['price']}>
                                                            Accommodation Fee: ¥{facility.total_price.toLocaleString()} {/* 3桁区切りにフォーマット */}
                                                        </p>
                                                    )}
                                                    <div className={styles['button-container']}>
                                                        <Link to={`/english/facility/${facility.id}`}>
                                                            <button className={styles.btn}>Show more</button>
                                                        </Link>
                                                        <Link
                                                            to="/english/reservationDetails"
                                                            state={{
                                                                guests,
                                                                checkInDate: dateRange[0] instanceof Date ? dateRange[0].toISOString() : null,
                                                                checkOutDate: dateRange[1] instanceof Date ? dateRange[1].toISOString() : null,
                                                                facilityId: facility.id,
                                                                facilityName: facility.name_en, // 施設名を渡す
                                                                totalPrice: facility.total_price,
                                                                priceList: facility.prices,
                                                                imageUrl: imageUrl,
                                                            }}
                                                            onClick={() => {
                                                                // Update sessionStorage with the new reservation details
                                                                const newDetails = {
                                                                    guests,
                                                                    checkInDate: dateRange[0] instanceof Date ? dateRange[0].toISOString() : null,
                                                                    checkOutDate: dateRange[1] instanceof Date ? dateRange[1].toISOString() : null,
                                                                    facilityId: facility.id,
                                                                    facilityName: facility.name_en,
                                                                    totalPrice: facility.total_price,
                                                                    priceList: facility.prices,
                                                                    imageUrl: imageUrl,
                                                                };
                                                                sessionStorage.setItem('reservationDetails', JSON.stringify(newDetails));
                                                            }}
                                                        >
                                                            <button className={styles.btn}>Book</button>
                                                        </Link>
                                                    </div>
                                                </Card.Body>

                                            </Card>
                                        </Col>
                                    );
                                })
                            ) : (
                                <p className={styles['no-results']}>There are no facilities matching your criteria.</p>
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
