import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Col, Row } from 'react-bootstrap';
import styles from '../../styles/Facilities.module.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = "";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

function Facilities() {
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/facilities/`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setFacilities(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFacilities();
    }, []);

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

                    return (
                        <Col key={idx} xs={12} sm={5} md={5} lg={3} style={{ display: "flex", justifyContent: "center" }}>
                            <Card className={styles.card}>
                                <Card.Img
                                    variant="top"
                                    src={imageUrl}
                                    alt={`${facility.name_en}の画像`}
                                />
                                <Card.Body className={styles['card-body']}>
                                    <Card.Title className={styles['card-title']}>{facility.name_en}</Card.Title>
                                    <p>{facility.catchphrase_en}</p>
                                    <div className={styles['button-container']}>
                                        <Link to={`/english/facility/${facility.id}`}>
                                            <Button>Show more</Button>
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
