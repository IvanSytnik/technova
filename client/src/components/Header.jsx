import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Globe, Cpu, Menu, X, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

export default function Header() {
  const { lang, switchLang, cartCount, cartTotal, setCartOpen, wishlist, adminToken } = useApp();
  const t = useT(lang);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const fmt = (n) => Number(n).toLocaleString('uk-UA');

  const navLinks = [
    { to: '/', label: t.nav.home },
    { to: '/catalog', label: t.nav.catalog },
    ...(adminToken ? [{ to: '/admin', label: t.nav.admin }] : []),
  ];

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon"><Cpu size={18} color="#fff" /></div>
          Tech<em>Nova</em>
        </Link>

        <nav className="nav">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`nav-link${pathname === l.to ? ' active' : ''}`}>{l.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          {/* Language toggle */}
          <button
            onClick={() => switchLang(lang === 'ua' ? 'en' : 'ua')}
            className="btn btn-outline btn-sm"
            style={{ gap: 6, padding: '6px 12px' }}
          >
            <Globe size={13} />
            {lang.toUpperCase()}
          </button>

          {/* Wishlist */}
          {wishlist.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button className="btn-ghost btn" style={{ padding: 8 }}>
                <Heart size={18} />
              </button>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#f43f5e', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlist.length}
              </span>
            </div>
          )}

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ position: 'relative', gap: 8 }}
          >
            <ShoppingCart size={16} />
            {cartCount > 0 ? (
              <>
                <span className="mono" style={{ fontSize: 12 }}>{fmt(cartTotal)}</span>
                <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cartCount}
                </span>
              </>
            ) : (
              <span>{t.cart.title}</span>
            )}
          </button>

          {/* Mobile menu */}
          <button className="btn-ghost btn" style={{ display: 'none', padding: 8 }} onClick={() => setMobileOpen(!mobileOpen)} id="mobile-menu-btn">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className="nav-link" style={{ display: 'block', padding: '10px 4px' }} onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`@media(max-width:640px){#mobile-menu-btn{display:flex!important;}}`}</style>
    </header>
  );
}
