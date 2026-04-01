import React from 'react';
import styles from '../styles/StaffProfiles.module.css';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useTranslation } from 'react-i18next';

const staffData = [
    {
        id: 1,
        name: "倉内 大志",
        name_en: "Hiroshi Kurauchi",
        role: "オーナー",
        role_en: "Owner",
        description: "本業は保険・不動産業。施設に飾ってあるフィギュアやポスターの多くは趣味で集めたものです。留学経験もあり、英語対応も可能ですのでお気軽にお声がけください。",
        description_en: "He works in the insurance and real estate industries. Many of the figures and posters displayed in the facility are collected as a hobby. He has a study abroad experience and can speak English, so please feel free to contact us.",
        imgSrc: `${process.env.PUBLIC_URL}/images/staff/kurauchi2.png`
        // imgSrc: "/images/staff/kurauchi2.png"
    },
    {
        id: 2,
        name: "加藤木 敦也",
        name_en: "Atsuya Katougi",
        role: "マネージャー",
        role_en: "Manager",
        description: "巴.com1号棟の住民。現在英語を勉強中。最高の滞在を提供できるよう努めています。困ったことなどがありましたお気軽にご連絡ください。",
        description_en: "He lives in the 1st building of Hachinohe.com. He is currently studying English. He strives to provide the best stay experience. Please feel free to contact us if you have any questions.",
        imgSrc: `${process.env.PUBLIC_URL}/images/staff/atsuya2.jpeg`
        // imgSrc: "/images/staff/atsuya2.jpeg"
    }
];

function StaffProfiles() {
    const { t, i18n } = useTranslation();
    return (
        <div className={styles.staffContainer}>
            <h1 className={styles.title}>Staff</h1>
            <Row className={styles.staff_row}>
                {staffData.map((staff) => (
                    <Col key={staff.id} >
                        <Card className={styles.card}>
                            <Card.Img variant="top" src={staff.imgSrc} className={styles.image} />
                            <Card.Body>
                                <Card.Title className={styles.name}>{i18n.language === 'ja' ? staff.name : staff.name_en}</Card.Title>
                                <Card.Subtitle className={styles.role}>{i18n.language === 'ja' ? staff.role : staff.role_en}</Card.Subtitle>
                                <Card.Text className={styles.description}>
                                    {i18n.language === 'ja' ? staff.description : staff.description_en}
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
