const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db/database');
const customerAuth = require('../middleware/customerAuth');
const { authLimiter, registerLimiter } = require('../middleware/rateLimit');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const { sendVerificationEmail, sendResetEmail } = require('../email');

const genToken = () => crypto.randomBytes(32).toString('hex');
const addHours = (h) => new Date(Date.now() + h * 3600000).toISOString();

// ── REGISTER ──────────────────────────────────────────────────────
router.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.validated;

  const existing = db.prepare('SELECT id FROM customers WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    // Same message for security (no enumeration)
    return res.status(400).json({ error: 'Registration failed. Check your data.' });
  }

  const hashed = bcrypt.hashSync(password, 12);
  const result = db.prepare(
    'INSERT INTO customers (email, password, first_name, last_name, phone) VALUES (?,?,?,?,?)'
  ).run(email.toLowerCase(), hashed, first_name.trim(), last_name.trim(), phone || '');

  const customerId = result.lastInsertRowid;
  // Get the actual ID if lastInsertRowid is 0
  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase());
  const cid = customer?.id || customerId;

  // Create verification token
  const token = genToken();
  db.prepare('INSERT INTO tokens (customer_id, token, type, expires_at) VALUES (?,?,?,?)').run(
    cid, token, 'verify', addHours(24)
  );

  // Send email (non-blocking)
  sendVerificationEmail(customer || { email, first_name }, token).catch(console.error);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    // In dev mode without email, return token for testing
    ...((!process.env.SMTP_USER) && { dev_verify_token: token }),
  });
});

// ── VERIFY EMAIL ──────────────────────────────────────────────────
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;
  const tokenRow = db.prepare(
    "SELECT * FROM tokens WHERE token = ? AND type = 'verify' AND used = 0"
  ).get(token);

  if (!tokenRow) return res.status(400).json({ error: 'Invalid or expired verification link' });
  if (new Date(tokenRow.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Verification link has expired. Please register again.' });
  }

  db.prepare('UPDATE customers SET is_verified = 1 WHERE id = ?').run(tokenRow.customer_id);
  db.prepare('UPDATE tokens SET used = 1 WHERE id = ?').run(tokenRow.id);

  res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
});

// ── LOGIN ─────────────────────────────────────────────────────────
router.post('/login', authLimiter, validate(loginSchema), (req, res) => {
  const { email, password } = req.validated;
  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase());

  // Same timing to prevent enumeration
  const validPassword = customer ? bcrypt.compareSync(password, customer.password) : false;

  if (!customer || !validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (!customer.is_verified) {
    return res.status(403).json({
      error: 'Please verify your email first',
      code: 'EMAIL_NOT_VERIFIED',
    });
  }

  const token = customerAuth.signToken({ id: customer.id, email: customer.email });

  // Set httpOnly cookie
  res.cookie('customer_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 3600 * 1000, // 7 days
  });

  res.json({
    success: true,
    token, // also send in body for localStorage fallback
    customer: {
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
    },
  });
});

// ── LOGOUT ────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('customer_token');
  res.json({ success: true });
});

// ── FORGOT PASSWORD ───────────────────────────────────────────────
router.post('/forgot', authLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase());

  // Always return success (security)
  if (customer && customer.is_verified) {
    const token = genToken();
    db.prepare('INSERT INTO tokens (customer_id, token, type, expires_at) VALUES (?,?,?,?)').run(
      customer.id, token, 'reset', addHours(1)
    );
    sendResetEmail(customer, token).catch(console.error);
    if (!process.env.SMTP_USER) console.log('Dev reset token:', token);
  }

  res.json({ success: true, message: 'If this email exists, you will receive a reset link.' });
});

// ── RESET PASSWORD ────────────────────────────────────────────────
router.post('/reset', (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'Invalid token or password too short' });
  }

  const tokenRow = db.prepare(
    "SELECT * FROM tokens WHERE token = ? AND type = 'reset' AND used = 0"
  ).get(token);

  if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }

  const hashed = bcrypt.hashSync(password, 12);
  db.prepare('UPDATE customers SET password = ? WHERE id = ?').run(hashed, tokenRow.customer_id);
  db.prepare('UPDATE tokens SET used = 1 WHERE id = ?').run(tokenRow.id);

  res.json({ success: true, message: 'Password updated successfully' });
});

// ── ME (profile) ──────────────────────────────────────────────────
router.get('/me', customerAuth, (req, res) => {
  const customer = db.prepare(
    'SELECT id, email, first_name, last_name, phone, is_verified, created_at FROM customers WHERE id = ?'
  ).get(req.customer.id);

  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// ── UPDATE PROFILE ────────────────────────────────────────────────
router.put('/me', customerAuth, (req, res) => {
  const { first_name, last_name, phone } = req.body;
  db.prepare(
    'UPDATE customers SET first_name = ?, last_name = ?, phone = ? WHERE id = ?'
  ).run(
    first_name?.trim() || '',
    last_name?.trim() || '',
    phone?.trim() || '',
    req.customer.id
  );
  const updated = db.prepare(
    'SELECT id, email, first_name, last_name, phone FROM customers WHERE id = ?'
  ).get(req.customer.id);
  res.json(updated);
});

// ── CHANGE PASSWORD ───────────────────────────────────────────────
router.put('/me/password', customerAuth, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'Invalid password data' });
  }

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.customer.id);
  if (!bcrypt.compareSync(current_password, customer.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  db.prepare('UPDATE customers SET password = ? WHERE id = ?').run(
    bcrypt.hashSync(new_password, 12), req.customer.id
  );
  res.json({ success: true });
});

// ── MY ORDERS ─────────────────────────────────────────────────────
router.get('/me/orders', customerAuth, (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC'
  ).all(req.customer.id);

  res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })));
});

// ── ADDRESSES ─────────────────────────────────────────────────────
router.get('/addresses', customerAuth, (req, res) => {
  res.json(db.prepare('SELECT * FROM addresses WHERE customer_id = ? ORDER BY is_default DESC').all(req.customer.id));
});

router.post('/addresses', customerAuth, (req, res) => {
  const { label, city, address, is_default } = req.body;
  if (!city || !address) return res.status(400).json({ error: 'City and address are required' });

  if (is_default) {
    db.prepare('UPDATE addresses SET is_default = 0 WHERE customer_id = ?').run(req.customer.id);
  }

  const r = db.prepare(
    'INSERT INTO addresses (customer_id, label, city, address, is_default) VALUES (?,?,?,?,?)'
  ).run(req.customer.id, label || 'Дім', city, address, is_default ? 1 : 0);

  const newAddr = db.prepare('SELECT * FROM addresses WHERE customer_id = ? ORDER BY id DESC LIMIT 1').get(req.customer.id);
  res.status(201).json(newAddr);
});

router.delete('/addresses/:id', customerAuth, (req, res) => {
  db.prepare('DELETE FROM addresses WHERE id = ? AND customer_id = ?').run(
    req.params.id, req.customer.id
  );
  res.json({ success: true });
});

// ── RESEND VERIFICATION ───────────────────────────────────────────
router.post('/resend-verification', authLimiter, (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase());
  if (customer && !customer.is_verified) {
    const token = genToken();
    db.prepare('INSERT INTO tokens (customer_id, token, type, expires_at) VALUES (?,?,?,?)').run(
      customer.id, token, 'verify', addHours(24)
    );
    sendVerificationEmail(customer, token).catch(console.error);
  }

  res.json({ success: true, message: 'If this email exists and is unverified, we sent a new link.' });
});

module.exports = router;
