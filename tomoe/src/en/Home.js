import { React, useContext } from 'react';
import styles from '../styles/Home.module.css';  // CSSファイルをインポート
import EnFacilities from './components/Facilities';
import Faq from './components/Faq';
import TopImage from './components/TopImage';

import StaySteps from './components/StaySteps';
import Navbar from './components/Navbar';  // ナビゲーションバーのインポート
import Footer from './components/Footer';





function Home() {


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
                                        <img className={styles.image_only} src="/images/homephoto.jpg" alt="Home" />
                                    </div>
                                </div>
                                <div className="col-11 col-md-6 m-auto"> {/* col-12は小さい画面で全幅、md以上の画面では6列 */}
                                    <div className={styles.text}>
                                        <p>
                                            Guesthouse Tomoe.com opened its first building in 2018, followed by the launch of the Onepiece House the next year.
                                            Currently, we operate six facilities and manage one additional property, each with a unique concept.
                                            From simple, tranquil atmospheres to highly themed spaces showcasing figures and decorations, our designs combine comfort and individuality to provide guests with a truly special experience.
                                            Today, we welcome many visitors from both Japan and abroad.
                                            At Tomoe.com, we strive every day to enhance our services, ensuring an unforgettable stay for all our guests and the local community in Hakodate.
                                        </p>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Facilitiesコンポーネントを表示 */}
                    <EnFacilities />
                    <StaySteps />
                    <Faq />

                    {/* <Contact /> */}



                </main>
            </div>
	<Footer />
        </>
    );
}

export default Home;
