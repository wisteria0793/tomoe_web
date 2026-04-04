import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Col, Form, Button, Card } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/ReservationDetails.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
// const stripePromise = loadStripe('pk_test_dLp9JuKSvydwPWFrjmlptlKf00MfaAmSsV');
function ReservationDetails() {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
    const location = useLocation();
    const [reservationDetails, setReservationDetails] = useState({
        guests: { adult: 1, child: 0, infant: 0 },
        checkInDate: null,
        checkOutDate: null,
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
    
    const [errors, setErrors] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
    });

    const formatToJapaneseDate = (dateString) => {
        if (!dateString) return "未設定";
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const storedDetails = sessionStorage.getItem('reservationDetails');
        if (storedDetails) {
            setReservationDetails(JSON.parse(storedDetails));
        } else if (location.state) {
            const { guests, checkInDate, checkOutDate, facilityId, facilityName, totalPrice, priceList, imageUrl } = location.state;
            const details = {
                guests,
                checkInDate,
                checkOutDate,
                facilityId,
                facilityName,
                totalPrice,
                priceList,
		imageUrl,
            };
            setReservationDetails(details);
            sessionStorage.setItem('reservationDetails', JSON.stringify(details));
        }
    }, [location.state]);
    

    // CSRFトークンを取得
    async function fetchCsrfToken() {
        const response = await fetch(`${API_BASE_URL}/csrf/`, {
            credentials: 'include', // クッキーを含める
        });
        const data = await response.json();
        return data.csrfToken;
    }


    const handlePayment = async () => {


	const newErrors = {
            lastName: personalInfo.lastName ? '' : '姓を入力してください。',
            firstName: personalInfo.firstName ? '' : '名を入力してください。',
            email: personalInfo.email ? '' : 'メールアドレスを入力してください。',
            phone: personalInfo.phone ? '' : '電話番号を入力してください。',
        };

        setErrors(newErrors);

        // エラーがある場合は処理を中断
        if (Object.values(newErrors).some((error) => error !== '')) {
            return;
        }

	try {
            const discountRate = 0.1; // 10% discount
            const discount = Math.floor(reservationDetails.totalPrice * discountRate);
            const discountedPrice = reservationDetails.totalPrice - discount;
	    const csrfToken = await fetchCsrfToken();
            // guestsをJSON文字列に変換
            const guestsJson = JSON.stringify(reservationDetails.guests);

    
            const stripeResponse = await fetch(`${API_BASE_URL}/create-checkout-session/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken, // 追加する
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
            
            // ステータスコードのチェック
            if (!stripeResponse.ok) {
                console.error('Error creating Stripe session. Status:', stripeResponse.status);
                return;
            }
            console.log(stripeResponse)
            const session = await stripeResponse.json();
            
            // session.idが取得できなかった場合のチェック
            if (!session.id) {
                console.error('Error creating Stripe session: No session id returned from server.');
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
                                    <h5 className={styles.stepTitle}>予約者の情報を入力してください</h5>
                                </div>
                                <Form>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formLastName" className={styles.flexFill}>
                                            <Form.Label>姓*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="例: 山田"
                                                value={personalInfo.lastName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                            />
					    {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                                        </Form.Group>
                                        <Form.Group controlId="formFirstName" className={styles.flexFill}>
                                            <Form.Label>名*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="例: 太郎"
                                                value={personalInfo.firstName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                            />
					    {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                                        </Form.Group>
                                    </div>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formEmail" className={styles.flexFill}>
                                            <Form.Label>メールアドレス*</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="例: example@mail.com"
                                                value={personalInfo.email}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            />
					    {errors.email && <small className="text-danger">{errors.email}</small>}
                                        </Form.Group>
                                        <Form.Group controlId="formPhone" className={styles.flexFill}>
                                            <Form.Label>電話番号*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="例: 090-1234-5678"
                                                value={personalInfo.phone}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                            />
					    {errors.phone && <small className="text-danger">{errors.phone}</small>}
                                        </Form.Group>
                                    </div>

                                    <div className="mb-4 d-md-flex gap-4 ">
                                        <Form.Group controlId="formNotes" className={`mb-4 ${styles.noteField}`}>
                                            <Form.Label>備考</Form.Label>
                                            <Form.Control
                                                className=""
                                                as="textarea"
                                                rows={4}
                                                placeholder="特記事項があればご記入ください"
                                                value={personalInfo.notes}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, notes: e.target.value })}
                                            />
                                        </Form.Group>
                                    </div>
                                    <small className={`${styles.textMuted} d-block mt-3`}>
                                        <strong>注意:</strong> 予約確認メールはこのメールアドレスに送信されます。
                                    </small>
                                </Form>
                            </div>

                            <div className={`${styles.infoSection} mb-5 p-4`}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepNumber}>2</span>
                                    <h5 className={styles.stepTitle}>予約の確認</h5>
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
                                            大人: {reservationDetails.guests.adult} | 子供: {reservationDetails.guests.child} | 幼児: {reservationDetails.guests.infant}
                                        </p>
                                        <p className={styles.roomDetails}>チェックイン: {formatToJapaneseDate(reservationDetails.checkInDate)}</p>
                                        <p className={styles.roomDetails}>チェックアウト: {formatToJapaneseDate(reservationDetails.checkOutDate)}</p>
                                        <div className={styles.roomPolicy}>
                                            <strong>キャンセルポリシー:</strong>
                                            {(() => {
                                                const checkInDate = reservationDetails.checkInDate
                                                    ? new Date(reservationDetails.checkInDate)
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
                                                            <p>{formatToJapaneseDate(threeDaysBefore)}まで: キャンセル料 0%</p>
                                                            <p>{formatToJapaneseDate(twoDaysBefore)}まで: キャンセル料 50%</p>
                                                            <p>{formatToJapaneseDate(oneDayBefore)}以降: キャンセル料 100%</p>
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
                                <h5 className={`${styles.summaryTitle} mb-4`}>予約サマリー</h5>
                                <div className={styles.summaryDetail}>
                                    <p>宿泊費: <span className={styles.textPrimary}>¥{reservationDetails.totalPrice?.toLocaleString()}</span></p>
                                    <h6>内訳:</h6>
                                    <ul>
                                        {reservationDetails.priceList?.map((price, index) => {
                                            const checkInDate = new Date(reservationDetails.checkInDate);
                                            const stayDate = new Date(checkInDate);
                                            stayDate.setDate(checkInDate.getDate() + index);
                                            return (
                                                <li key={index}>
                                                    {stayDate.toLocaleDateString('ja-JP')}: ¥{price.toLocaleString()}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <h6>割引:</h6>
                                    <ul>
                                        <li>web割: -¥{Math.floor(reservationDetails.totalPrice * 0.1).toLocaleString()}</li>
                                    </ul>
                                    <p>最終宿泊費用: <span className={styles.textDanger}>¥{
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
                                    決済に進む
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
