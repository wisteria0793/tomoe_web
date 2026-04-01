import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Col, Form, Button, Card } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/ReservationDetails.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

function ReservationDetails() {
    const location = useLocation();
    const [reservationDetails, setReservationDetails] = useState({
        facilityId: null,
        facilityName: null,
        totalPrice: null,
        priceList: [],
	imageUrl: null,
    });

    const [personalInfo, setPersonalInfo] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        notes: '', // 備考フィールド
    });
    
    const [searchData, setSearchData] = useState({
        checkIn: null,
        checkOut: null,
        guests: { adult: 1, child: 0, infant: 0 },
    });

    const formatToJapaneseDate = (dateString) => {
        if (!dateString) return "未設定";
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    useEffect(() => {
        const storedDetails = sessionStorage.getItem('reservationDetails');
	const storedSearch = sessionStorage.getItem('searchData');

        if (storedDetails) {
            setReservationDetails(JSON.parse(storedDetails));
        } else if (location.state) {
            const { facilityId, facilityName, totalPrice, priceList, imageUrl } = location.state;
            const details = {
                facilityId,
                facilityName,
                totalPrice,
                priceList,
		imageUrl,
            };
            setReservationDetails(details);
            sessionStorage.setItem('reservationDetails', JSON.stringify(details));
        }
	
	if (storedSearch) {
            setSearchData(JSON.parse(storedSearch));
        } else if (location.state) {
            const { checkInDate, checkOutDate, guests } = location.state;
            const search = {
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests,
            };
            setSearchData(search);
            sessionStorage.setItem('searchData', JSON.stringify(search));
        }

    }, [location.state]);

    const handlePayment = async () => {
        try {
            const discountRate = 0.1; // 10% discount
            const discount = Math.floor(reservationDetails.totalPrice * discountRate);
            const discountedPrice = reservationDetails.totalPrice - discount;

            // guestsをJSON文字列に変換
            const guestsJson = JSON.stringify(reservationDetails.guests);

    
            const stripeResponse = await fetch(`${API_BASE_URL}/create-checkout-session/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalInfo,
                    reservationDetails: {
                        ...reservationDetails,
                        totalPrice: discountedPrice,
                        discount, // 割引を含めて送信
                        guests: guestsJson, // guestsをJSON文字列として送信

                    },
                }),
            });

    
            const session = await stripeResponse.json();
    
            if (session.error) {
                console.error('Error creating Stripe session:', session.error);
                return;
            }
    
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: session.id,
            });
    
            if (error) {
                console.error('Stripe redirect error:', error);
            }
        } catch (error) {
            console.error('Error handling payment:', error);
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.reservationDetails}>
                <Container>
                    <div className="mt-5 d-lg-flex">
                        <Col lg={8} className={styles.leftComponent}>
                            <div className={`${styles.infoSection} mb-5 p-4`}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepNumber}>1</span>
                                    <h5 className={styles.stepTitle}>Please enter the presentative's information.</h5>
                                </div>
                                <Form>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formLastName" className={styles.flexFill}>
                                            <Form.Label>Last name*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ex): 山田"
                                                value={personalInfo.lastName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formFirstName" className={styles.flexFill}>
                                            <Form.Label>First name*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ex: 太郎"
                                                value={personalInfo.firstName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                            />
                                        </Form.Group>
                                    </div>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formEmail" className={styles.flexFill}>
                                            <Form.Label>Mail address*</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="ex: example@mail.com"
                                                value={personalInfo.email}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            />
                                        </Form.Group>
                                        <Form.Group controlId="formPhone" className={styles.flexFill}>
                                            <Form.Label>Phone number*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="ex: 090-1234-5678"
                                                value={personalInfo.phone}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                            />
                                        </Form.Group>
                                    </div>

                                    <div className="mb-4 d-md-flex gap-4 ">
                                        <Form.Group controlId="formNotes" className={`mb-4 ${styles.noteField}`}>
                                            <Form.Label>Notes</Form.Label>
                                            <Form.Control
                                                className=""
                                                as="textarea"
                                                rows={4}
                                                placeholder="Please enter any special requests or notes, if applicable."
                                                value={personalInfo.notes}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, notes: e.target.value })}
                                            />
                                        </Form.Group>
                                    </div>
                                    <small className={`${styles.textMuted} d-block mt-3`}>
                                        <strong>Note:</strong> The reservation confirmation email will be sent to this email address.
                                    </small>
                                </Form>
                            </div>

                            <div className={`${styles.infoSection} mb-5 p-4`}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepNumber}>2</span>
                                    <h5 className={styles.stepTitle}>Reservation Confirmation</h5>
                                </div>
                                <Card className={styles.roomCard}>
                                    <img
                                        src={reservationDetails.imageUrl || "/images/build1/DSC_1077.jpg"}
                                        alt="Room"
                                        className={styles.roomImg}
                                    />
                                    <div className={styles.reserveDetail}>
                                        <h6 className={styles.roomTitle}>{reservationDetails.facilityName || "施設名が未設定です"}</h6>
                                        <p className={styles.roomDetails}>
                                            Adult: {searchData.guests.adult} | Child: {searchData.guests.child} | Infant: {searchData.guests.infant}
                                        </p>
                                        <p className={styles.roomDetails}>Check-in: {formatToJapaneseDate(searchData.checkIn)}</p>
                                        <p className={styles.roomDetails}>Check-out: {formatToJapaneseDate(searchData.checkOut)}</p>
                                        <div className={styles.roomPolicy}>
                                            <strong>Cancel policy:</strong>
                                            {(() => {
                                                const checkInDate = searchData.checkIn
                                                    ? new Date(searchData.checkIn)
                                                    : null;

                                                if (checkInDate) {
                                                    const twoDaysBefore = new Date(checkInDate);
                                                    const threeDaysBefore = new Date(checkInDate);
                                                    const oneDayBefore = new Date(checkInDate);
                                                    threeDaysBefore.setDate(checkInDate.getDate() - 3);
                                                    twoDaysBefore.setDate(checkInDate.getDate() - 2);
                                                    oneDayBefore.setDate(checkInDate.getDate() - 1);

                                                    return (
                                                        <>
                                                            <p>~{formatToJapaneseDate(threeDaysBefore)}: Cancel fee 0%</p>
                                                            <p>~{formatToJapaneseDate(twoDaysBefore)}: Cancel fee 50%</p>
                                                            <p>{formatToJapaneseDate(oneDayBefore)}~: Cancel fee 100%</p>
                                                        </>
                                                    );
                                                } else {
                                                    return <p>キャンセルポリシーを設定できません。</p>;
                                                }
                                            })()}
                                        </div>

                                    </div>


                                </Card>

                            </div>
                        </Col>
                
                        <Col lg={4} className={styles.rightComponent}>
                            <div className={`${styles.summarySection} p-4`}>
                                <h5 className={`${styles.summaryTitle} mb-4`}>Reservation Summary</h5>
                                <div className={styles.summaryDetail}>
                                    <p>Accommodation Fee: <span className={styles.textPrimary}>¥{reservationDetails.totalPrice?.toLocaleString()}</span></p>
                                    <h6>Breakdown:</h6>
                                    <ul>
                                        {reservationDetails.priceList?.map((price, index) => {
                                            const checkInDate = new Date(searchData.checkIn);
                                            const stayDate = new Date(checkInDate);
                                            stayDate.setDate(checkInDate.getDate() + index);
                                            return (
                                                <li key={index}>
                                                    {stayDate.toLocaleDateString('en-US')}: ¥{price.toLocaleString()}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <h6>Discount:</h6>
                                    <ul>
                                        <li>Web Discount: - ¥{Math.floor(reservationDetails.totalPrice * 0.1).toLocaleString()}</li>
                                    </ul>
                                    <p>Final Accommodation Cost: <span className={styles.textDanger}>¥{
                                        Math.floor(reservationDetails.totalPrice * 0.9).toLocaleString()
                                    }</span></p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    block
                                    className="mt-4"
                                    onClick={handlePayment}
                                >
                                    Proceed to Payment
                                </Button>
                            </div>
                        </Col>
                    </div>
                </Container>
            </div>
	<Footer />
        </>
    );
}

export default ReservationDetails;
