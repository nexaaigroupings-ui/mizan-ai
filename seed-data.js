const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

const dbFile = path.join(__dirname, 'data', 'mizan.db');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbFile);
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
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
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      duration_days INTEGER NOT NULL,
      description TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      account_name TEXT,
      account_number TEXT,
      iban TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    );
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const users = [
      { username: 'admin', password: 'admin123', name: 'مدير النظام', company: 'Mizan AI', role: 'admin', status: 'active' },
      { username: 'demo', password: 'customer123', name: 'مستخدم تجريبي', company: 'شركة تجريبية', role: 'user', status: 'active' }
    ];

    const insertUser = db.prepare('INSERT INTO users (username, password_hash, name, company, role, status, subscribed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const user of users) {
      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      insertUser.run(
        user.username,
        bcrypt.hashSync(user.password, 10),
        user.name,
        user.company,
        user.role,
        user.status,
        new Date().toISOString(),
        expiresAt
      );
    }
  }

  const planCount = db.prepare('SELECT COUNT(*) as count FROM plans').get().count;
  if (planCount === 0) {
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)').run('خطة أساسية', 99, 30, 'خطة للشركات الصغيرة', 1);
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)').run('خطة احترافية', 299, 30, 'خطة للشركات المتوسطة', 1);
    db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)').run('خطة مؤسسات', 999, 30, 'خطة للشركات الكبيرة', 1);
  }

  const paymentCount = db.prepare('SELECT COUNT(*) as count FROM payment_methods').get().count;
  if (paymentCount === 0) {
    db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)').run('الحساب البنكي الرئيسي', 'bank', 'شركة مزان', '1234567890', 'SA1234567890123456789', 1);
    db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)').run('المحفظة الإلكترونية', 'wallet', 'شركة مزان', '9876543210', '', 1);
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('company_name', 'Mizan AI');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('currency', 'SAR');
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('timezone', 'Asia/Riyadh');
  }
}

function getAll(table) {
  return db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`).all();
}

module.exports = {
  db,
  initializeDatabase,
  getAll
};
