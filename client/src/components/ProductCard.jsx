import { Star, Heart, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

const fmt = (n) => Number(n).toLocaleString('uk-UA');

export default function ProductCard({ product, onDetail }) {
  const { lang, addToCart, toggleWishlist, wishlist, cart, notify } = useApp();
  const t = useT(lang);
  const name = product[`name_${lang}`] || product.name_ua;
  const inCart = cart.some(i => i.id === product.id);
  const inWish = wishlist.includes(product.id);
  const badge = product.badge;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!product.in_stock) return;
    addToCart({ ...product, name: name });
    notify(lang === 'ua' ? `"${name.slice(0,24)}..." додано до кошика` : `"${name.slice(0,24)}..." added to cart`);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const badgeClass = badge === 'new' ? 'badge-new' : badge === 'sale' ? 'badge-sale' : 'badge-hit';
  const badgeLabel = badge === 'new' ? t.newBadge : badge === 'sale' ? t.saleBadge : t.hitBadge;

  return (
    <div className="card product-card" onClick={() => onDetail(product)}>
      <div className="product-img-wrap">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70'}
          alt={name}
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=70'; }}
        />
        {badge && <span className={`product-badge ${badgeClass}`}>{badgeLabel}</span>}
        <button
          className={`product-wish${inWish ? ' active' : ''}`}
          onClick={handleWish}
          title={t.wishlist}
        >
          <Heart size={15} fill={inWish ? '#f43f5e' : 'none'} color={inWish ? '#f43f5e' : 'currentColor'} />
        </button>
      </div>

      <div className="product-body">
        <p className="product-cat">{t.categories[product.category] || product.category}</p>
        <h3 className="product-name">{name}</h3>

        <div className="product-rating">
          <div className="product-stars">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11}
                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                color={i < Math.floor(product.rating) ? '#f59e0b' : 'var(--border2)'}
              />
            ))}
          </div>
          <span className="product-rating-text">{product.rating} ({product.reviews_count})</span>
        </div>

        <div className="product-price-row">
          <span className="product-price">{fmt(product.price)}</span>
          <span className="product-currency">{t.currency}</span>
          {product.old_price && (
            <span className="product-old-price">{fmt(product.old_price)}</span>
          )}
        </div>

        <div className="product-actions" onClick={e => e.stopPropagation()}>
          <button
            className={`btn btn-primary${inCart ? ' btn-incart' : ''}`}
            onClick={handleAdd}
            disabled={!product.in_stock}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: 9, opacity: product.in_stock ? 1 : 0.45 }}
          >
            {!product.in_stock ? t.outOfStock : inCart ? t.inCart : t.addToCart}
          </button>
          <button className="product-actions btn-detail" onClick={() => onDetail(product)} title={t.details}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
