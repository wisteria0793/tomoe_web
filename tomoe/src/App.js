import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Reservation from './pages/Reservation';
import FacilityDetail from './pages/FacilityDetail'; // 詳細ページコンポーネント
import ReservationDetails from './pages/ReservationDetails.js';
import Success from './pages/Success.js';
import Cancel from './pages/Cancel.js';

import PrivacyPolicy from './pages/PrivacyPolicy';
import Shop from './pages/Shop';
import Payment from './pages/Payment';
import Faq from './pages/FAQ.js';



function App() {

  return (

    <Router>
      <div>

        {/* <Navbar />   */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/facility/:id" element={<FacilityDetail />} /> {/* 遷移先のルート */}
          <Route path="/reservationDetails" element={<ReservationDetails />} /> {/* 遷移先のルート */}
          <Route path="/success" element={<Success />} /> {/* 遷移先のルート */}
          <Route path="/cancel" element={<Cancel />} /> {/* 遷移先のルート */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/faq" element={<Faq />} />
          
        </Routes>
      </div>
    </Router>

  );
}

export default App;
