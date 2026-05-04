import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

export default function RegisterPage() {
  const { lang } = useApp();
  const t = useT(lang);
  const navigate = useNavigate();

  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const ua = lang === 'ua';

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = ua ? "Обов'язкове поле" : 'Required';
    if (!form.last_name.trim()) e.last_name = ua ? "Обов'язкове поле" : 'Required';
    if (!form.email.trim()) e.email = ua ? "Обов'язкове поле" : 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = ua ? 'Невірний email' : 'Invalid email';
    if (!form.password) e.password = ua ? "Обов'язкове поле" : 'Required';
    else if (form.password.length < 8) e.password = ua ? 'Мінімум 8 символів' : 'Min 8 characters';
    if (form.password !== form.confirm) e.confirm = ua ? 'Паролі не співпадають' : 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      const res = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', ph = '') => (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: 'var(--red)' }}>*</span></label>
      <input type={type} value={form[key]} placeholder={ph}
        onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); if (errors[key]) setErrors(er => { const n = {...er}; delete n[key]; return n; }); }}
        className="form-input" style={{ borderColor: errors[key] ? 'var(--red)' : undefined }}
      />
      {errors[key] && <p className="form-error">{errors[key]}</p>}
    </div>
  );

  if (success) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="var(--green)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {ua ? 'Реєстрація успішна!' : 'Registration successful!'}
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: 15, marginBottom: 8 }}>
          {ua ? 'Ми надіслали лист для підтвердження на' : 'We sent a verification email to'}
        </p>
        <p style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: 24 }}>{form.email}</p>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>
          {ua ? 'Перевірте папку "Спам" якщо лист не прийшов.' : 'Check your spam folder if you don\'t see it.'}
        </p>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
          {ua ? 'Перейти до входу' : 'Go to Login'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <UserPlus size={22} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>
            {ua ? 'Створити акаунт' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
            {ua ? 'Вже є акаунт?' : 'Already have an account?'}{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>{ua ? 'Увійти' : 'Sign in'}</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            {field('first_name', ua ? "Ім'я" : 'First Name', 'text', ua ? 'Іван' : 'John')}
            {field('last_name', ua ? 'Прізвище' : 'Last Name', 'text', ua ? 'Петренко' : 'Doe')}
          </div>
          {field('email', 'Email', 'email', 'ivan@example.com')}
          {field('phone', ua ? 'Телефон' : 'Phone (optional)', 'tel', '+380 XX XXX XX XX')}

          <div className="form-group">
            <label className="form-label">{ua ? 'Пароль' : 'Password'} <span style={{ color: 'var(--red)' }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={form.password} placeholder={ua ? 'Мінімум 8 символів' : 'Min 8 characters'}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); if (errors.password) setErrors(er => { const n = {...er}; delete n.password; return n; }); }}
                className="form-input" style={{ paddingRight: 40, borderColor: errors.password ? 'var(--red)' : undefined }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
            {/* Password strength */}
            {form.password && (
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {[1, 2, 3, 4].map(i => {
                  const strength = [form.password.length >= 8, /[A-Z]/.test(form.password), /[0-9]/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length;
                  const colors = ['var(--red)', 'var(--amber)', 'var(--accent)', 'var(--green)'];
                  return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength - 1] : 'var(--border)', transition: 'background .3s' }} />;
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{ua ? 'Підтвердити пароль' : 'Confirm Password'} <span style={{ color: 'var(--red)' }}>*</span></label>
            <input type={showPass ? 'text' : 'password'} value={form.confirm}
              onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); if (errors.confirm) setErrors(er => { const n = {...er}; delete n.confirm; return n; }); }}
              className="form-input" style={{ borderColor: errors.confirm ? 'var(--red)' : undefined }}
            />
            {errors.confirm && <p className="form-error">{errors.confirm}</p>}
          </div>

          {serverError && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 14, color: 'var(--red)' }}>
              {serverError}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4 }} disabled={loading}>
            {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {ua ? 'Реєстрація...' : 'Registering...'}</> : <><UserPlus size={16} />{ua ? 'Зареєструватися' : 'Create Account'}</>}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
