const router = require('express').Router();
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { sendOrderEmails } = require('../email');

const generateOrderNumber = () => {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TN-${ymd}-${rand}`;
};

// POST /api/orders — create order
router.post('/', async (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_city, customer_address, delivery_method, payment_method, items, total, notes, lang } = req.body;

  if (!customer_name || !customer_email || !customer_phone || !items?.length || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const order_number = generateOrderNumber();
  const itemsJson = JSON.stringify(items);

  try {
    const result = db.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, customer_city, customer_address, delivery_method, payment_method, items, total, notes, lang)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      order_number, customer_name, customer_email, customer_phone,
      customer_city || '', customer_address || '',
      delivery_method || 'nova_poshta',
      payment_method || 'card',
      itemsJson, parseInt(total),
      notes || '', lang || 'ua'
    );

    const order = {
      id: result.lastInsertRowid, order_number,
      customer_name, customer_email, customer_phone,
      customer_city, customer_address,
      delivery_method, payment_method,
      items, total: parseInt(total), notes
    };

    // Send emails (non-blocking)
    sendOrderEmails(order).catch(console.error);

    res.status(201).json({ success: true, order_number, id: result.lastInsertRowid });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders (admin only)
router.get('/', authMiddleware, (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const orders = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM orders' + (status ? ' WHERE status = ?' : '')).get(...(status ? [status] : []));

  res.json({ orders: orders.map(o => ({ ...o, items: JSON.parse(o.items) })), total: total.count });
});

// GET /api/orders/:id (admin only)
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ ...order, items: JSON.parse(order.items) });
});

// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', authMiddleware, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true, status });
});

// GET /api/orders/stats/summary (admin)
router.get('/stats/summary', authMiddleware, (req, res) => {
  const stats = {
    total: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    pending: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get().c,
    revenue: db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE status != 'cancelled'").get().s,
    today: db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at)=date('now')").get().c,
  };
  res.json(stats);
});

module.exports = router;
