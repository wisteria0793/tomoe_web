import React, { useEffect, useState } from 'react';
import faqStyles from '../../styles/Faq.module.css';
import contactStyles from '../../styles/Contact.module.css';
import StaffProfiles from './StaffProfiles';


function Faq() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/faqs/`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setFaqs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>

            <div className="container">
                <div className={faqStyles.faq}>
                    <h3 className="text-center fs-1 mb-5">FAQ</h3>
                    <div className={faqStyles.faq__detail}>
                        {faqs.map((faq, idx) => (
                            <div key={idx} className={faqStyles.questionCard}>
                                <p className={faqStyles.question}>Q. {faq.question_en}</p>
                                <p className={faqStyles.answer}>A. {faq.answer_en}</p>
                            </div>
                        ))}
                    </div>
                    <StaffProfiles />
                    <div className={contactStyles.contact}>
                        <h4 className="mb-4">Contact</h4>
                        <div className={contactStyles.contact__content}>
                            <div className={contactStyles.contact__item}>
                                <img src="/images/icons/mail.svg" alt="メール" />
                                <span>hakodateshino0901@gmail.com</span>
                            </div>
                            <div className={contactStyles.contact__item}>
                                <img src="/images/icons/phone-call.svg" alt="電話" />
                                <span>080-9322-4522</span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </>



    );
}

export default Faq;
