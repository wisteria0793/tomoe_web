import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import faqStyles from '../styles/Faq.module.css';
import contactStyles from '../styles/Contact.module.css';
import StaffProfiles from './StaffProfiles';

function Faq() {
    const { t, i18n } = useTranslation();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const API_BASE_URL = 'http://127.0.0.1:8000/api';
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/faqs/?lang=${i18n.language}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                console.log('faq', data);
                setFaqs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, [i18n.language]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleViewAllFaqs = () => {
        navigate('/faq');
    };

    return (
        <div className="container">
            <div className={faqStyles.faq}>
                <h3 className="text-center fs-1 mb-5">FAQ</h3>
                <div className={faqStyles.faq__detail}>
                    {faqs.slice(0, 3).map((faq, idx) => (
                        <div key={idx} className={faqStyles.questionCard}>
                            <p className={faqStyles.question}>Q. {faq.question}</p>
                            <p className={faqStyles.answer}>A. {faq.answer}</p>
                        </div>
                    ))}
                </div>
                <button className={faqStyles.viewAllButton} onClick={handleViewAllFaqs}>
                    {i18n.language === 'ja' ? 'すべてのFAQを見る' : 'View All FAQs'}
                </button>
                
            </div>
        </div>
    );
}

export default Faq;
