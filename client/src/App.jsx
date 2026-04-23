import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Notification from './components/Notification';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import AdminPage from './pages/AdminPage';
import './styles/globals.css';

function Layout() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Header />
      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
      <Notification />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 64, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8 }}>Сторінку не знайдено</h1>
        <a href="/" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>← На головну</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
