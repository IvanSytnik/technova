import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Loader, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCustomer } from '../context/CustomerContext';
import { useT } from '../i18n';

export default function LoginPage() {
  const { lang } = useApp();
  const t = useT(lang);
  const { login } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const ua = lang === 'ua';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError(ua ? "Заповніть всі поля" : "Fill all fields"); return; }
    setLoading(true); setError(''); setNotVerified(false);

    try {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') { setNotVerified(true); return; }
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.customer);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email) return;
    await fetch('/api/customers/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResendSent(true);
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '36px 32px', maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, var(--accent), #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <LogIn size={22} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 800 }}>
            {ua ? 'Вхід до акаунту' : 'Sign In'}
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>
            {ua ? 'Ще немає акаунту?' : "Don't have an account?"}{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>{ua ? 'Зареєструватися' : 'Sign up'}</Link>
          </p>
        </div>

        {/* Success message from verification */}
        {location.state?.verified && (
          <div style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 14, color: 'var(--green)' }}>
            ✓ {ua ? 'Email підтверджено! Тепер можете увійти.' : 'Email verified! You can now sign in.'}
          </div>
        )}

        {notVerified && (
          <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 'var(--radius)', padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>
            <p style={{ color: 'var(--amber)', fontWeight: 600, marginBottom: 4 }}>
              {ua ? 'Email не підтверджено' : 'Email not verified'}
            </p>
            <p style={{ color: 'var(--text2)', marginBottom: 8 }}>
              {ua ? 'Перевірте пошту та підтвердіть акаунт.' : 'Check your inbox and verify your account.'}
            </p>
            {!resendSent ? (
              <button onClick={resendVerification} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
                {ua ? 'Надіслати лист повторно →' : 'Resend verification email →'}
              </button>
            ) : (
              <span style={{ color: 'var(--green)', fontSize: 13 }}>✓ {ua ? 'Надіслано!' : 'Sent!'}</span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ivan@example.com" className="form-input" autoComplete="email" required />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
              <label className="form-label" style={{ margin: 0 }}>{ua ? 'Пароль' : 'Password'}</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--accent)' }}>
                {ua ? 'Забули пароль?' : 'Forgot password?'}
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input" style={{ paddingRight: 40 }} autoComplete="current-password" required />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16, fontSize: 14, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13 }} disabled={loading}>
            {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> {ua ? 'Вхід...' : 'Signing in...'}</> : <><LogIn size={16} />{ua ? 'Увійти' : 'Sign In'}</>}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
