const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, email: admin.email },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

// POST /api/auth/change-password (admin only)
router.post('/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Invalid password data' });
  }

  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin.id);
  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hashed, req.admin.id);
  res.json({ success: true });
});

module.exports = router;
