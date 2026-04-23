import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Lock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&q=80',
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=700&q=80',
  'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=700&q=80',
];

export default function HomePage() {
  const { lang } = useApp();
  const t = useT(lang);
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    getProducts({ featured: 'true', limit: 4 }).then(r => setFeatured(r.products || [])).catch(() => {});
    getProducts({ sort: 'popular', limit: 8 }).then(r => setPopular(r.products || [])).catch(() => {});
    const iv = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(iv);
  }, []);

  const featureIcons = [Shield, Truck, RefreshCw, Lock];

  return (
    <>
      {/* HERO */}
      <section className="hero" style={{ background: 'linear-gradient(160deg, var(--bg) 0%, var(--bg2) 50%, var(--bg) 100%)' }}>
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-grid">
            <div className="fade-in">
              <div className="hero-badge">
                <div className="hero-dot" />
                {t.hero.badge}
              </div>
              <h1 className="hero-title">
                {t.hero.title1}<br />
                <span style={{ color: 'var(--accent)' }}>{t.hero.title2}</span>
              </h1>
              <p className="hero-sub">{t.hero.sub}</p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalog')} style={{ gap: 8 }}>
                  {t.hero.cta} <ArrowRight size={16} />
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/catalog')}>
                  {t.hero.cta2}
                </button>
              </div>
              <div className="hero-stats">
                {[['500+', lang === 'ua' ? 'Товарів' : 'Products'], ['50K+', lang === 'ua' ? 'Клієнтів' : 'Customers'], ['4.9★', lang === 'ua' ? 'Рейтинг' : 'Rating'], ['5р', lang === 'ua' ? 'На ринку' : 'On Market']].map(([n, l]) => (
                  <div key={l}>
                    <p className="hero-stat-n">{n}</p>
                    <p className="hero-stat-l">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero image carousel */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '4/3', background: 'var(--card)', border: '1px solid var(--border)' }}>
              {HERO_IMAGES.map((src, i) => (
                <img key={src} src={src} alt="Tech" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === heroImg ? 1 : 0, transition: 'opacity 0.8s ease' }} />
              ))}
              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                {HERO_IMAGES.map((_, i) => (
                  <button key={i} onClick={() => setHeroImg(i)} style={{ width: i === heroImg ? 20 : 6, height: 6, borderRadius: 3, background: i === heroImg ? 'var(--accent)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '32px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="container">
          <div className="features-grid">
            {t.features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={i} className="feature-card">
                  <div className="feature-icon"><Icon size={18} color="var(--accent)" /></div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-head)', fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{f.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {lang === 'ua' ? '⭐ Рекомендовані' : '⭐ Featured'}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
                  {lang === 'ua' ? 'Наш вибір для вас' : 'Our pick for you'}
                </p>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalog')} style={{ gap: 6 }}>
                {lang === 'ua' ? 'Всі товари' : 'All Products'} <ChevronRight size={14} />
              </button>
            </div>
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} onDetail={setModalProduct} />)}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES BANNER */}
      <section className="section-sm" style={{ background: 'var(--bg2)' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 800, marginBottom: 20, letterSpacing: '-0.02em' }}>
            {lang === 'ua' ? 'Категорії товарів' : 'Product Categories'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { key: 'laptops', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&q=70' },
              { key: 'monitors', img: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=300&q=70' },
              { key: 'desktops', img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&q=70' },
              { key: 'components', img: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&q=70' },
              { key: 'peripherals', img: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300&q=70' },
              { key: 'headphones', img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&q=70' },
            ].map(c => (
              <button
                key={c.key}
                onClick={() => navigate(`/catalog?cat=${c.key}`)}
                style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', background: 'none', cursor: 'pointer', aspectRatio: '1', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <img src={c.img} alt={t.categories[c.key]} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)', display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                  <span style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.categories[c.key]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR */}
      {popular.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {lang === 'ua' ? '🔥 Популярні товари' : '🔥 Popular Products'}
                </h2>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalog')} style={{ gap: 6 }}>
                {lang === 'ua' ? 'Дивитись всі' : 'View All'} <ChevronRight size={14} />
              </button>
            </div>
            <div className="products-grid">
              {popular.map(p => <ProductCard key={p.id} product={p} onDetail={setModalProduct} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section style={{ padding: '64px 0', background: 'linear-gradient(135deg, #0f1e3d, #162a50)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
            {lang === 'ua' ? 'Не знайшли потрібне?' : "Can't find what you need?"}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 480, margin: '0 auto 32px' }}>
            {lang === 'ua' ? 'Зв\'яжіться з нами — підберемо ідеальне рішення саме для вас.' : "Contact us — we'll find the perfect solution for you."}
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalog')} style={{ gap: 8 }}>
            {t.hero.cta} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}
    </>
  );
}
