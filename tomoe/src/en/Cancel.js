import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessCancel.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
function Cancel() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="success-cancel-container">
                <div className="info-section">
                    <div className="step-header">
                        <span className="step-number">✖</span>
                        <h5 className="step-title">Cancel</h5>
                    </div>
                    <h1 className="title text-danger">The payment was canceled.</h1>
                    <p className="message">The payment could not be completed. Please try again.</p>
                    <button 
                        onClick={() => navigate('/english/reservation')} 
                        className="btn btn-danger mt-4"
                    >
                        予約ページに戻る
                    </button>
                </div>
            </div>
	<Footer />
        </>
    );
}

export default Cancel;
