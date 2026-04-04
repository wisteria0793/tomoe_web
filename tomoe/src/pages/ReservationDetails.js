import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Col, Form, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/ReservationDetails.module.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function ReservationDetails() {
    const { t, i18n } = useTranslation();
    // const API_BASE_URL = '/api';
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
    const location = useLocation();
    const [reservationDetails, setReservationDetails] = useState({
        facilityId: null,
        facilityName: null,
        totalPrice: null,
        priceList: [],
        extra_guest_price: null,
        imageUrl: null,
        capacity: null,
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
        guests: 1  // オブジェクトから数値に変更
    });

    const [errors, setErrors] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
    });
    console.log('reserve', reservationDetails)
    const formatToJapaneseDate = (dateString) => {
        if (!dateString) return "未設定";
        const date = new Date(dateString);
        return i18n.language === 'ja' 
            ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
            : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        const storedDetails = sessionStorage.getItem('reservationDetails');
        const storedSearch = sessionStorage.getItem('searchData');
        
        if (storedDetails) {
            const parsedDetails = JSON.parse(storedDetails);
            // 基本料金と追加料金を計算
            const basePrice = parsedDetails.totalPrice;
            const extraGuestCharge = parsedDetails.extraGuestCharge || 0;
            
            // 合計金額を設定
            setReservationDetails({
                ...parsedDetails,
                totalPrice: basePrice
            });
        } else if (location.state) {
            const { 
                facilityId, 
                facilityName, 
                totalPrice,
                priceList, 
                imageUrl, 
                extra_guest_price,
                extraGuestCharge,
                capacity,
                basePrice,
                baseGuests
            } = location.state;

            const details = {
                facilityId,
                facilityName,
                totalPrice: totalPrice + (extraGuestCharge || 0),
                priceList,
                imageUrl,
                extra_guest_price,
                extraGuestCharge,
                capacity,
                basePrice,
                baseGuests
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
            lastName: personalInfo.lastName ? '' : (i18n.language === 'ja' ? '姓を入力してください。' : 'Please enter your last name.'),
            firstName: personalInfo.firstName ? '' : (i18n.language === 'ja' ? '名を入力してください。' : 'Please enter your first name.'),
            email: personalInfo.email ? '' : (i18n.language === 'ja' ? 'メールアドレスを入力してください。' : 'Please enter your email address.'),
            phone: personalInfo.phone ? '' : (i18n.language === 'ja' ? '電話番号を入力してください。' : 'Please enter your phone number.'),
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
            const guestsJson = JSON.stringify(searchData.guests);


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

    // 料金計算用の関数を追加
    const calculatePrice = async (guestCount) => {
        try {
            const response = await fetch(`${API_BASE_URL}/calculate-price/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    facilityId: reservationDetails.facilityId,
                    checkIn: searchData.checkIn,
                    checkOut: searchData.checkOut,
                    guests: guestCount
                }),
            });

            if (!response.ok) {
                throw new Error('Price calculation failed');
            }

            const data = await response.json();
            return {
                totalPrice: data.total_price,
                priceList: data.price_list,
                extra_guest_price: data.extra_guest_price
            };
        } catch (error) {
            console.error('Error calculating price:', error);
            return null;
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
                                    <h5 className={styles.stepTitle}>{i18n.language === 'ja' ? '予約者の情報を入力してください' : 'Please enter your reservation information'}</h5>
                                </div>
                                <Form>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formLastName" className={styles.flexFill}>
                                            <Form.Label>{i18n.language === 'ja' ? '姓*' : 'Last name*'}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={i18n.language === 'ja' ? '例: 山田' : 'Ex) Yamada'}
                                                value={personalInfo.lastName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                            />
                                            {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                                        </Form.Group>
                                        <Form.Group controlId="formFirstName" className={styles.flexFill}>
                                            <Form.Label>{i18n.language === 'ja' ? '名*' : 'First name*'}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={i18n.language === 'ja' ? '例: 太郎' : 'Ex): Tarou'}
                                                value={personalInfo.firstName}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                            />
                                            {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                                        </Form.Group>
                                    </div>
                                    <div className="mb-4 d-md-flex gap-4">
                                        <Form.Group controlId="formEmail" className={styles.flexFill}>
                                            <Form.Label>{i18n.language === 'ja' ? 'メールアドレス*' : 'Email address*'}</Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder={i18n.language === 'ja' ? '例: example@mail.com' : 'Ex) example@mail.com'}
                                                value={personalInfo.email}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            />
                                            {errors.email && <small className="text-danger">{errors.email}</small>}
                                        </Form.Group>
                                        <Form.Group controlId="formPhone" className={styles.flexFill}>
                                            <Form.Label>{i18n.language === 'ja' ? '電話番号*' : 'Phone number*'}</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder={i18n.language === 'ja' ? '例: 090-1234-5678' : 'Ex) 090-1234-5678'}
                                                value={personalInfo.phone}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                            />
                                            {errors.phone && <small className="text-danger">{errors.phone}</small>}
                                        </Form.Group>
                                    </div>

                                    <div className="mb-4 d-md-flex gap-4 ">
                                        <Form.Group controlId="formNotes" className={`mb-4 ${styles.noteField}`}>
                                            <Form.Label>{i18n.language === 'ja' ? '備考' : 'Notes'}</Form.Label>
                                            <Form.Control
                                                className=""
                                                as="textarea"
                                                rows={4}
                                                placeholder={i18n.language === 'ja' ? '特記事項があればご記入ください' : 'Please enter any special notes'}
                                                value={personalInfo.notes}
                                                onChange={(e) => setPersonalInfo({ ...personalInfo, notes: e.target.value })}
                                            />
                                        </Form.Group>
                                    </div>
                                    <small className={`${styles.textMuted} d-block mt-3`}>
                                        <strong>{i18n.language === 'ja' ? '注意:' : 'Attention:'}</strong> {i18n.language === 'ja' ? '予約確認メールはこのメールアドレスに送信されます。' : 'The reservation confirmation email will be sent to this email address.'}
                                    </small>
                                </Form>
                            </div>

                            <div className={`${styles.infoSection} mb-5 p-4`}>
                                <div className={styles.stepHeader}>
                                    <span className={styles.stepNumber}>2</span>
                                    <h5 className={styles.stepTitle}>{i18n.language === 'ja' ? '予約の確認' : 'Reservation Confirmation'}</h5>
                                </div>
                                <Card className={styles.roomCard}>
                                    <img
                                        src={reservationDetails.imageUrl || "/DSC_1077.jpg"}
                                        alt="Room"
                                        className={styles.roomImg}
                                    />
                                    <div className={styles.reserveDetail}>
                                        <h6 className={styles.roomTitle}>
                                            {reservationDetails.facilityName || (i18n.language === 'ja' ? '施設名が未設定です' : 'Facility name is not set')}
                                        </h6>
                                        <div className={styles.guestSelector}>
                                            <div className={styles.guestType}>
                                                <p className={styles.guestTypeText}>
                                                    <strong>{i18n.language === 'ja' ? '宿泊人数' : 'Number of Guests'}:</strong>
                                                    <span className={styles.guestCount}>
                                                        {`${searchData.guests} ${i18n.language === 'ja' ? '名' : 'people'}`}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <p className={styles.roomDetails}>Check-in: {formatToJapaneseDate(reservationDetails.checkInDate)}</p>
                                        <p className={styles.roomDetails}>Check-out: {formatToJapaneseDate(reservationDetails.checkOutDate)}</p>
                                        {/* <p className={styles.roomDetails}>Check-in: {formatToJapaneseDate(searchData.checkIn)}</p> */}
                                        {/* <p className={styles.roomDetails}>Check-out: {formatToJapaneseDate(searchData.checkOut)}</p> */}
                                        <div className={styles.roomPolicy}>
                                            <strong>{i18n.language === 'ja' ? 'キャンセルポリシー:' : 'Cancellation Policy:'}</strong>
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
                                                            <p>~{formatToJapaneseDate(threeDaysBefore)}: {i18n.language === 'ja' ? 'キャンセル料 0%' : 'Cancellation fee 0%'}</p>
                                                            <p>{formatToJapaneseDate(twoDaysBefore)}: {i18n.language === 'ja' ? 'キャンセル料 50%' : 'Cancellation fee 50%'}</p>
                                                            <p>{formatToJapaneseDate(oneDayBefore)}: {i18n.language === 'ja' ? 'キャンセル料 100%' : 'Cancellation fee 100%'}</p>
                                                        </>
                                                    );
                                                } else {
                                                    return <p>{i18n.language === 'ja' ? 'キャンセルポリシーを設定できません。' : 'Cancellation policy cannot be set.'}</p>;
                                                }
                                            })()}
                                        </div>

                                    </div>


                                </Card>

                            </div>
                        </Col>

                        <Col lg={4} className={styles.rightComponent}>
                            <div className={`${styles.summarySection} p-4`}>
                                <h5 className={`${styles.summaryTitle} mb-4`}>{i18n.language === 'ja' ? '予約サマリー' : 'Reservation Summary'}</h5>
                                <div className={styles.summaryDetail}>
                                    <p>
                                        {i18n.language === 'ja' ? '宿泊費' : 'Accommodation fee'}: 
                                        <span className={styles.textPrimary}>
                                            ¥{reservationDetails.totalPrice?.toLocaleString()}
                                        </span>
                                    </p>
                                    <h6>{i18n.language === 'ja' ? '内訳' : 'Breakdown'}</h6>
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
                                        {/* {reservationDetails.extraGuestCharge > 0 && (
                                            <li>
                                                {i18n.language === 'ja' ? '追加ゲスト料金' : 'Extra guest fee'}: 
                                                ¥{reservationDetails.extraGuestCharge.toLocaleString()}
                                            </li>
                                        )} */}
                                    </ul>
                                    <h6>{i18n.language === 'ja' ? '割引' : 'Discount'}</h6>
                                    <ul>
                                        <li>
                                            {i18n.language === 'ja' ? 'web割' : 'Web discount'}: 
                                            -¥{Math.floor(reservationDetails.totalPrice * 0.1).toLocaleString()}
                                        </li>
                                    </ul>
                                    <p>
                                        {i18n.language === 'ja' ? '最終宿泊費用' : 'Final accommodation fee'}: 
                                        <span className={styles.textDanger}>
                                            ¥{Math.floor(reservationDetails.totalPrice * 0.9).toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    block
                                    className="mt-4"
                                    onClick={handlePayment}
                                >
                                    {i18n.language === 'ja' ? '決済に進む' : 'Proceed to payment'}
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
