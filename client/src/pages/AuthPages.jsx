import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';

// ── Verify Email ────────────────────────────────────────────────────
export function VerifyEmailPage() {
  const { lang } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const ua = lang === 'ua';

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); setMessage(ua ? 'Невірне посилання' : 'Invalid link'); return; }

    fetch(`/api/customers/verify/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setTimeout(() => navigate('/login', { state: { verified: true } }), 3000);
        } else {
          setStatus('error'); setMessage(data.error || 'Verification failed');
        }
      })
      .catch(() => { setStatus('error'); setMessage('Network error'); });
  }, []);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '48px 40px', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Loader size={48} color="var(--accent)" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800 }}>
              {ua ? 'Підтвердження...' : 'Verifying...'}
            </h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={36} color="var(--green)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              {ua ? 'Email підтверджено! ✓' : 'Email Verified! ✓'}
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
              {ua ? 'Перенаправляємо на сторінку входу...' : 'Redirecting to login...'}
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={36} color="var(--red)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
              {ua ? 'Помилка підтвердження' : 'Verification Failed'}
            </h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>{message}</p>
            <Link to="/register" className="btn btn-outline" style={{ display: 'inline-flex' }}>
              {ua ? 'Зареєструватися знову' : 'Register again'}
            </Link>
          </>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Forgot Password ─────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const { lang } = useApp();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const ua = lang === 'ua';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/customers/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={22} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800 }}>
            {ua ? 'Відновлення пароля' : 'Reset Password'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
            {ua ? 'Введіть email і ми надішлемо посилання для відновлення.' : 'Enter your email and we\'ll send a reset link.'}
          </p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Mail size={28} color="var(--green)" />
            </div>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
              {ua ? 'Якщо цей email зареєстрований, ми надіслали посилання для відновлення.' : 'If this email is registered, we sent a reset link.'}
            </p>
            <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex' }}>
              {ua ? '← Повернутись до входу' : '← Back to login'}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ivan@example.com" className="form-input" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {ua ? 'Надіслати посилання' : 'Send Reset Link'}
            </button>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
              <Link to="/login" style={{ color: 'var(--accent)' }}>{ua ? '← Назад до входу' : '← Back to login'}</Link>
            </p>
          </form>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Reset Password ──────────────────────────────────────────────────
export function ResetPasswordPage() {
  const { lang } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const ua = lang === 'ua';
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { setError(ua ? 'Мінімум 8 символів' : 'Min 8 characters'); return; }
    if (password !== confirm) { setError(ua ? 'Паролі не співпадають' : 'Passwords do not match'); return; }
    setLoading(true); setError('');
    const res = await fetch('/api/customers/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) { setSuccess(true); setTimeout(() => navigate('/login'), 2500); }
    else setError(data.error || 'Failed');
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <CheckCircle size={52} color="var(--green)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>
          {ua ? 'Пароль змінено!' : 'Password Updated!'}
        </h2>
        <p style={{ color: 'var(--text2)', marginTop: 8 }}>{ua ? 'Перенаправляємо...' : 'Redirecting...'}</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', maxWidth: 400, width: '100%' }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
          {ua ? 'Новий пароль' : 'New Password'}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{ua ? 'Новий пароль' : 'New Password'}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">{ua ? 'Підтвердити пароль' : 'Confirm Password'}</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="form-input" required />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={loading}>
            {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            {ua ? 'Зберегти пароль' : 'Save Password'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
