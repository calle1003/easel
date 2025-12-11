import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Layout from './components/Layout';

// ページ遷移時にスクロール位置をトップにリセット（瞬時に）
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Pages
import Top from './pages/Top';
import About from './pages/About';
import Community from './pages/Community';
import Contact from './pages/Contact';
import Goods from './pages/Goods';

// easel-live
import EaselLiveTop from './pages/easel-live/EaselLiveTop';
import Vol1Detail from './pages/easel-live/vol1/Detail';
import Vol1Gallery from './pages/easel-live/vol1/Gallery';
import Vol2Detail from './pages/easel-live/vol2/Detail';

// ticket
import Purchase from './pages/ticket/Purchase';
import Confirm from './pages/ticket/Confirm';
import Success from './pages/ticket/Success';
import Cancel from './pages/ticket/Cancel';

// news
import NewsList from './pages/news/List';
import NewsDetail from './pages/news/Detail';

// admin
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import NewsAdmin from './pages/admin/NewsAdmin';
import PerformancesAdmin from './pages/admin/PerformancesAdmin';
import ExchangeCodesAdmin from './pages/admin/ExchangeCodesAdmin';
import TicketsAdmin from './pages/admin/TicketsAdmin';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<Layout />}>
          {/* Top */}
          <Route path="/" element={<Top />} />
          
          {/* About */}
          <Route path="/about" element={<About />} />
          
          {/* easel LIVE */}
          <Route path="/easel-live" element={<EaselLiveTop />} />
          <Route path="/easel-live/vol1" element={<Vol1Detail />} />
          <Route path="/easel-live/vol1/gallery" element={<Vol1Gallery />} />
          <Route path="/easel-live/vol2" element={<Vol2Detail />} />
            
          {/* Ticket (Vol.2) */}
          <Route path="/easel-live/vol2/ticket" element={<Purchase />} />
          <Route path="/easel-live/vol2/ticket/confirm" element={<Confirm />} />
          <Route path="/easel-live/vol2/ticket/success" element={<Success />} />
          <Route path="/easel-live/vol2/ticket/cancel" element={<Cancel />} />
          
          {/* Community */}
          <Route path="/community" element={<Community />} />
          
          {/* Goods */}
          <Route path="/goods" element={<Goods />} />
          
          {/* News */}
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          
          {/* Contact */}
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Admin Login (no auth required) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Routes (auth required) */}
        <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/admin/news" element={<AdminLayout><NewsAdmin /></AdminLayout>} />
        <Route path="/admin/performances" element={<AdminLayout><PerformancesAdmin /></AdminLayout>} />
        <Route path="/admin/exchange-codes" element={<AdminLayout><ExchangeCodesAdmin /></AdminLayout>} />
        <Route path="/admin/tickets" element={<AdminLayout><TicketsAdmin /></AdminLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
