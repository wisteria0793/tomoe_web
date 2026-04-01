import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt, FaUsers, FaSearch } from "react-icons/fa";
import styles from "../styles/Search.module.css";
import { useTranslation } from 'react-i18next';

const SearchBar = ({ onSearch }) => {
    const { t, i18n } = useTranslation();
    const savedData = JSON.parse(sessionStorage.getItem('searchData')) || {};

    const [dateRange, setDateRange] = useState([
        savedData.checkIn ? new Date(savedData.checkIn) : null,
        savedData.checkOut ? new Date(savedData.checkOut) : null,
    ]);

    const [activeSection, setActiveSection] = useState(null);

    const [guests, setGuests] = useState(() => {
        if (typeof savedData.guests === 'object' && savedData.guests !== null) {
            return savedData.guests.adult + (savedData.guests.child || 0);
        }
        return typeof savedData.guests === 'number' ? savedData.guests : 1;
    });

    const calendarRef = useRef(null);
    const guestMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                (calendarRef.current && calendarRef.current.contains(event.target)) ||
                (guestMenuRef.current && guestMenuRef.current.contains(event.target))
            ) {
                return;
            }
            setActiveSection(null);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateChange = (range) => {
        if (Array.isArray(range) && range.length === 2) {
            setDateRange(range);
        }
    };

    const clearDates = () => {
        setDateRange([null, null]);
    };

    const formatDay = (locale, date) => {
        return date.getDate();
    };

    const handleSearch = () => {
        const searchData = {
            checkIn: dateRange[0]?.toISOString().split('T')[0] || null,
            checkOut: dateRange[1]?.toISOString().split('T')[0] || null,
            guests: Number(guests)
        };

        sessionStorage.setItem('searchData', JSON.stringify(searchData));

        onSearch(searchData);
    };

    return (
        <div className={styles.container}>
            {/* ゲスト人数選択 */}
            <div
                ref={guestMenuRef}
                className={styles.section}
                onClick={() => setActiveSection(activeSection === "guest" ? null : "guest")}
            >
                <FaUsers />
                <span>
                    {i18n.language === 'ja' ? 'ゲスト' : 'Guests'} {Number(guests)}{i18n.language === 'ja' ? '名' : ''}
                </span>
                {activeSection === "guest" && (
                    <div className={styles.menu}>
                        <div className={styles.menuItem}>
                            <div>
                                {i18n.language === 'ja' ? "宿泊人数" : "Number of Guests"}
                            </div>
                            <div>
                                <button
                                    className={styles.button}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (guests > 1) {
                                            setGuests(guests - 1);
                                        }
                                    }}
                                >
                                    −
                                </button>
                                <span>{guests}</span>
                                <button
                                    className={styles.button}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setGuests(guests + 1);
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* カレンダー */}
            <div
                className={styles.datePickerWrapper}
                onClick={() =>
                    setActiveSection(activeSection === "calendar" ? null : "calendar")
                }
            >
                <div className={styles.dateInput}>
                    <span className={styles.dateLabel}>{i18n.language === 'ja' ? 'チェックイン' : 'Check-in'}</span>
                    <span>
                        {dateRange[0]
                            ? dateRange[0].toLocaleDateString("ja-JP")
                            : "YYYY/MM/DD"}
                    </span>
                </div>
                <div className={styles.dateInput}>
                    <span className={styles.dateLabel}>{i18n.language === 'ja' ? 'チェックアウト' : 'Check-out'}</span>
                    <span>
                        {dateRange[1]
                            ? dateRange[1].toLocaleDateString("ja-JP")
                            : "YYYY/MM/DD"}
                    </span>
                </div>
                {activeSection === "calendar" && (
                    <div
                        className={styles.calendarPopup}
                        ref={calendarRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Calendar
                            onChange={handleDateChange}
                            selectRange={true}
                            formatDay={formatDay}
                            locale={i18n.language === 'ja' ? 'ja-JP' : 'en-US'}
                            value={dateRange}
                        />
                        <div className={styles.footer}>
                            <button onClick={clearDates} className={styles.clearButton}>
                                {i18n.language === 'ja' ? '日付をクリア' : 'Clear Dates'}
                            </button>
                            <button
                                onClick={() => setActiveSection(null)}
                                className={styles.closeButton}
                            >
                                {i18n.language === 'ja' ? '閉じる' : 'Close'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 検索ボタン */}
            <button className={styles.searchButton} onClick={handleSearch}>
                {i18n.language === 'ja' ? '検索' : 'Search'}
            </button>
        </div>
    );
};

export default SearchBar;
