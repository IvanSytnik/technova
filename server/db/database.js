const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'technova.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

let db;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_ua TEXT NOT NULL, name_en TEXT NOT NULL,
    description_ua TEXT DEFAULT '', description_en TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'other', price INTEGER NOT NULL,
    old_price INTEGER, image TEXT DEFAULT '', in_stock INTEGER DEFAULT 1,
    badge TEXT, rating REAL DEFAULT 4.5, reviews_count INTEGER DEFAULT 0,
    warranty TEXT DEFAULT '1 рік / 1 year', sku TEXT,
    specs TEXT DEFAULT '{}', featured INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL, customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL, customer_phone TEXT NOT NULL,
    customer_city TEXT DEFAULT '', customer_address TEXT DEFAULT '',
    delivery_method TEXT DEFAULT 'nova_poshta', payment_method TEXT DEFAULT 'card',
    items TEXT NOT NULL, total INTEGER NOT NULL, status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '', lang TEXT DEFAULT 'ua',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
    email TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL,
    name_ua TEXT NOT NULL, name_en TEXT NOT NULL, icon TEXT DEFAULT 'package'
  );
  INSERT OR IGNORE INTO categories VALUES
    (1,'laptops','Ноутбуки','Laptops','cpu'),
    (2,'monitors','Монітори','Monitors','monitor'),
    (3,'desktops','ПК','Desktop PCs','pc'),
    (4,'components','Комплектуючі','Components','chip'),
    (5,'peripherals','Периферія','Peripherals','keyboard'),
    (6,'headphones','Навушники','Headphones','headphones');
`;

const save = () => {
  if (!db) return;
  try { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); } catch (e) { console.error('DB save error:', e.message); }
};

// Flatten params array
const flat = (params) => {
  if (!params || params.length === 0) return [];
  const arr = Array.isArray(params[0]) ? params[0] : [...params];
  return arr.map(v => (v === undefined ? null : v));
};

const makeStmt = (sql) => ({
  run(...params) {
    const stmt = db.prepare(sql);
    stmt.run(flat(params));
    stmt.free();
    const changes = db.getRowsModified();
    // Get lastInsertRowid BEFORE save (save doesn't reset it but let's be safe)
    const s2 = db.prepare('SELECT last_insert_rowid() as lid');
    s2.step();
    const row = s2.getAsObject();
    s2.free();
    const lastInsertRowid = row.lid ?? 0;
    save();
    return { lastInsertRowid, changes };
  },
  get(...params) {
    const stmt = db.prepare(sql);
    stmt.bind(flat(params));
    const row = stmt.step() ? stmt.getAsObject() : undefined;
    stmt.free();
    return row;
  },
  all(...params) {
    const stmt = db.prepare(sql);
    const p = flat(params);
    if (p.length) stmt.bind(p);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  },
});

const wrapper = {
  ready: null,
  init() {
    this.ready = require('sql.js')().then(SQL => {
      db = fs.existsSync(DB_PATH)
        ? new SQL.Database(fs.readFileSync(DB_PATH))
        : new SQL.Database();
      db.run(SCHEMA);
      save();
    });
    return this.ready;
  },
  prepare: (sql) => makeStmt(sql),
  exec(sql) { if (db) { db.run(sql); save(); } },
  // Simplified transaction - run each item sequentially, save once at end
  transaction(fn) {
    return (...args) => {
      const result = fn(...args);
      save();
      return result;
    };
  },
  pragma() {},
};

module.exports = wrapper;
