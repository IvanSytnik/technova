import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const CATS = ['all', 'laptops', 'monitors', 'desktops', 'components', 'peripherals', 'headphones'];

export default function CatalogPage() {
  const { lang } = useApp();
  const t = useT(lang);
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalProduct, setModalProduct] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);

  const cat = searchParams.get('cat') || 'all';
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  const load = useCallback(() => {
    setLoading(true);
    getProducts({ category: cat, search, sort })
      .then(r => { setProducts(r.products || []); setTotal(r.total || 0); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cat, search, sort]);

  useEffect(() => { load(); }, [load]);

  const sortOptions = [
    ['newest', t.sort.newest],
    ['popular', t.sort.popular],
    ['price_asc', t.sort.price_asc],
    ['price_desc', t.sort.price_desc],
    ['rating', t.sort.rating],
  ];

  const currentSortLabel = sortOptions.find(([v]) => v === sort)?.[1] || t.sort.newest;

  return (
    <>
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {t.catalogTitle || (lang === 'ua' ? 'Каталог товарів' : 'Product Catalog')}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text2)' }}>
            {t.showing} <strong style={{ color: 'var(--text)' }}>{total}</strong> {t.products}
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px 64px' }}>
        {/* Filters bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: 220, maxWidth: 360 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setParam('q', e.target.value)}
              placeholder={t.search}
              className="form-input"
              style={{ paddingLeft: 36, paddingRight: search ? 36 : 14 }}
            />
            {search && (
              <button onClick={() => setParam('q', '')} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              className="btn btn-outline btn-sm"
              style={{ gap: 8, minWidth: 180 }}
            >
              <SlidersHorizontal size={13} />
              {t.sortLabel}: <strong>{currentSortLabel}</strong>
              <ChevronDown size={13} style={{ marginLeft: 'auto' }} />
            </button>
            {sortOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 6, zIndex: 200, minWidth: 180, boxShadow: '0 16px 40px rgba(0,0,0,.45)' }}>
                {sortOptions.map(([v, l]) => (
                  <button key={v} onClick={() => { setParam('sort', v); setSortOpen(false); }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', background: sort === v ? 'var(--accent-dim)' : 'none', border: 'none', borderRadius: 8, color: sort === v ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', transition: 'background .15s', fontWeight: sort === v ? 600 : 400 }}
                    onMouseEnter={e => { if (sort !== v) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                    onMouseLeave={e => { if (sort !== v) e.currentTarget.style.background = 'none'; }}
                  >{l}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => setParam('cat', c === 'all' ? '' : c)}
              style={{
                padding: '8px 16px', borderRadius: 10, border: `1px solid ${cat === c ? 'var(--accent)' : 'var(--border)'}`,
                background: cat === c ? 'var(--accent-dim)' : 'none',
                color: cat === c ? 'var(--accent)' : 'var(--text2)',
                cursor: 'pointer', fontSize: 13, fontWeight: cat === c ? 700 : 400,
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'all .18s',
              }}
              onMouseEnter={e => { if (cat !== c) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
              onMouseLeave={e => { if (cat !== c) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; } }}
            >
              {t.categories[c]}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', height: 360, animation: 'pulse-skeleton 1.5s ease infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text2)' }}>
            <Search size={52} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
            <p style={{ fontFamily: 'var(--font-head)', fontSize: 20, marginBottom: 8 }}>{t.noResults}</p>
            <button className="btn btn-outline btn-sm" onClick={() => { setParam('q', ''); setParam('cat', ''); }}>
              {lang === 'ua' ? 'Скинути фільтри' : 'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p, i) => (
              <div key={p.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={p} onDetail={setModalProduct} />
              </div>
            ))}
          </div>
        )}
      </div>

      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}

      <style>{`
        @keyframes pulse-skeleton {
          0%,100%{opacity:1} 50%{opacity:.5}
        }
      `}</style>
    </>
  );
}
