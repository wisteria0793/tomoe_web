import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import styles from '../styles/Payment.module.css';
import InputField from './components/InputField';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
function Payment() {
    const location = useLocation();
    const { cart } = location.state || { cart: [] }; // 商品情報を取得
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        nationality: '',
        postalCode: '',
        address1: '',
        address2: '',
    });
    const [isShippingRequired, setIsShippingRequired] = useState(false); // New state for shipping requirement
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
    const shippingCost = isShippingRequired ? 750 : 0; // 配送料を固定
    const [errors, setErrors] = useState({}); // エラーメッセージを管理
    const [loading, setLoading] = useState(false);
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBuyerInfo({ ...buyerInfo, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        setIsShippingRequired(e.target.checked);
    };

    const validateForm = () => {
        const newErrors = {};
	if (isShippingRequired){
        if (!buyerInfo.name) newErrors.name = "Your name is required.";
        if (!buyerInfo.phone) newErrors.phone = "Your phone number is required.";
        if (!buyerInfo.email) newErrors.email = "Your mail address is required.";
        if (!buyerInfo.nationality) newErrors.nationality = "Your nationality is required.";
        if (!buyerInfo.postalCode) newErrors.postalCode = "Your post code is required.";
        if (!buyerInfo.address1) newErrors.address1 = "Your address is required.";
	}
        return newErrors;
    };
    // CSRFトークンを取得
            async function fetchCsrfToken() {
                const response = await fetch(`${API_BASE_URL}/products/csrf-token/`, {
                    credentials: 'include', // クッキーを含める
                });
                const data = await response.json();
                return data.csrfToken;
            }


    const handlePurchase = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        console.log('Information:', buyerInfo);
        console.log('Total:', totalAmount);
        // ここで購入処理を実行
        setLoading(true);
        try {
            // 購入者情報をJSON文字列に変換
            const buyerInfoJson = JSON.stringify(buyerInfo); // buyerInfoをJSON文字列として送信
            
	    const csrfToken = await fetchCsrfToken();
            const stripeResponse = await fetch(`${API_BASE_URL}/products/create-checkout-session/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
		    'X-CSRFToken': csrfToken, // CSRFトークンをヘッダーに追加
                },
                body: JSON.stringify({
                    personalInfo: buyerInfoJson,
                    reservationDetails: {
                        cart: cart,
                        shippingCost: shippingCost,
                        totalPrice: totalAmount,
                    },
                }),
            });

            // レスポンスをログに出力して内容を確認
            const responseText = await stripeResponse.text(); // レスポンスをテキストとして取得
            console.log('サーバーからのレスポンス:', responseText); // レスポンスをログに出力

            // ステータスがOKでない場合のエラーハンドリング
            if (!stripeResponse.ok) {
                console.error('サーバーエラー:', stripeResponse.status, stripeResponse.statusText);
                return;
            }

            const session = JSON.parse(responseText); // レスポンスをJSONとして解析

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
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = cart.reduce((sum, item) => {
        const price = item.product?.price || 0; // Use optional chaining and default value
        const quantity = item.quantity || 0;
        return sum + price * quantity;
    }, 0) + shippingCost;

    return (
	<>
	<Navbar />
        <div className={styles.paymentContainer}>
            <div className={styles.productInfo}>
		{cart.map(item => {
		const product = item.product || {};
		return (
		<div key={product.id} className={styles.productItem}>
                <img src={product.image} alt={product.description_en} className={styles.productImage} />
                <h2 className={styles.productTitle}>{product.name_en}</h2>
                <p className={styles.productDescription}>{product.description_en}</p>
                <p><strong>Genre:</strong> {product.genres && product.genres.length > 0 ? (
                        product.genres.map((g) => g.name_en).join(', ') // ジャンル名を"、"で区切る
                    ) : (
                        <span className={styles.genreTag}>ジャンルなし</span> // ジャンルがない場合の表示
                    )}
                </p>
		<p><strong>Quantity:</strong> {item.quantity}</p>
            </div>
		);
		})}
	   </div>
            <div className={styles.buyerInfo}>
                <h3>Buyer information</h3>
		        <label>
            <input
                type="checkbox"
                checked={isShippingRequired}
                onChange={handleCheckboxChange}
                className={styles.shippingCheckbox} // Add this class
            />
            Is shipping required?
        </label>
		{isShippingRequired && (
                        <>
                <InputField
                    label="name"
                    name="name"
                    placeholder="ex: 山田 太郎"
                    value={buyerInfo.name}
                    onChange={handleInputChange}
                    error={errors.name}
                />
                <InputField
                    label="Phone number"
                    name="phone"
                    placeholder="ex: 090-1234-5678"
                    value={buyerInfo.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                />
                <InputField
                    label="Mail Address"
                    name="email"
                    placeholder="ex: example@example.com"
                    value={buyerInfo.email}
                    onChange={handleInputChange}
                    error={errors.email}
                />
                <InputField
                    label="Nationality"
                    name="nationality"
                    placeholder="ex: Japan"
                    value={buyerInfo.nationality}
                    onChange={handleInputChange}
                    error={errors.nationality}
                />
                <InputField
                    label="Post code"
                    name="postalCode"
                    placeholder="ex: 123-4567"
                    value={buyerInfo.postalCode}
                    onChange={handleInputChange}
                    error={errors.postalCode}
                />
                <InputField
                    label="Address 1"
                    name="address1"
                    placeholder="ex: 東京都千代田区1-1"
                    value={buyerInfo.address1}
                    onChange={handleInputChange}
                    error={errors.address1}
                />
                <InputField
                    label="Address 2"
                    name="address2"
                    placeholder="ex: 101号室"
                    value={buyerInfo.address2}
                    onChange={handleInputChange}
                />
		</>
		)}
                <div className={styles.totalContainer}>
                    <div className={styles.breakdown}>
                        <p>price: ¥{Math.floor(cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0))}</p>
                        <p>Shipping fee: ¥{shippingCost.toLocaleString()}</p>
                        <p className={styles.totalText}>
                            Total: ¥{totalAmount.toLocaleString()}
                        </p>
                    </div>
                    <button className={styles.purchaseButton} onClick={handlePurchase}>Purchase</button>
                </div>
            </div>
        </div>
	<Footer />
	</>
    );
}

export default Payment; 
