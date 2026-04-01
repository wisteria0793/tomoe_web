import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaCalendarAlt, FaUsers, FaSearch } from "react-icons/fa";
import styles from "../../styles/Search.module.css";



const SearchBar = ({ onSearch }) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [activeSection, setActiveSection] = useState(null);
    const [guests, setGuests] = useState({
        adult: 1,
        child: 0,
        infant: 0,
    });

    const calendarRef = useRef(null);
    const guestMenuRef = useRef(null);

    const increment = (type) => {
        setGuests((prev) => ({
            ...prev,
            [type]: prev[type] + 1,
        }));
    };

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

    const decrement = (type) => {
        setGuests((prev) => ({
            ...prev,
            [type]: prev[type] > 0 ? prev[type] - 1 : 0,
        }));
    };

    const totalGuests = guests.adult + guests.child;

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
        onSearch({
            checkIn: dateRange[0],
            checkOut: dateRange[1],
            guests,
        });
    };




    return (
        <div className={styles.container}>
            {/* ゲスト人数選択 */}
            <div
                ref={guestMenuRef}
                className={styles.section}
                onClick={() =>
                    setActiveSection(activeSection === "guest" ? null : "guest")
                }
            >
                <FaUsers />
                <span>Guest {totalGuests} person</span>
                {activeSection === "guest" && (
                    <div className={styles.menu}>
                        {["adult", "child", "infant"].map((type, index) => (
                            <div key={index} className={styles.menuItem}>
                                <div>
                                    {type === "adult" ? "Adult" : type === "child" ? "Child" : "Infant"}
                                    {/* <small>
                                        {type === "adult"
                                            ? "13 years old"
                                            : type === "child"
                                                ? "Ages 2 to 12"
                                                : "Under 2 years old"}
                                    </small> */}
                                </div>
                                <div>
                                    <button
                                        className={styles.button}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            decrement(type);
                                        }}
                                    >
                                        −
                                    </button>
                                    <span>{guests[type]}</span>
                                    <button
                                        className={styles.button}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            increment(type);
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
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
                    <span className={styles.dateLabel}>Check in</span>
                    <span>
                        {dateRange[0]
                            ? dateRange[0].toLocaleDateString("en-US")
                            : "YYYY/MM/DD"}
                    </span>
                </div>
                <div className={styles.dateInput}>
                    <span className={styles.dateLabel}>Check out</span>
                    <span>
                        {dateRange[1]
                            ? dateRange[1].toLocaleDateString("en-US")
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
                            locale="en-US"
                            value={dateRange}
                        // tileDisabled={disableSpecificDate}
                        />
                        <div className={styles.footer}>
                            <button onClick={clearDates} className={styles.clearButton}>
                                Clear Date
                            </button>
                            <button
                                onClick={() => setActiveSection(null)}
                                className={styles.closeButton}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 検索ボタン */}
            <button className={styles.searchButton} onClick={handleSearch}>
                Search
            </button>

        </div>
    );
};

export default SearchBar;
