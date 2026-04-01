import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Row } from 'react-bootstrap';
import styles from '../styles/Facilities.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';

const BASE_URL = "http://127.0.0.1:8000";

function Facilities() {
    const { i18n } = useTranslation();
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const API_BASE_URL = 'http://127.0.0.1:8000/api';
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/facilities/?lang=${i18n.language}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                console.log("Facilities data:", data);
                setFacilities(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacilities();
    }, [i18n.language]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div id="facilities" className={`${styles['facilities']} container-fluid`}>
            <div className="title">
                <p className="text-center fs-1">Facilities</p>
            </div>

            <Row className={`${styles['custom-row-width']}`}>
                {facilities.map((facility, idx) => {
                    const imageUrl = facility.images && facility.images.length > 0
                        ? facility.images[0].image
                        : "https://via.placeholder.com/300";

                    const facilityName = facility.name;
                    // const facilityName = i18n.language === 'ja' ? facility.name : facility.name_en;
                    // const facilityCatchphrase = i18n.language === 'ja' ? facility.catchphrase : facility.catchphrase_en;
                    const facilityCatchphrase = facility.catchphrase;

                    return (
                        <Col key={idx} xs={12} sm={5} md={5} lg={3}>
                            <Card className={styles.card}>
                                <Card.Img
                                    variant="top"
                                    src={imageUrl}
                                    alt={`${facilityName}の画像`}
                                />
                                <Card.Body className={styles['card-body']}>
                                    <Card.Title className={styles['card-title']}>{facilityName}</Card.Title>
                                    <p>{facilityCatchphrase}</p>
                                    <div className={styles['button-container']}>
                                        <Link to={`/facility/${facility.id}`}>
                                            <Button>
                                                {i18n.language === 'ja' ? '詳しく見る' : 'Learn More'}
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

        </div>
    );
}

export default Facilities;
