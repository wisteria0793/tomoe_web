import React from 'react';
import styles from '../styles/PrivacyPolicy.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function PrivacyPolicy() {
    return (
	<>
	<Navbar />
        <div className={styles.container}>
            <div className={styles.wrapper}>

                <h1>Privacy Policy</h1>
                <p>Last Updated: October 1, 2023</p>

                <h2>1. Information Collection</h2>
                <p>
                    Our site collects information provided by users (such as name and email address).
                    We also automatically collect information regarding the use of the site (such as IP address, browser type, etc.).
                </p>

                <h2>2. Use of Information</h2>
                <p>
                    The information we collect is used for the following purposes:
                    <ul>
                        <li>Providing and improving our services</li>
                        <li>Offering user support</li>
                        <li>Marketing and promotional activities</li>
                    </ul>
                </p>

                <h2>3. Information Sharing</h2>
                <p>
                    Our site does not share personal information with third parties without user consent.
                    However, exceptions may apply in cases where there are legal obligations or when it is necessary for service provision.
                </p>

                <h2>4. Cookies</h2>
                <p>
                    Our site uses cookies to enhance user experience.
                    Cookies are small data files stored on the user’s browser.
                </p>

                <h2>5. Security</h2>
                <p>
                    We take appropriate security measures to protect users' personal information.
                    However, we cannot guarantee complete security of information transmitted over the internet.
                </p>

                <h2>6. Changes to the Privacy Policy</h2>
                <p>
                    Our site reserves the right to modify this Privacy Policy at any time.
                    Any changes will be posted on this page.
                </p>

                <h2>7. Contact Us</h2>
                <p>
                    If you have any questions or concerns regarding this Privacy Policy, please contact us at the following address:
                    <br />
                    Email: hakodateshino0901@gmail.com
                </p>
            </div>
        </div>
	<Footer />
	</>
    );
}

export default PrivacyPolicy;
