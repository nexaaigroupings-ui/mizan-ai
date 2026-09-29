const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initializeDatabase, getAll, db } = require('./seed-data');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mizan-ai-dev-secret-key';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '.')));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  next();
}

function getUserSummary(user) {
  const plan = user.plan_id ? db.prepare('SELECT * FROM plans WHERE id = ?').get(user.plan_id) : null;
  const isActive = user.role === 'admin' ? true : user.status === 'active' && user.expires_at && new Date(user.expires_at) > new Date();
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    company: user.company,
    role: user.role,
    plan: plan ? { ...plan } : null,
    status: user.status || 'inactive',
    subscribed_at: user.subscribed_at,
    expires_at: user.expires_at,
    subscription_active: isActive
  };
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, name: 'Mizan AI API', timestamp: new Date().toISOString(), env: NODE_ENV });
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' });

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username).trim().toLowerCase());
    if (!user) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    const valid = await bcrypt.compare(String(password), user.password_hash);
    if (!valid) return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    const active = user.role === 'admin' || (user.status === 'active' && user.expires_at && new Date(user.expires_at) > new Date());
    if (!active) return res.status(403).json({ message: 'لا يوجد اشتراك نشط لهذا الحساب، الرجاء تفعيل الاشتراك أو تجديده.', subscriptionStatus: user.status || 'inactive' });

    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
      company: user.company
    }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user: getUserSummary(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'حدث خطأ في تسجيل الدخول', error: error.message });
  }
});

app.get('/api/profile', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
  res.json({ user: getUserSummary(user) });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const plans = getAll('plans');
  const paymentMethods = getAll('payment_methods');
  const users = getAll('users').map(getUserSummary);
  const settings = getAll('settings');
  const activeUsers = users.filter(u => u.subscription_active).length;
  const inactiveUsers = users.filter(u => !u.subscription_active).length;
  res.json({
    company: settings.find(s => s.key === 'company_name')?.value || 'Mizan AI',
    currency: settings.find(s => s.key === 'currency')?.value || 'SAR',
    activeUsers,
    inactiveUsers,
    users,
    plans,
    paymentMethods,
    settings
  });
});

app.get('/api/plans', authMiddleware, (req, res) => res.json(getAll('plans')));
app.post('/api/plans', authMiddleware, requireAdmin, (req, res) => {
  const { name, price, duration_days, description, active = 1 } = req.body || {};
  if (!name || price === undefined || duration_days === undefined) return res.status(400).json({ message: 'اسم الخطة والسعر وعدد الأيام مطلوبان' });
  const result = db.prepare('INSERT INTO plans (name, price, duration_days, description, active) VALUES (?, ?, ?, ?, ?)').run(String(name).trim(), Number(price), Number(duration_days), String(description || ''), Number(active));
  res.status(201).json({ id: result.lastInsertRowid, name, price: Number(price), duration_days: Number(duration_days), description, active: Number(active) });
});
app.put('/api/plans/:id', authMiddleware, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { name, price, duration_days, description, active } = req.body || {};
  const existing = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'الخطة غير موجودة' });
  const nextName = name || existing.name;
  const nextPrice = price === undefined ? existing.price : Number(price);
  const nextDuration = duration_days === undefined ? existing.duration_days : Number(duration_days);
  const nextDescription = description === undefined ? existing.description : String(description);
  const nextActive = active === undefined ? existing.active : Number(active);
  db.prepare('UPDATE plans SET name = ?, price = ?, duration_days = ?, description = ?, active = ? WHERE id = ?').run(nextName, nextPrice, nextDuration, nextDescription, nextActive, id);
  res.json({ ok: true, id, name: nextName, price: nextPrice, duration_days: nextDuration, description: nextDescription, active: nextActive });
});
app.delete('/api/plans/:id', authMiddleware, requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM plans WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'الخطة غير موجودة' });
  res.json({ ok: true });
});

app.get('/api/payment-methods', authMiddleware, (req, res) => res.json(getAll('payment_methods')));
app.post('/api/payment-methods', authMiddleware, requireAdmin, (req, res) => {
  const { name, type, account_name, account_number, iban, active = 1 } = req.body || {};
  if (!name || !type) return res.status(400).json({ message: 'اسم وسيلة الدفع ونوعها مطلوبان' });
  const result = db.prepare('INSERT INTO payment_methods (name, type, account_name, account_number, iban, active) VALUES (?, ?, ?, ?, ?, ?)').run(String(name).trim(), String(type).trim(), String(account_name || ''), String(account_number || ''), String(iban || ''), Number(active));
  res.status(201).json({ id: result.lastInsertRowid, name, type, account_name: account_name || '', account_number: account_number || '', iban: iban || '', active: Number(active) });
});
app.put('/api/payment-methods/:id', authMiddleware, requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { name, type, account_name, account_number, iban, active } = req.body || {};
  const existing = db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ message: 'طريقة الدفع غير موجودة' });
  db.prepare('UPDATE payment_methods SET name = ?, type = ?, account_name = ?, account_number = ?, iban = ?, active = ? WHERE id = ?').run(
    name || existing.name,
    type || existing.type,
    account_name === undefined ? existing.account_name : String(account_name),
    account_number === undefined ? existing.account_number : String(account_number),
    iban === undefined ? existing.iban : String(iban),
    active === undefined ? existing.active : Number(active),
    id
  );
  res.json({ ok: true, id });
});
app.delete('/api/payment-methods/:id', authMiddleware, requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM payment_methods WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ message: 'طريقة الدفع غير موجودة' });
  res.json({ ok: true });
});

app.get('/api/settings', authMiddleware, (req, res) => {
  const settings = getAll('settings');
  const map = {};
  for (const item of settings) map[item.key] = item.value;
  res.json(map);
});
app.put('/api/settings/:key', authMiddleware, requireAdmin, (req, res) => {
  const { key } = req.params;
  const { value } = req.body || {};
  if (value === undefined) return res.status(400).json({ message: 'القيمة مطلوبة' });
  const existing = db.prepare('SELECT * FROM settings WHERE key = ?').get(key);
  if (existing) db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(String(value), key);
  else db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
  res.json({ ok: true, key, value });
});

app.get('/api/users', authMiddleware, requireAdmin, (req, res) => res.json(getAll('users').map(getUserSummary)));
app.post('/api/users', authMiddleware, requireAdmin, async (req, res) => {
  const { username, password, name, company, role = 'user', plan_id, status = 'active', expires_at } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ message: 'اسم المستخدم وكلمة المرور واسم العميل مطلوبان' });
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(String(username).trim().toLowerCase());
  if (exists) return res.status(409).json({ message: 'اسم المستخدم موجود مسبقاً' });
  const hash = await bcrypt.hash(String(password), 10);
  const result = db.prepare('INSERT INTO users (username, password_hash, name, company, role, plan_id, status, subscribed_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    String(username).trim().toLowerCase(),
    hash,
    String(name).trim(),
    String(company || 'شركة جديدة'),
    String(role),
    plan_id ? Number(plan_id) : null,
    String(status),
    new Date().toISOString(),
    expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  );
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ user: getUserSummary(user) });
});

app.post('/api/subscriptions/:userId', authMiddleware, requireAdmin, (req, res) => {
  const userId = Number(req.params.userId);
  const { plan_id, status = 'active', expires_at } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
  const finalExpiration = expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET plan_id = ?, status = ?, subscribed_at = ?, expires_at = ? WHERE id = ?').run(plan_id ? Number(plan_id) : null, String(status), new Date().toISOString(), finalExpiration, userId);
  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  res.json({ user: getUserSummary(updated) });
});

app.post('/api/reset', authMiddleware, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM plans').run();
  db.prepare('DELETE FROM payment_methods').run();
  db.prepare('DELETE FROM settings').run();
  initializeDatabase();
  res.json({ ok: true, message: 'تم إعادة تهيئة البيانات بنجاح' });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Not found' });
  res.sendFile(path.join(__dirname, 'index.html'));
});

initializeDatabase();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mizan AI server running on port ${PORT}`);
  console.log(`📊 API: http://0.0.0.0:${PORT}/api`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log('✓ Database initialized successfully.');
});

module.exports = server;
