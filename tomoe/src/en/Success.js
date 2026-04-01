import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SuccessCancel.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function Success() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />
            <div className="success-cancel-container">
                <div className="info-section">
                    <div className="step-header">
                        <span className="step-number">✔</span>
                        <h5 className="step-title">Complete!</h5>
                    </div>
                    <h1 className="title text-success">The payment has been completed!</h1>
                    <p className="message">Thank you for your reservation. Details will be sent to your registered email address.</p>
                    <button
                        onClick={() => navigate('/English')}
                        className="btn btn-primary"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
	<Footer />
        </>
    );
}

export default Success;
