import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessCancel.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

function Success() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="success-cancel-container">
                <div className="info-section">
                    <div className="step-header">
                        <span className="step-number">✔</span>
                        <h5 className="step-title">{i18n.language === 'ja' ? '決済完了' : 'Payment Completed'}</h5>
                    </div>
                    <h1 className="title text-success">{i18n.language === 'ja' ? '決済が完了しました！' : 'Payment Completed!'}</h1>
                    <p className="message">{i18n.language === 'ja' ? 'ご予約ありがとうございます。詳細はご登録のメールアドレスに送信されます。' : 'Thank you for your reservation. Details will be sent to your registered email address.'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-primary"
                    >
                        {i18n.language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Success;
