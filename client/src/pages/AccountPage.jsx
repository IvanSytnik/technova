import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Shield, LogOut, ChevronRight, Loader, Check, Package, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCustomer } from '../context/CustomerContext';
import { useT } from '../i18n';

const fmt = (n) => Number(n).toLocaleString('uk-UA');

const STATUS_COLORS = {
  pending: ['var(--amber-dim)', 'var(--amber)'],
  confirmed: ['var(--accent-dim)', 'var(--accent)'],
  processing: ['rgba(168,85,247,.1)', '#a855f7'],
  shipped: ['rgba(14,165,233,.1)', '#0ea5e9'],
  delivered: ['var(--green-dim)', 'var(--green)'],
  cancelled: ['var(--red-dim)', 'var(--red)'],
};

const statusLabel = (s, lang) => {
  const ua = { pending: 'В обробці', confirmed: 'Підтверджено', processing: 'Комплектується', shipped: 'Відправлено', delivered: 'Доставлено', cancelled: 'Скасовано' };
  const en = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
  return (lang === 'ua' ? ua : en)[s] || s;
};

// ── Profile Tab ──────────────────────────────────────────────────────
function ProfileTab({ customer, authFetch, updateCustomer, lang }) {
  const ua = lang === 'ua';
  const [form, setForm] = useState({ first_name: customer.first_name || '', last_name: customer.last_name || '', phone: customer.phone || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch('/api/customers/me', { method: 'PUT', body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) { updateCustomer(data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{ua ? 'Особисті дані' : 'Personal Info'}</h2>
      <form onSubmit={handleSave}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{ua ? "Ім'я" : 'First Name'}</label>
            <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">{ua ? 'Прізвище' : 'Last Name'}</label>
            <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input value={customer.email} disabled className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
            {ua ? 'Email змінити неможливо' : 'Email cannot be changed'}
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">{ua ? 'Телефон' : 'Phone'}</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="form-input" placeholder="+380..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ gap: 8 }}>
          {saving ? <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={15} /> : null}
          {saved ? (ua ? 'Збережено!' : 'Saved!') : (ua ? 'Зберегти зміни' : 'Save Changes')}
        </button>
      </form>
    </div>
  );
}

// ── Orders Tab ───────────────────────────────────────────────────────
function OrdersTab({ authFetch, lang }) {
  const ua = lang === 'ua';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/customers/me/orders')
      .then(r => r.json()).then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{ua ? 'Мої замовлення' : 'My Orders'}</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text2)' }}>
          <Package size={48} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
          <p style={{ fontFamily: 'var(--font-head)', fontSize: 18 }}>{ua ? 'Замовлень ще немає' : 'No orders yet'}</p>
        </div>
      ) : orders.map(o => {
        const [bg, color] = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
        const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
        return (
          <div key={o.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div>
                <p className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>#{o.order_number}</p>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  {new Date(o.created_at).toLocaleDateString(ua ? 'uk-UA' : 'en-GB')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ background: bg, color, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                  {statusLabel(o.status, lang)}
                </span>
                <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>
                  {fmt(o.total)} {ua ? 'грн' : 'UAH'}
                </span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              {items.map((item, i) => (
                <p key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 3 }}>
                  • {item.name_ua || item.name} × {item.qty} — {fmt(item.price * item.qty)} {ua ? 'грн' : 'UAH'}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Addresses Tab ────────────────────────────────────────────────────
function AddressesTab({ authFetch, lang }) {
  const ua = lang === 'ua';
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: ua ? 'Дім' : 'Home', city: '', address: '', is_default: false });
  const [saving, setSaving] = useState(false);

  const load = () => {
    authFetch('/api/customers/addresses').then(r => r.json()).then(setAddresses).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.city || !form.address) return;
    setSaving(true);
    await authFetch('/api/customers/addresses', { method: 'POST', body: JSON.stringify(form) });
    setShowForm(false); setForm({ label: ua ? 'Дім' : 'Home', city: '', address: '', is_default: false });
    load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await authFetch(`/api/customers/addresses/${id}`, { method: 'DELETE' });
    setAddresses(a => a.filter(x => x.id !== id));
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}><Loader size={28} style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>{ua ? 'Мої адреси' : 'My Addresses'}</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)} style={{ gap: 6 }}>
          <Plus size={14} />{ua ? 'Додати' : 'Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: '18px 20px', marginBottom: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{ua ? 'Назва' : 'Label'}</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="form-input" placeholder={ua ? 'Дім, Робота...' : 'Home, Work...'} />
            </div>
            <div className="form-group">
              <label className="form-label">{ua ? 'Місто' : 'City'}</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="form-input" placeholder={ua ? 'Київ' : 'Kyiv'} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{ua ? 'Відділення / Адреса' : 'Branch / Address'}</label>
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="form-input" placeholder={ua ? 'Відділення №5 або вул. Хрещатик, 1' : 'Branch #5 or Khreschatyk St, 1'} required />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, cursor: 'pointer', fontSize: 14 }}>
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} style={{ accentColor: 'var(--accent)' }} />
            {ua ? 'Зробити основною' : 'Set as default'}
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{ua ? 'Зберегти' : 'Save'}</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>{ua ? 'Скасувати' : 'Cancel'}</button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text2)' }}>
          <MapPin size={48} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
          <p>{ua ? 'Немає збережених адрес' : 'No saved addresses'}</p>
        </div>
      ) : addresses.map(a => (
        <div key={a.id} style={{ background: 'var(--card)', border: `1px solid ${a.is_default ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <p style={{ fontWeight: 700, fontSize: 14 }}>{a.label}</p>
              {a.is_default && <span className="tag tag-blue" style={{ fontSize: 10 }}>{ua ? 'Основна' : 'Default'}</span>}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{a.city}, {a.address}</p>
          </div>
          <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', padding: 4, opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Security Tab ─────────────────────────────────────────────────────
function SecurityTab({ authFetch, lang }) {
  const ua = lang === 'ua';
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password.length < 8) { setError(ua ? 'Мінімум 8 символів' : 'Min 8 characters'); return; }
    if (form.new_password !== form.confirm) { setError(ua ? 'Паролі не співпадають' : 'Passwords do not match'); return; }
    setLoading(true); setError('');
    const res = await authFetch('/api/customers/me/password', { method: 'PUT', body: JSON.stringify({ current_password: form.current_password, new_password: form.new_password }) });
    if (res.ok) { setSuccess(true); setForm({ current_password: '', new_password: '', confirm: '' }); }
    else { const d = await res.json(); setError(d.error || 'Failed'); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{ua ? 'Безпека' : 'Security'}</h2>
      {success && <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, color: 'var(--green)', fontSize: 14 }}>✓ {ua ? 'Пароль змінено!' : 'Password updated!'}</div>}
      <form onSubmit={handleSubmit}>
        {[['current_password', ua ? 'Поточний пароль' : 'Current Password'], ['new_password', ua ? 'Новий пароль' : 'New Password'], ['confirm', ua ? 'Підтвердити новий пароль' : 'Confirm New Password']].map(([key, label]) => (
          <div className="form-group" key={key}>
            <label className="form-label">{label}</label>
            <input type="password" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="form-input" required />
          </div>
        ))}
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ gap: 8 }}>
          {loading && <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />}
          {ua ? 'Змінити пароль' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

// ── Main Account Page ────────────────────────────────────────────────
export default function AccountPage() {
  const { lang } = useApp();
  const { customer, loading, logout, authFetch, updateCustomer, isLoggedIn } = useCustomer();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';
  const ua = lang === 'ua';

  useEffect(() => {
    if (!loading && !isLoggedIn) navigate('/login', { state: { from: '/account' } });
  }, [loading, isLoggedIn]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!customer) return null;

  const tabs = [
    { id: 'profile', icon: User, label: ua ? 'Профіль' : 'Profile' },
    { id: 'orders', icon: ShoppingBag, label: ua ? 'Замовлення' : 'Orders' },
    { id: 'addresses', icon: MapPin, label: ua ? 'Адреси' : 'Addresses' },
    { id: 'security', icon: Shield, label: ua ? 'Безпека' : 'Security' },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-h))', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800 }}>
                {ua ? `Привіт, ${customer.first_name}! 👋` : `Hello, ${customer.first_name}! 👋`}
              </h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>{customer.email}</p>
            </div>
            <button onClick={logout} className="btn btn-outline btn-sm" style={{ gap: 6, color: 'var(--red)', borderColor: 'rgba(239,68,68,.3)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(239,68,68,.3)'}
            >
              <LogOut size={14} />{ua ? 'Вийти' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar nav */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', position: 'sticky', top: 80 }}>
            {tabs.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setSearchParams({ tab: id })}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '13px 18px', background: tab === id ? 'var(--accent-dim)' : 'none', border: 'none', borderLeft: `3px solid ${tab === id ? 'var(--accent)' : 'transparent'}`, color: tab === id ? 'var(--accent)' : 'var(--text2)', cursor: 'pointer', fontSize: 14, fontWeight: tab === id ? 600 : 400, fontFamily: 'var(--font-body)', textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { if (tab !== id) { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = 'var(--text)'; } }}
                onMouseLeave={e => { if (tab !== id) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text2)'; } }}
              >
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px 28px' }}>
            {tab === 'profile' && <ProfileTab customer={customer} authFetch={authFetch} updateCustomer={updateCustomer} lang={lang} />}
            {tab === 'orders' && <OrdersTab authFetch={authFetch} lang={lang} />}
            {tab === 'addresses' && <AddressesTab authFetch={authFetch} lang={lang} />}
            {tab === 'security' && <SecurityTab authFetch={authFetch} lang={lang} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .container > div[style*="grid-template-columns: 220px"]{grid-template-columns:1fr!important;}
          .container > div > div:first-child{position:static!important;display:flex;overflow-x:auto;}
          .container > div > div:first-child button{white-space:nowrap;flex-shrink:0}
        }
      `}</style>
    </div>
  );
}
