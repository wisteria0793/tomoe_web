import { React, useContext } from 'react';
import styles from '../styles/Home.module.css';  // CSSファイルをインポート
import Facilities from '../components/Facilities';
import Faq from '../components/Faq';
import TopImage from '../components/TopImage';

// components
import StaySteps from '../components/StaySteps';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Access from '../components/Access';
import StaffProfiles from '../components/StaffProfiles';
import { useNavigate } from 'react-router-dom';  // 追加
import { useTranslation } from 'react-i18next';

function Home() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();  // 追加

    // 現在の言語設定をコンソールに表示
    console.log('Current language:', i18n.language);
    
    // 言語が変更されたときのログ
    i18n.on('languageChanged', (lng) => {
        console.log('Language changed to:', lng);
    });

    return (
        <>
            <Navbar />
            <div className={styles.home}>
                <TopImage />
                <main>
                    <div className={styles.explain_brief}>
                        <div className={styles.container}>
                            <div className="row align-items-start">
                                <div className="col-12 col-md-6"> {/* Bootstrapのグリッドシステムを使用 */}
                                    <div className={styles.image}>
                                        <img className={styles.image_only} src={`${process.env.PUBLIC_URL}/images/homephoto.jpg`} alt="Home" />
                                    </div>
                                </div>
                                <div className="col-11 col-md-6 m-auto"> {/* col-12は小さい画面で全幅、md以上の画面では6列 */}
                                    <div className={styles.text}>
                                        <p>
                                            {t('message')}
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    


                    {/* Facilitiesコンポーネントを表示 */}
                    <Facilities />
                    <StaySteps />
                    <Faq />
                    <StaffProfiles />
                    {/* <MapEmbed /> */}
                    <Access />

                    {/* <Contact /> */}



                </main>
            </div>
            <Footer />
        </>
    );
}

export default Home;
