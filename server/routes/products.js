const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db/database');
const authMiddleware = require('../middleware/auth');

// Multer config for image uploads
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// GET /api/products
router.get('/', (req, res) => {
  const { category, search, sort, featured, limit } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (name_ua LIKE ? OR name_en LIKE ? OR description_ua LIKE ? OR description_en LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  if (featured === 'true') {
    query += ' AND featured = 1';
  }

  if (sort === 'price_asc') query += ' ORDER BY price ASC';
  else if (sort === 'price_desc') query += ' ORDER BY price DESC';
  else if (sort === 'popular') query += ' ORDER BY reviews_count DESC';
  else if (sort === 'rating') query += ' ORDER BY rating DESC';
  else query += ' ORDER BY created_at DESC';

  if (limit) query += ` LIMIT ${parseInt(limit)}`;

  const products = db.prepare(query).all(...params);
  res.json({ products, total: products.length });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST /api/products (admin)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { name_ua, name_en, description_ua, description_en, category, price, old_price, in_stock, badge, warranty, sku, specs, featured, image_url } = req.body;

  if (!name_ua || !name_en || !category || !price) {
    return res.status(400).json({ error: 'name_ua, name_en, category and price are required' });
  }

  let imagePath = image_url || '';
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }

  const result = db.prepare(`
    INSERT INTO products (name_ua, name_en, description_ua, description_en, category, price, old_price, image, in_stock, badge, warranty, sku, specs, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name_ua, name_en,
    description_ua || '', description_en || '',
    category, parseInt(price),
    old_price ? parseInt(old_price) : null,
    imagePath,
    in_stock === 'false' || in_stock === false ? 0 : 1,
    badge || null,
    warranty || '1 рік / 1 year',
    sku || `TN-${Date.now()}`,
    specs || '{}',
    featured === 'true' || featured === true ? 1 : 0
  );

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(product);
});

// PUT /api/products/:id (admin)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const { name_ua, name_en, description_ua, description_en, category, price, old_price, in_stock, badge, warranty, sku, specs, featured, image_url } = req.body;

  let imagePath = image_url !== undefined ? image_url : existing.image;
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
    // Delete old local image
    if (existing.image?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../../public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  db.prepare(`
    UPDATE products SET
      name_ua = ?, name_en = ?, description_ua = ?, description_en = ?,
      category = ?, price = ?, old_price = ?, image = ?,
      in_stock = ?, badge = ?, warranty = ?, sku = ?, specs = ?, featured = ?
    WHERE id = ?
  `).run(
    name_ua || existing.name_ua,
    name_en || existing.name_en,
    description_ua ?? existing.description_ua,
    description_en ?? existing.description_en,
    category || existing.category,
    price ? parseInt(price) : existing.price,
    old_price !== undefined ? (old_price ? parseInt(old_price) : null) : existing.old_price,
    imagePath,
    in_stock !== undefined ? (in_stock === 'false' || in_stock === false ? 0 : 1) : existing.in_stock,
    badge !== undefined ? (badge || null) : existing.badge,
    warranty || existing.warranty,
    sku || existing.sku,
    specs || existing.specs,
    featured !== undefined ? (featured === 'true' || featured === true ? 1 : 0) : existing.featured,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authMiddleware, (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  if (product.image?.startsWith('/uploads/')) {
    const imgPath = path.join(__dirname, '../../public', product.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true, id: parseInt(req.params.id) });
});

module.exports = router;
