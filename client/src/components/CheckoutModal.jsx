import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCustomer } from '../context/CustomerContext';
import { useT } from '../i18n';
import { createOrder } from '../api';

const fmt = (n) => Number(n).toLocaleString('uk-UA');

export default function CheckoutModal({ onClose }) {
  const { lang, cart, cartTotal, clearCart, notify } = useApp();
  const { customer } = useCustomer();
  const t = useT(lang);
  const tc = t.checkout;

  const [form, setForm] = useState({
    customer_name: customer?.first_name ? `${customer.first_name} ${customer.last_name}` : '',
    customer_email: customer?.email || '',
    customer_phone: customer?.phone || '',
    customer_city: '', customer_address: '',
    delivery_method: 'nova_poshta', payment_method: 'card', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handler); };
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = tc.required;
    if (!form.customer_email.trim()) e.customer_email = tc.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) e.customer_email = tc.invalidEmail;
    if (!form.customer_phone.trim()) e.customer_phone = tc.required;
    else if (!/^[\d\s\+\-\(\)]{10,}$/.test(form.customer_phone)) e.customer_phone = tc.invalidPhone;
    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);

    try {
      const items = cart.map(i => ({
        id: i.id, name: i[`name_${lang}`] || i.name_ua || i.name,
        name_ua: i.name_ua, name_en: i.name_en,
        price: i.price, qty: i.qty,
        image: i.image,
      }));

      const result = await createOrder({ ...form, items, total: cartTotal, lang, customer_id: customer?.id || null });
      setSuccess(result);
      clearCart();
    } catch (err) {
      notify(err.message || (lang === 'ua' ? 'Помилка при оформленні замовлення' : 'Order submission error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, placeholder, type = 'text', required = true) => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}</label>
      <input
        type={type} value={form[name]} placeholder={placeholder}
        onChange={e => handleChange(name, e.target.value)}
        className="form-input"
        style={{ borderColor: errors[name] ? 'var(--red)' : undefined }}
      />
      {errors[name] && <p className="form-error">{errors[name]}</p>}
    </div>
  );

  const select = (name, label, options) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select value={form[name]} onChange={e => handleChange(name, e.target.value)} className="form-input form-select">
        {Object.entries(options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 800, display: 'grid', gridTemplateColumns: success ? '1fr' : '1fr 1fr' }}
        onClick={e => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}><X size={17} /></button>

        {/* SUCCESS */}
        {success ? (
          <div style={{ padding: '56px 40px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CheckCircle size={36} color="var(--green)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{tc.success}</h2>
            <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 8 }}>
              {tc.successSub} <strong style={{ color: 'var(--text)' }}>{form.customer_email}</strong>
            </p>
            <div style={{ marginTop: 24, padding: '16px 24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              <p style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{tc.orderNum}</p>
              <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>#{success.order_number}</p>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 28, justifyContent: 'center', padding: '13px 32px' }} onClick={onClose}>
              {lang === 'ua' ? 'Продовжити покупки' : 'Continue Shopping'}
            </button>
          </div>
        ) : (
          <>
            {/* ORDER SUMMARY */}
            <div style={{ background: 'var(--card)', padding: '28px 24px', borderRight: '1px solid var(--border)', overflowY: 'auto' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={16} color="var(--accent)" />
                {lang === 'ua' ? 'Ваше замовлення' : 'Your Order'}
              </h3>
              <div>
                {cart.map(item => {
                  const name = item[`name_${lang}`] || item.name_ua || item.name;
                  return (
                    <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <img src={item.image || ''} alt={name}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=60'; }}
                        style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text2)' }}>× {item.qty}</p>
                      </div>
                      <p className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                        {fmt(item.price * item.qty)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, padding: '14px 0', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{t.cart.total}</span>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                  {fmt(cartTotal)} <span style={{ fontSize: 13, color: 'var(--text2)' }}>{t.currency}</span>
                </span>
              </div>
            </div>

            {/* FORM */}
            <div style={{ padding: '28px 28px', overflowY: 'auto', maxHeight: '90vh' }}>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{tc.title}</h2>
              <form onSubmit={handleSubmit} noValidate>
                {field('customer_name', tc.name, tc.namePh)}
                <div className="form-row">
                  {field('customer_email', tc.email, tc.emailPh, 'email')}
                  {field('customer_phone', tc.phone, tc.phonePh, 'tel')}
                </div>
                <div className="form-row">
                  {field('customer_city', tc.city, tc.cityPh, 'text', false)}
                  <div className="form-group">
                    <label className="form-label">{tc.address}</label>
                    <input value={form.customer_address} placeholder={tc.addressPh} onChange={e => handleChange('customer_address', e.target.value)} className="form-input" />
                  </div>
                </div>
                <div className="form-row">
                  {select('delivery_method', tc.delivery, tc.deliveryOptions)}
                  {select('payment_method', tc.payment, tc.paymentOptions)}
                </div>
                <div className="form-group">
                  <label className="form-label">{tc.notes}</label>
                  <textarea value={form.notes} placeholder={tc.notesPh} onChange={e => handleChange('notes', e.target.value)} className="form-input form-textarea" />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                  disabled={loading}
                >
                  {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />{lang === 'ua' ? 'Відправка...' : 'Sending...'}</> : tc.submit}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media(max-width:640px){ .modal { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
