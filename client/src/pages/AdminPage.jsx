import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, LogOut,
  Plus, Pencil, Trash2, X, Check, Loader,
  TrendingUp, Clock, DollarSign, Eye, ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { login as apiLogin, getProducts, createProduct, updateProduct, deleteProduct, getOrders, updateOrderStatus, getOrderStats } from '../api';

const fmt = (n) => Number(n || 0).toLocaleString('uk-UA');

// ─── LOGIN ──────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const { lang } = useApp();
  const t = useT(lang).admin;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await apiLogin(username, password);
      onLogin(res.token, res.admin);
    } catch {
      setError(t.invalidCreds);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <LayoutDashboard size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800 }}>TechNova Admin</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>{t.login}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.username}</label>
            <input value={username} onChange={e => setUsername(e.target.value)} className="form-input" autoComplete="username" required />
          </div>
          <div className="form-group">
            <label className="form-label">{t.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" autoComplete="current-password" required />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4 }} disabled={loading}>
            {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : t.loginBtn}
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text2)', marginTop: 16, opacity: 0.7 }}>
          Default: admin / admin123
        </p>
      </div>
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────
function ProductForm({ product, onSave, onCancel, token, lang }) {
  const t = useT(lang).admin;
  const cats = ['laptops', 'monitors', 'desktops', 'components', 'peripherals', 'headphones'];
  const [form, setForm] = useState({
    name_ua: '', name_en: '', description_ua: '', description_en: '',
    category: 'laptops', price: '', old_price: '', image_url: '',
    in_stock: true, badge: '', featured: false, warranty: '1 рік / 1 year', sku: '',
    specs: '{}',
    ...product,
    price: product?.price || '',
    old_price: product?.old_price || '',
    in_stock: product ? Boolean(product.in_stock) : true,
    featured: product ? Boolean(product.featured) : false,
    badge: product?.badge || '',
    image_url: product?.image || '',
    specs: product?.specs
      ? (typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs, null, 2))
      : '{}',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specsError, setSpecsError] = useState('');

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate JSON specs
    try { JSON.parse(form.specs); setSpecsError(''); } catch { setSpecsError('Invalid JSON'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k !== 'image_url' || !file) fd.append(k, v === null ? '' : v);
    });
    if (file) fd.append('image', file);

    setLoading(true); setError('');
    try {
      if (product?.id) await updateProduct(product.id, fd, token);
      else await createProduct(fd, token);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (key, type = 'text') => ({
    value: form[key] ?? '',
    onChange: e => f(key, type === 'checkbox' ? e.target.checked : e.target.value),
    className: 'form-input',
    type,
  });

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}><X size={17} /></button>
        <div style={{ padding: '28px 32px', overflowY: 'auto', maxHeight: '90vh' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
            {product ? t.editProduct : t.addProduct}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.name_ua} *</label>
                <input {...inputProps('name_ua')} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t.name_en} *</label>
                <input {...inputProps('name_en')} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.desc_ua}</label>
                <textarea {...inputProps('description_ua')} className="form-input form-textarea" />
              </div>
              <div className="form-group">
                <label className="form-label">{t.desc_en}</label>
                <textarea {...inputProps('description_en')} className="form-input form-textarea" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.category} *</label>
                <select {...inputProps('category')} className="form-input form-select">
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t.badge}</label>
                <select value={form.badge} onChange={e => f('badge', e.target.value)} className="form-input form-select">
                  <option value="">— {lang === 'ua' ? 'Без бейджа' : 'No badge'} —</option>
                  <option value="new">{lang === 'ua' ? 'Новинка' : 'New'}</option>
                  <option value="sale">{lang === 'ua' ? 'Акція' : 'Sale'}</option>
                  <option value="hit">{lang === 'ua' ? 'Хіт' : 'Best Seller'}</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.price} *</label>
                <input {...inputProps('price', 'number')} min="0" required />
              </div>
              <div className="form-group">
                <label className="form-label">{t.old_price}</label>
                <input {...inputProps('old_price', 'number')} min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.warranty}</label>
                <input {...inputProps('warranty')} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.sku}</label>
                <input {...inputProps('sku')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t.image_url}</label>
              <input {...inputProps('image_url')} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label className="form-label">{t.uploadImg}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="form-input" style={{ padding: '8px 14px' }} />
              {(file || form.image_url) && (
                <img src={file ? URL.createObjectURL(file) : form.image_url} alt="" style={{ marginTop: 8, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} onError={e => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">{t.specs} (JSON)</label>
              <textarea
                value={form.specs}
                onChange={e => { f('specs', e.target.value); setSpecsError(''); }}
                className="form-input form-textarea"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, minHeight: 100 }}
              />
              {specsError && <p className="form-error">{specsError}</p>}
            </div>
            <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
              {[['in_stock', t.in_stock], ['featured', t.featured]].map(([k, l]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input type="checkbox" checked={Boolean(form[k])} onChange={e => f(k, e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--accent)' }} />
                  {l}
                </label>
              ))}
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                {loading ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <><Check size={15} />{t.save}</>}
              </button>
              <button type="button" className="btn btn-outline" onClick={onCancel}>{t.cancel}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────
function StatusBadge({ status, lang }) {
  const t = useT(lang).admin;
  const colors = {
    pending: ['var(--amber-dim)', 'var(--amber)'],
    confirmed: ['var(--accent-dim)', 'var(--accent)'],
    processing: ['rgba(168,85,247,0.1)', '#a855f7'],
    shipped: ['rgba(14,165,233,0.1)', '#0ea5e9'],
    delivered: ['var(--green-dim)', 'var(--green)'],
    cancelled: ['var(--red-dim)', 'var(--red)'],
  };
  const [bg, color] = colors[status] || colors.pending;
  return (
    <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {t.statuses[status] || status}
    </span>
  );
}

// ─── MAIN ADMIN PAGE ─────────────────────────────────────────────────────
export default function AdminPage() {
  const { lang, adminToken, adminInfo, adminLogin, adminLogout } = useApp();
  const t = useT(lang).admin;
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [productForm, setProductForm] = useState(null); // null | 'new' | product object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusMenu, setStatusMenu] = useState(null);
  const [prodLoading, setProdLoading] = useState(false);
  const [ordLoading, setOrdLoading] = useState(false);
  const [notify, setNotify] = useState('');

  const showNotif = (msg) => { setNotify(msg); setTimeout(() => setNotify(''), 2500); };

  const loadProducts = useCallback(() => {
    if (!adminToken) return;
    setProdLoading(true);
    getProducts({ limit: 200 }).then(r => setProducts(r.products || [])).finally(() => setProdLoading(false));
  }, [adminToken]);

  const loadOrders = useCallback(() => {
    if (!adminToken) return;
    setOrdLoading(true);
    getOrders(adminToken).then(r => setOrders(r.orders || [])).finally(() => setOrdLoading(false));
  }, [adminToken]);

  const loadStats = useCallback(() => {
    if (!adminToken) return;
    getOrderStats(adminToken).then(setStats).catch(() => {});
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) return;
    loadProducts(); loadOrders(); loadStats();
  }, [adminToken, loadProducts, loadOrders, loadStats]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id, adminToken);
      loadProducts();
      showNotif(lang === 'ua' ? 'Товар видалено' : 'Product deleted');
    } catch (e) {
      showNotif('Error: ' + e.message);
    }
    setDeleteConfirm(null);
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status, adminToken);
      loadOrders(); loadStats();
      showNotif(lang === 'ua' ? 'Статус оновлено' : 'Status updated');
    } catch {}
    setStatusMenu(null);
  };

  if (!adminToken) return <LoginPage onLogin={adminLogin} />;

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
    { id: 'products', icon: Package, label: t.products },
    { id: 'orders', icon: ShoppingBag, label: t.orders },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--header-h))', background: 'var(--bg)' }}>
      {/* Notification */}
      {notify && (
        <div className="notification" style={{ bottom: 20, right: 20, position: 'fixed', zIndex: 9999 }}>
          <Check size={16} color="var(--green)" />{notify}
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div style={{ padding: '24px 18px 16px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            {lang === 'ua' ? 'Адміністратор' : 'Administrator'}
          </p>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 15 }}>{adminInfo?.username || 'Admin'}</p>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} className={`admin-nav-link${tab === id ? ' active' : ''}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => { adminLogout(); navigate('/'); }} className="admin-nav-link" style={{ color: 'var(--red)' }}>
            <LogOut size={16} />{t.logout}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{t.dashboard}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 14, marginBottom: 32 }}>
              {[
                { icon: ShoppingBag, label: t.totalOrders, value: stats?.total ?? '—', color: 'var(--accent)' },
                { icon: Clock, label: t.pendingOrders, value: stats?.pending ?? '—', color: 'var(--amber)' },
                { icon: DollarSign, label: t.totalRevenue, value: stats ? `${fmt(stats.revenue)} грн` : '—', color: 'var(--green)' },
                { icon: TrendingUp, label: t.todayOrders, value: stats?.today ?? '—', color: 'var(--purple)' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div>
                    <p className="stat-card-label">{label}</p>
                    <p className="stat-card-value" style={{ fontSize: 22, color }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
              {lang === 'ua' ? 'Останні замовлення' : 'Recent Orders'}
            </h3>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>{lang === 'ua' ? 'Номер' : 'Number'}</th>
                  <th>{lang === 'ua' ? 'Клієнт' : 'Customer'}</th>
                  <th>{lang === 'ua' ? 'Сума' : 'Total'}</th>
                  <th>{t.orderStatus}</th>
                  <th>{lang === 'ua' ? 'Дата' : 'Date'}</th>
                </tr></thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td><span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>#{o.order_number}</span></td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: 13 }}>{o.customer_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{o.customer_email}</p>
                      </td>
                      <td><span className="mono" style={{ fontWeight: 600 }}>{fmt(o.total)} грн</span></td>
                      <td><StatusBadge status={o.status} lang={lang} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(o.created_at).toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-GB')}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '28px', color: 'var(--text2)' }}>{t.noOrders}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>{t.products}</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setProductForm('new')} style={{ gap: 6 }}>
                <Plus size={15} />{t.addProduct}
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th style={{ width: 56 }}></th>
                  <th>{lang === 'ua' ? 'Назва' : 'Name'}</th>
                  <th>{lang === 'ua' ? 'Кат.' : 'Cat.'}</th>
                  <th>{lang === 'ua' ? 'Ціна' : 'Price'}</th>
                  <th>{lang === 'ua' ? 'Статус' : 'Status'}</th>
                  <th style={{ width: 100 }}></th>
                </tr></thead>
                <tbody>
                  {prodLoading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--text2)' }}>
                      <Loader size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: 'var(--text2)' }}>{t.noProducts}</td></tr>
                  ) : products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <img src={p.image} alt={p.name_ua} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: 'var(--card)' }}
                          onError={e => { e.target.style.background = 'var(--card)'; e.target.src = ''; }} />
                      </td>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{p[`name_${lang}`] || p.name_ua}</p>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{p.sku}</p>
                      </td>
                      <td><span style={{ fontSize: 12, color: 'var(--text2)' }}>{p.category}</span></td>
                      <td>
                        <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{fmt(p.price)} грн</span>
                        {p.old_price ? <span className="mono" style={{ fontSize: 11, color: 'var(--text2)', textDecoration: 'line-through', marginLeft: 6 }}>{fmt(p.old_price)}</span> : null}
                      </td>
                      <td>
                        {p.in_stock
                          ? <span className="tag tag-green">{lang === 'ua' ? 'В наявності' : 'In Stock'}</span>
                          : <span className="tag tag-red">{lang === 'ua' ? 'Немає' : 'Out'}</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setProductForm(p)} title={t.editProduct} style={{ padding: 6 }}><Pencil size={14} /></button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(p.id)} title={t.deleteProduct} style={{ padding: 6, color: 'var(--red)' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 20 }}>{t.orders}</h2>
            <div className="table-wrap">
              <table>
                <thead><tr>
                  <th>{lang === 'ua' ? 'Номер' : 'Number'}</th>
                  <th>{lang === 'ua' ? 'Клієнт' : 'Customer'}</th>
                  <th>{lang === 'ua' ? 'Товари' : 'Items'}</th>
                  <th>{lang === 'ua' ? 'Сума' : 'Total'}</th>
                  <th>{lang === 'ua' ? 'Доставка' : 'Delivery'}</th>
                  <th>{t.orderStatus}</th>
                  <th>{lang === 'ua' ? 'Дата' : 'Date'}</th>
                </tr></thead>
                <tbody>
                  {ordLoading ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--text2)' }}>
                      <Loader size={20} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    </td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 28, color: 'var(--text2)' }}>{t.noOrders}</td></tr>
                  ) : orders.map(o => (
                    <tr key={o.id}>
                      <td><span className="mono" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}>#{o.order_number}</span></td>
                      <td>
                        <p style={{ fontWeight: 500, fontSize: 13 }}>{o.customer_name}</p>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{o.customer_phone}</p>
                        <p style={{ fontSize: 11, color: 'var(--text2)' }}>{o.customer_city}</p>
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {(Array.isArray(o.items) ? o.items : []).map(i => (
                          <p key={i.id} style={{ color: 'var(--text2)', marginBottom: 2 }}>• {(i.name_ua || i.name)?.substring(0, 28)} ×{i.qty}</p>
                        ))}
                      </td>
                      <td><span className="mono" style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 13 }}>{fmt(o.total)} грн</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text2)' }}>{o.delivery_method}</td>
                      <td style={{ position: 'relative' }}>
                        <button
                          onClick={() => setStatusMenu(statusMenu === o.id ? null : o.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <StatusBadge status={o.status} lang={lang} />
                          <ChevronDown size={12} color="var(--text2)" />
                        </button>
                        {statusMenu === o.id && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,.4)', minWidth: 140 }}>
                            {statuses.map(s => (
                              <button key={s} onClick={() => handleStatusChange(o.id, s)}
                                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: o.status === s ? 'var(--accent-dim)' : 'none', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'background .1s' }}
                                onMouseEnter={e => { if (o.status !== s) e.currentTarget.style.background = 'rgba(255,255,255,.04)'; }}
                                onMouseLeave={e => { if (o.status !== s) e.currentTarget.style.background = 'none'; }}
                              >
                                <StatusBadge status={s} lang={lang} />
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                        {new Date(o.created_at).toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-GB')}<br />
                        <span style={{ fontSize: 11 }}>{new Date(o.created_at).toLocaleTimeString(lang === 'ua' ? 'uk-UA' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product form modal */}
      {productForm && (
        <ProductForm
          product={productForm === 'new' ? null : productForm}
          token={adminToken}
          lang={lang}
          onSave={() => { setProductForm(null); loadProducts(); showNotif(lang === 'ua' ? 'Збережено!' : 'Saved!'); }}
          onCancel={() => setProductForm(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', maxWidth: 360, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <Trash2 size={36} color="var(--red)" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, marginBottom: 8 }}>{t.deleteConfirm}</h3>
            <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 24 }}>{lang === 'ua' ? 'Цю дію не можна скасувати.' : 'This action cannot be undone.'}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={14} />{t.deleteProduct}
              </button>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setDeleteConfirm(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media(max-width:768px){
          .admin-sidebar{width:200px}
          body > div > div{padding:16px!important}
        }
        @media(max-width:560px){
          .admin-sidebar{display:none}
        }
      `}</style>
    </div>
  );
}
