import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../styles/StaySteps.css'; // スタイルは別途記述

function StaySteps() {
    const steps = [
        { id: 1, title: 'Select an accommodation', description: 'Please select your preferred facility.' },
        { id: 2, title: 'Make a Reservation', description: 'Confirm your reservation for the desired date and time.' },
        { id: 3, title: 'Make a Payment', description: 'Please complete the prepayment on the reservation page when making your booking. We use Stripe for a safe and seamless payment process.' },
        { id: 4, title: 'Enter Guest Information', description: 'Please fill in your information using the form sent to your email address.' },
        { id: 5, title: 'Check-In Information', description: 'We will send detailed information about the check-in process to the email address you provided.' },
        { id: 6, title: 'Self Check-In', description: 'Guests are requested to proceed directly to the accommodation. Please check in using the specified method.' },
    ];

    return (
        <section className="stay-steps">
            <Container>
                <h2 className="text-center mb-5 section-title">Steps to Your Stay</h2>
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
