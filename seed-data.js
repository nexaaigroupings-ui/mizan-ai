const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbFile = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'mizan.db');
const dataDir = path.dirname(dbFile);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      duration_days INTEGER NOT NULL DEFAULT 30,
      description TEXT DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      account_name TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      iban TEXT DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      plan_id INTEGER,
      status TEXT DEFAULT 'inactive',
      subscribed_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const settings = [
    ['company_name', 'Mizan AI'],
    ['currency', 'SAR'],
    ['default_payment_method', 'bank'],
    ['default_plan_id', '1']
  ];

  for (const [key, value] of settings) {
    const exists = db.prepare('SELECT id FROM settings WHERE key = ?').get(key);
    if (!exists) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
    }
  }

  const plansCount = db.prepare('SELECT COUNT(*) as count FROM plans').get().count;
  if (plansCount === 0) {
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)')
      .run('Basic', 99, 30, 'خطة أساسية للمستخدمين الجدد', 1);
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)')
      .run('Professional', 199, 30, 'خطة احترافية للشركات الصغيرة', 1);
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)')
      .run('Business', 399, 30, 'خطة متقدمة للشركات الكبيرة', 1);
  }

  const paymentMethodsCount = db.prepare('SELECT COUNT(*) as count FROM payment_methods').get().count;
  if (paymentMethodsCount === 0) {
    db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run('بنك الرياض', 'bank', 'مركز Mizan AI', '1234567890', 'SA1234567890123456789012', 1);
    db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run('محفظة STC', 'wallet', 'محفظة STC', '966500000000', '', 1);
    db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run('بنك الأهلي', 'bank', 'مكتب Mizan AI', '9876543210', 'SA9876543210987654321098', 1);
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const customerHash = bcrypt.hashSync('customer123', 10);

    const plan = db.prepare('SELECT * FROM plans ORDER BY id ASC LIMIT 1').get();

    db.prepare('INSERT INTO users (username, password_hash, name, company, role, plan_id, status, subscribed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('admin', adminHash, 'مدير النظام', 'Mizan AI', 'admin', plan ? plan.id : null, 'active', new Date().toISOString(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString());

    db.prepare('INSERT INTO users (username, password_hash, name, company, role, plan_id, status, subscribed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run('demo', customerHash, 'مستخدم تجريبي', 'شركة تجريبية', 'user', plan ? plan.id : null, 'active', new Date().toISOString(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
  }
}

function getAll(table) {
  return db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
}

function seedDatabase() {
  initializeDatabase();
}

module.exports = {
  db,
  initializeDatabase,
  getAll,
  seedDatabase
};

