import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Navbar.module.css';
import { FaGlobe, FaAngleDown, FaShoppingBag, FaBars } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();

  const [isLanguageDropdownVisible, setLanguageDropdownVisible] = useState(false);
  const [isFacilityDropdownVisible, setFacilityDropdownVisible] = useState(false);
  const [isHeaderVisible, setHeaderVisible] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);

  const languageDropdownRef = useRef(null);
  const facilityDropdownRef = useRef(null);
  const drawerRef = useRef(null);
  const lastScrollY = useRef(0);

  /* =========================
      ドロップダウン制御（モバイル用）
  ========================== */
  const toggleLanguageDropdown = () => {
    setLanguageDropdownVisible(prev => !prev);
  };
  const toggleFacilityDropdown = () => {
    setFacilityDropdownVisible(prev => !prev);
  };
  const closeDropdowns = () => {
    setLanguageDropdownVisible(false);
    setFacilityDropdownVisible(false);
  };

  /* =========================
      メニュー開閉制御（モバイル用）
  ========================== */
  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
    if (!isMenuOpen) {
      closeDropdowns();
    }
  };

  const handleBackToMenu = () => {
    setFacilityDropdownVisible(false);
  };

  /* =========================
      スクロール制御
  ========================== */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        // 下にスクロール → ヘッダー隠す
        setHeaderVisible(false);
      } else {
        // 上にスクロール → ヘッダー表示
        setHeaderVisible(true);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* =========================
      クリック外制御（モバイル）
  ========================== */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMenuOpen) return; // メニュー閉じてるなら何もしない

      // ドロップダウン以外のクリックでドロップダウン閉じる
      if (
        languageDropdownRef.current && !languageDropdownRef.current.contains(event.target) &&
        facilityDropdownRef.current && !facilityDropdownRef.current.contains(event.target)
      ) {
        closeDropdowns();
      }
      // ドロワー領域以外(オーバーレイ)クリックでドロワー閉じる
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  return (
    <>
      {/* ====== ヘッダー (PC向けメニュー含む) ====== */}
      <header className={`${styles.header} ${isHeaderVisible ? styles.visible : styles.hidden}`}>
        <div className={styles.container}>
          {/* 左側: ロゴ */}
          <div className={styles.leftSection}>
            <div className={styles.logo}>
              <Link to="/">
                <img src={`${process.env.PUBLIC_URL}/tomoe_logo.png`} alt="Tomoe Logo" />
              </Link>
            </div>
          </div>

          {/* 右側: PC用メニュー & ハンバーガー */}
          <div className={styles.rightSection}>
            {/* ▼ PC用: topNavMenu / navMenu を横並びで表示 */}


            {/* ▼ モバイル用: ハンバーガーアイコン */}
            <div className={styles.hamburger} onClick={toggleMenu}>
              <FaBars />
            </div>
          </div>
        </div>
      </header>

      {/* ====== モバイルドロワーメニュー (Overlay + Drawer) ====== */}
      <div className={`${styles.drawerOverlay} ${isMenuOpen ? styles.active : ''}`}>
        <aside className={styles.drawerMenu} ref={drawerRef}>
          {/* 上部: Closeボタン & 検索バー */}
          <div className={styles.drawerHeader}>
            <button className={styles.closeBtn} onClick={toggleMenu}>
              <span className={styles.closeIcon}>×</span> Close
            </button>
          </div>

          {/* 中央: メニュー（モバイル用） */}
          <nav className={styles.drawerNav}>
            {/* 上部メニュー */}
            <ul className={styles.topNavMenu}>
                <li className={styles.dropdown} ref={facilityDropdownRef}>
                    <div
                        className={styles.dropdownToggle}
                        onClick={toggleFacilityDropdown}
                        role="button"
                        tabIndex={0}
                    >
                        {i18n.language === 'ja' ? '施設一覧' : 'Facilities'} →
                    </div>
                    <ul className={`${styles.facilityList} ${isFacilityDropdownVisible ? styles.active : ''}`}>
                        <li>
                            <button className={styles.backButton} onClick={handleBackToMenu}>
                                ← {i18n.language === 'ja' ? '戻る' : 'Back'}
                            </button>
                        </li>
                        <li><Link to="https://hakodate-tomoe.com/facility/87452" onClick={toggleMenu}>{t('navbar.facilityList.facility1')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/121308" onClick={toggleMenu}>{t('navbar.facilityList.facility2')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/168898" onClick={toggleMenu}>{t('navbar.facilityList.facility3')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/189698" onClick={toggleMenu}>{t('navbar.facilityList.facility4')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/236983" onClick={toggleMenu}>{t('navbar.facilityList.facility5')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/227305" onClick={toggleMenu}>{t('navbar.facilityList.facility6')}</Link></li>
                        <li><Link to="https://hakodate-tomoe.com/facility/240636" onClick={toggleMenu}>{t('navbar.facilityList.facility7')}</Link></li>
                    </ul>
                </li>
            </ul>

            {/* 下部メニュー */}
            <ul className={styles.navMenu}>


                <li>
                    <Link to="/faq" onClick={toggleMenu}>
                        FAQ
                    </Link>
                </li>
                <li>
                    <Link to="/faq#contact" onClick={toggleMenu}>
                        {t('navbar.contact')}
                    </Link>
                </li>
                <li>
                    <Link to="/shop" onClick={toggleMenu}>
                        <FaShoppingBag /> {t('navbar.shop')}
                    </Link>
                </li>
                <li>
                    <a href="https://www.hakodate-shino.com/" target="_blank" rel="noopener noreferrer" onClick={toggleMenu}>
                        {t('navbar.company')}
                    </a>
                </li>
            </ul>
          </nav>

          {/* 下部フッター: 例として言語ボタンなど */}
          <div className={styles.drawerFooter}>
            <div className={styles.drawerLanguage}>
              <span className={styles.languageIcon}>🌐</span> Language
            </div>
            <div className={styles.drawerLangButtons}>
              {/* <Link to="/ja" className={styles.langBtn}>日本語</Link>
              <Link to="/en" className={styles.langBtn}>English</Link> */}
              <button className={styles.langBtn} onClick={() => changeLanguage('ja')}>{t('navbar.japanese')}</button>
              <button className={styles.langBtn} onClick={() => changeLanguage('en')}>{t('navbar.english')}</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Navbar;
