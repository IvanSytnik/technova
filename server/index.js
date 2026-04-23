require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db/database');
const app = express();
const PORT = process.env.PORT || 5000;

let dbReady = false;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// DB ready guard
app.use((req, res, next) => {
  if (!dbReady && req.path !== '/api/health') {
    return res.status(503).json({ error: 'Database initializing, please retry' });
  }
  next();
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM categories').all());
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: dbReady, ts: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuild, 'index.html'));
    }
  });
}

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB then start server
db.init().then(() => {
  dbReady = true;
  console.log('✅ Database initialized');
  app.listen(PORT, () => {
    console.log(`\n🚀 TechNova Server → http://localhost:${PORT}`);
    console.log(`   API → http://localhost:${PORT}/api`);
    console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
  });
}).catch(err => {
  console.error('❌ Failed to initialize DB:', err);
  process.exit(1);
});

module.exports = app;
