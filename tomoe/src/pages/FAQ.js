import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../styles/FAQPage.module.css';
import faqStyles from '../styles/Faq.module.css';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function FAQ() {
    const { t, i18n } = useTranslation();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [statusMessage, setStatusMessage] = useState('');
    // const API_BASE_URL = 'http://127.0.0.1:8000/api';
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
    const location = useLocation();

    useEffect(() => {
        if (location.hash === '#contact') {
            setTimeout(() => {
                const element = document.getElementById('contact');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    }, [location]);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/faqs/?lang=${i18n.language}`);
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
    }, [i18n.language]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const getCSRFToken = async () => {
    const response = await fetch(`${API_BASE_URL}/csrf/`, {
        credentials: "include",
    });
    const data = await response.json();
    return data.csrfToken;
};
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage('');
        try {
	    const csrfToken = await getCSRFToken();
            const response = await fetch(`${API_BASE_URL}/contact/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
		    "X-CSRFToken": csrfToken,  // CSRF トークンを送信
                },
                body: JSON.stringify(formData),
		credentials: "include",  // クッキーの送信を許可
            });
            if (response.ok) {
                setStatusMessage(i18n.language === 'ja' ? 'メール送信が完了しました！' : 'Your message has been sent!');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatusMessage(i18n.language === 'ja' ? 'メール送信に失敗しました。' : 'Failed to send message.');
            }
        } catch (error) {
            setStatusMessage(i18n.language === 'ja' ? 'エラーが発生しました。' : 'An error occurred.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <Navbar />
            <div className={styles.pageContainer}>
                <div className="container">
                    <div className={faqStyles.faq}>
                        <h3 className="text-center fs-1 mb-5">FAQ</h3>
                        <div className={faqStyles.faq__detail}>
                            {faqs.map((faq, idx) => (
                                <div key={idx} className={faqStyles.questionCard}>
                                    <p className={faqStyles.question}>Q. {faq.question}</p>
                                    <p className={faqStyles.answer}>A. {faq.answer}</p>
                                </div>
                            ))}
                        </div>

                        <div id="contact" className={styles.contactFormSection}>
                            <h3 className="text-center fs-2 mb-4">{i18n.language === 'ja' ? 'お問い合わせ' : 'Contact'}</h3>
                            <form className={styles.contactForm} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">{i18n.language === 'ja' ? 'お名前' : 'Name'} </label>
                                    <input type="text" id="name" name="name" required className={styles.formInput} value={formData.name} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">{i18n.language === 'ja' ? 'メールアドレス' : 'Email Address'} </label>
                                    <input type="email" id="email" name="email" required className={styles.formInput} value={formData.email} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="message">{i18n.language === 'ja' ? 'お問い合わせ内容' : 'Message'} </label>
                                    <textarea id="message" name="message" required className={styles.formTextarea} rows="5" value={formData.message} onChange={handleChange}></textarea>
                                </div>
                                <button type="submit" className={styles.submitButton}>{i18n.language === 'ja' ? '送信する' : 'Send'}</button>
                            </form>
                            {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default FAQ;
