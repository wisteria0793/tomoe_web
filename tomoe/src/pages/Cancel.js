import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessCancel.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';

function Cancel() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="success-cancel-container">
                <div className="info-section">
                    <div className="step-header">
                        <span className="step-number">✖</span>
                        <h5 className="step-title">{i18n.language === 'ja' ? '決済キャンセル' : 'Payment Canceled'}</h5>
                    </div>
                    <h1 className="title text-danger">{i18n.language === 'ja' ? '決済がキャンセルされました' : 'Payment Canceled'}</h1>
                    <p className="message">{i18n.language === 'ja' ? '決済が完了しませんでした。もう一度お試しください。' : 'Payment was not completed. Please try again.'}</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn btn-danger mt-4"
                    >
                        {i18n.language === 'ja' ? 'ホームに戻る' : 'Back to Home'}
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Cancel;
