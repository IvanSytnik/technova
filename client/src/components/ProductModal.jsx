import { useEffect } from 'react';
import { X, Star, ShoppingCart, Heart, Shield, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

const fmt = (n) => Number(n).toLocaleString('uk-UA');

export default function ProductModal({ product, onClose }) {
  const { lang, addToCart, toggleWishlist, wishlist, cart, notify } = useApp();
  const t = useT(lang);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [onClose]);

  const name = product[`name_${lang}`] || product.name_ua;
  const desc = product[`description_${lang}`] || product.description_ua;
  const inCart = cart.some(i => i.id === product.id);
  const inWish = wishlist.includes(product.id);

  let specs = {};
  try { specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs || {}; } catch {}

  const handleAdd = () => {
    if (!product.in_stock) return;
    addToCart({ ...product, name });
    notify(lang === 'ua' ? 'Товар додано до кошика ✓' : 'Product added to cart ✓');
    onClose();
  };

  const badge = product.badge;
  const badgeClass = badge === 'new' ? 'badge-new' : badge === 'sale' ? 'badge-sale' : 'badge-hit';
  const badgeLabel = badge === 'new' ? t.newBadge : badge === 'sale' ? t.saleBadge : t.hitBadge;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={17} /></button>

        {/* Image */}
        <div style={{ position: 'relative', minHeight: 380, overflow: 'hidden', background: 'var(--card)' }}>
          <img
            src={product.image || ''}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70'; }}
          />
          {badge && <span className={`product-badge ${badgeClass}`} style={{ top: 16, left: 16, fontSize: 11, padding: '5px 12px' }}>{badgeLabel}</span>}
          {/* Discount */}
          {product.old_price && (
            <span style={{ position: 'absolute', bottom: 16, left: 16, background: 'var(--red)', color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '32px 28px', overflowY: 'auto', maxHeight: '90vh' }}>
          <p style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{product.sku}</p>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 21, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>{name}</h2>

          <div className="product-rating" style={{ marginBottom: 14 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} color={i < Math.floor(product.rating) ? '#f59e0b' : 'var(--border2)'} />
            ))}
            <span style={{ fontSize: 13, color: 'var(--text2)', marginLeft: 4 }}>{product.rating} ({product.reviews_count} {t.reviews})</span>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 20 }}>{desc}</p>

          {/* Price */}
          <div style={{ marginBottom: 18 }}>
            <span className="mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>{fmt(product.price)}</span>
            <span className="mono" style={{ fontSize: 15, color: 'var(--text2)', marginLeft: 6 }}>{t.currency}</span>
            {product.old_price && (
              <span className="mono" style={{ fontSize: 16, color: 'var(--text2)', textDecoration: 'line-through', marginLeft: 12 }}>{fmt(product.old_price)}</span>
            )}
          </div>

          {/* Stock status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: product.in_stock ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${product.in_stock ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 'var(--radius)', marginBottom: 18 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: product.in_stock ? 'var(--green)' : 'var(--red)' }} />
            <span style={{ fontSize: 13, color: product.in_stock ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {product.in_stock ? t.inStock : t.noStock}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 'auto' }}>{t.warranty}: {product.warranty}</span>
          </div>

          {/* Specs */}
          {Object.keys(specs).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>{t.specs}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--card)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 12, fontWeight: 600 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
              <Shield size={14} color="var(--green)" />{product.warranty}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
              <Truck size={14} color="var(--accent)" />{lang === 'ua' ? 'Доставка 1–3 дні' : 'Delivery 1–3 days'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`btn btn-primary${inCart ? ' btn-incart' : ''}`}
              onClick={handleAdd}
              disabled={!product.in_stock}
              style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '13px', opacity: product.in_stock ? 1 : 0.45 }}
            >
              <ShoppingCart size={16} />
              {inCart ? t.inCart : t.addToCart}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => toggleWishlist(product.id)}
              style={{ padding: '13px 14px', color: inWish ? '#f43f5e' : 'var(--text2)', borderColor: inWish ? '#f43f5e' : undefined }}
            >
              <Heart size={16} fill={inWish ? '#f43f5e' : 'none'} />
            </button>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:640px){.modal{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
