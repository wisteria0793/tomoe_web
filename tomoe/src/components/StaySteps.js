import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/StaySteps.css'; // スタイルは別途記述
import { useTranslation } from 'react-i18next';

function StaySteps() {
    const { t } = useTranslation();
    const steps = [
        { id: 1, title: t('staySteps.step1.title'), description: t('staySteps.step1.description') },
        { id: 2, title: t('staySteps.step2.title'), description: t('staySteps.step2.description') },
        { id: 3, title: t('staySteps.step3.title'), description: t('staySteps.step3.description') },
        { id: 4, title: t('staySteps.step4.title'), description: t('staySteps.step4.description') },
        { id: 5, title: t('staySteps.step5.title'), description: t('staySteps.step5.description') },
        { id: 6, title: t('staySteps.step6.title'), description: t('staySteps.step6.description') },
    ];

    return (
        <section className="stay-steps">
            <Container>
                <h2 className="text-center mb-5 section-title">{t('staySteps.title')}</h2>
                <Row className="justify-content-center">
                    {steps.map((step) => (
                        <Col key={step.id} xs={12} sm={6} md={4} className="mb-4 text-center step-card">
                            <div className="step-icon">
                                <span>{step.id}</span>
                            </div>
                            <h5 className="step-title">{step.title}</h5>
                            <p className="step-description">{step.description}</p>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}

export default StaySteps;
