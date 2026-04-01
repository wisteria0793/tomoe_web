import React from 'react';
import styles from '../../styles/StaffProfiles.module.css';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const staffData = [
    {
        id: 1,
        name: "Hiroshi Kurauchi",
        role: "Owner",
        description: "My primary business is in insurance and real estate. Many of the figures and posters displayed in the facility are part of my personal collection. Having studied abroad, I am also able to communicate in English, so please feel free to reach out anytime!",
        imgSrc: "/images/staff/kurauchi2.png"
    },
    {
        id: 2,
        name: "Atsuya Katogi",
        role: "Manager",
        description: "I'm a resident of Tomoe.com No.1. Currently studying English. I strive to provide the best possible stay for our guests. If you have any concerns or issues, please don't hesitate to contact me!",
        imgSrc: "/images/staff/atsuya2.jpeg"
    }
];

function StaffProfiles() {
    return (
        <div className={styles.staffContainer}>
            <h1 className={styles.title}>Staff</h1>
            <Row className="g-4 d-flex justify-content-center">
                {staffData.map((staff) => (
                    <Col key={staff.id} xs={12} sm={6} md={4}>
                        <Card className={styles.card}>
                            <Card.Img variant="top" src={staff.imgSrc} className={styles.image} />
                            <Card.Body>
                                <Card.Title className={styles.name}>{staff.name}</Card.Title>
                                <Card.Subtitle className={`mb-2 text-muted ${styles.role}`}>{staff.role}</Card.Subtitle>
                                <Card.Text className={styles.description}>
                                    {staff.description}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default StaffProfiles;
