import { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

const fmt = (n) => Number(n).toLocaleString('uk-UA');

export default function CartDrawer({ onCheckout }) {
  const { lang, cart, cartCount, cartTotal, cartOpen, setCartOpen, removeFromCart, updateQty } = useApp();
  const t = useT(lang);

  useEffect(() => {
    if (cartOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  if (!cartOpen) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={() => setCartOpen(false)} />
      <aside className="drawer">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>{t.cart.title}</h2>
            {cartCount > 0 && (
              <span className="tag tag-blue">{cartCount} {t.cart.items}</span>
            )}
          </div>
          <button className="btn btn-ghost" style={{ padding: 7 }} onClick={() => setCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text2)' }}>
              <ShoppingBag size={52} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: 17, fontFamily: 'var(--font-head)', fontWeight: 600, marginBottom: 8 }}>{t.cart.empty}</p>
              <p style={{ fontSize: 14, opacity: 0.7 }}>{t.cart.emptyHint}</p>
            </div>
          ) : (
            cart.map(item => {
              const name = item[`name_${lang}`] || item.name_ua || item.name;
              return (
                <div key={item.id} className="cart-item">
                  <img
                    className="cart-item-img"
                    src={item.image || ''}
                    alt={name}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=60'; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cart-item-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    <p className="cart-item-price">{fmt(item.price * item.qty)} {t.currency}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={13} /></button>
                        <span className="qty-value">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={13} /></button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '4px 0', opacity: 0.8, transition: 'opacity .15s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ color: 'var(--text2)', fontSize: 15 }}>{t.cart.total}</span>
              <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
                {fmt(cartTotal)} <span style={{ fontSize: 14, color: 'var(--text2)' }}>{t.currency}</span>
              </span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setCartOpen(false); onCheckout(); }}
            >
              {t.cart.checkout} →
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
