// The same frontend is used by the web app, Android (Capacitor), and desktop (Electron).
// Web: npm start
// Android: npm run mobile:add, then npm run mobile:sync and npm run mobile:open
// Desktop: MIZAN_WEB_URL=https://your-app.up.railway.app npm run desktop
// Desktop package: npm run desktop:build
const DEFAULT_API = '/api';
const configuredApi = typeof window !== 'undefined' && window.MIZAN_API_URL ? window.MIZAN_API_URL : '';
const API_URL = (configuredApi || DEFAULT_API).replace(/\/$/, '');

const state = {
  token: localStorage.getItem('mizan_token') || '',
  user: JSON.parse(localStorage.getItem('mizan_user') || 'null'),
  currentPage: 'dashboard',
  pages: {
    dashboard: 'لوحة التحكم',
    plans: 'خطط الاشتراك',
    payments: 'طرق الدفع',
    users: 'إدارة المستخدمين',
    settings: 'الإعدادات'
  }
};

const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const nav = document.getElementById('nav');
const mainContent = document.getElementById('main-content');
const pageTitle = document.getElementById('page-title');
const userLabel = document.getElementById('user-label');

function setAuth(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem('mizan_token', token || '');
  localStorage.setItem('mizan_user', JSON.stringify(user || null));
}

function logout() {
  setAuth('', null);
  loginScreen.classList.add('active');
  appShell.classList.add('hidden');
  mainContent.innerHTML = '';
}

async function apiFetch(url, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${API_URL}${url}`, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'حدث خطأ غير متوقع');
  return data;
}

function renderNav() {
  const isAdmin = state.user && state.user.role === 'admin';
  nav.innerHTML = Object.entries(state.pages).map(([key, label]) => {
    if (!isAdmin && ['users', 'settings', 'plans', 'payments'].includes(key)) return '';
    return `<button class="nav-item ${state.currentPage === key ? 'active' : ''}" data-page="${key}">${label}</button>`;
  }).join('');

  nav.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => {
    state.currentPage = button.dataset.page;
    renderNav();
    loadPage().catch(showError);
  }));
}

function showError(error) {
  mainContent.innerHTML = `<div class="card"><div class="card-body"><p class="message">${error.message}</p></div></div>`;
}

function card(title, content) {
  return `<div class="card"><div class="card-header"><h3>${title}</h3></div><div class="card-body">${content}</div></div>`;
}

function metricCard(label, value) {
  return `<div class="card metric"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function renderDashboard(data) {
  mainContent.innerHTML = `
    <div class="grid">
      ${metricCard('المستخدمون النشطون', data.activeUsers || 0)}
      ${metricCard('المستخدمون غير النشطين', data.inactiveUsers || 0)}
      ${metricCard('عدد الخطط', (data.plans || []).length)}
      ${metricCard('وسائل الدفع', (data.paymentMethods || []).length)}
    </div>
    <div class="stack">
      ${card('نظرة عامة', `<div class="status-box"><h4>حالة النظام</h4><div>اسم الشركة: <strong>${data.company || 'Mizan AI'}</strong></div><div>العملة: <strong>${data.currency || 'SAR'}</strong></div></div>`)}
      ${card('أحدث المستخدمين', `<div class="table-wrap"><table><thead><tr><th>الاسم</th><th>الشركة</th><th>الخطة</th><th>الحالة</th></tr></thead><tbody>${(data.users || []).slice(0, 6).map((user) => `<tr><td>${user.name}</td><td>${user.company}</td><td>${user.plan ? user.plan.name : '—'}</td><td><span class="badge ${user.subscription_active ? '' : 'inactive'}">${user.subscription_active ? 'نشط' : 'غير نشط'}</span></td></tr>`).join('') || '<tr><td colspan="4">لا توجد بيانات</td></tr>'}</tbody></table></div>`)}
    </div>`;
}

async function loadDashboard() { renderDashboard(await apiFetch('/dashboard')); }

async function loadPlans() {
  const plans = await apiFetch('/plans');
  mainContent.innerHTML = card('إدارة الخطط', `<form id="plan-form" class="stack"><div class="form-grid"><div class="form-group"><label>اسم الخطة</label><input name="name" required /></div><div class="form-group"><label>السعر</label><input name="price" type="number" min="0" required /></div><div class="form-group"><label>أيام الاشتراك</label><input name="duration_days" type="number" min="1" required value="30" /></div><div class="form-group"><label>الحالة</label><select name="active"><option value="1">نشط</option><option value="0">غير نشط</option></select></div></div><div class="form-group"><label>الوصف</label><textarea name="description" rows="3"></textarea></div><button class="btn primary" type="submit">حفظ الخطة</button></form><div class="table-wrap" style="margin-top:20px"><table><thead><tr><th>الاسم</th><th>السعر</th><th>الأيام</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${plans.map((plan) => `<tr><td>${plan.name}</td><td>${Number(plan.price).toFixed(2)}</td><td>${plan.duration_days}</td><td><span class="badge ${plan.active ? '' : 'inactive'}">${plan.active ? 'نشط' : 'غير نشط'}</span></td><td><button class="small-btn danger" data-delete-plan="${plan.id}">حذف</button></td></tr>`).join('')}</tbody></table></div>`);
  document.getElementById('plan-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.price = Number(payload.price); payload.duration_days = Number(payload.duration_days); payload.active = Number(payload.active);
    await apiFetch('/plans', { method: 'POST', body: JSON.stringify(payload) }); loadPlans();
  });
  document.querySelectorAll('[data-delete-plan]').forEach((button) => button.addEventListener('click', async () => { await apiFetch(`/plans/${button.dataset.deletePlan}`, { method: 'DELETE' }); loadPlans(); }));
}

async function loadPayments() {
  const methods = await apiFetch('/payment-methods');
  mainContent.innerHTML = card('طرق الدفع', `<form id="payment-form" class="stack"><div class="form-grid"><div class="form-group"><label>الاسم</label><input name="name" required /></div><div class="form-group"><label>النوع</label><select name="type"><option value="bank">بنك</option><option value="wallet">محفظة</option><option value="cash">نقدي</option></select></div><div class="form-group"><label>اسم الحساب</label><input name="account_name" /></div><div class="form-group"><label>رقم الحساب</label><input name="account_number" /></div><div class="form-group"><label>IBAN</label><input name="iban" /></div><div class="form-group"><label>الحالة</label><select name="active"><option value="1">نشط</option><option value="0">غير نشط</option></select></div></div><button class="btn primary" type="submit">حفظ طريقة الدفع</button></form><div class="table-wrap" style="margin-top:20px"><table><thead><tr><th>الاسم</th><th>النوع</th><th>الحساب</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${methods.map((method) => `<tr><td>${method.name}</td><td>${method.type}</td><td>${method.account_name || method.account_number || method.iban || '—'}</td><td><span class="badge ${method.active ? '' : 'inactive'}">${method.active ? 'نشط' : 'غير نشط'}</span></td><td><button class="small-btn danger" data-delete-payment="${method.id}">حذف</button></td></tr>`).join('')}</tbody></table></div>`);
  document.getElementById('payment-form').addEventListener('submit', async (event) => { event.preventDefault(); const payload = Object.fromEntries(new FormData(event.target).entries()); payload.active = Number(payload.active); await apiFetch('/payment-methods', { method: 'POST', body: JSON.stringify(payload) }); loadPayments(); });
  document.querySelectorAll('[data-delete-payment]').forEach((button) => button.addEventListener('click', async () => { await apiFetch(`/payment-methods/${button.dataset.deletePayment}`, { method: 'DELETE' }); loadPayments(); }));
}

async function loadUsers() {
  const [users, plans] = await Promise.all([apiFetch('/users'), apiFetch('/plans')]);
  mainContent.innerHTML = card('إدارة المستخدمين والاشتراكات', `<form id="user-form" class="stack"><div class="form-grid"><div class="form-group"><label>اسم المستخدم</label><input name="username" required /></div><div class="form-group"><label>كلمة المرور</label><input name="password" type="password" required /></div><div class="form-group"><label>اسم العميل</label><input name="name" required /></div><div class="form-group"><label>الشركة</label><input name="company" required /></div><div class="form-group"><label>الدور</label><select name="role"><option value="user">مستخدم</option><option value="admin">مدير</option></select></div><div class="form-group"><label>الخطة</label><select name="plan_id">${plans.map((plan) => `<option value="${plan.id}">${plan.name}</option>`).join('')}</select></div></div><button class="btn primary" type="submit">إضافة مستخدم</button></form><div class="table-wrap" style="margin-top:20px"><table><thead><tr><th>الاسم</th><th>المستخدم</th><th>الشركة</th><th>الخطة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${users.map((user) => `<tr><td>${user.name}</td><td>${user.username}</td><td>${user.company}</td><td>${user.plan ? user.plan.name : '—'}</td><td><span class="badge ${user.subscription_active ? '' : 'inactive'}">${user.subscription_active ? 'نشط' : 'غير نشط'}</span></td><td><button class="small-btn" data-subscribe="${user.id}">تجديد</button></td></tr>`).join('')}</tbody></table></div>`);
  document.getElementById('user-form').addEventListener('submit', async (event) => { event.preventDefault(); const payload = Object.fromEntries(new FormData(event.target).entries()); payload.plan_id = Number(payload.plan_id); await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) }); loadUsers(); });
  document.querySelectorAll('[data-subscribe]').forEach((button) => button.addEventListener('click', async () => { const plan = plans[0]; const expiresAt = new Date(Date.now() + (plan ? plan.duration_days : 30) * 86400000).toISOString(); await apiFetch(`/subscriptions/${button.dataset.subscribe}`, { method: 'POST', body: JSON.stringify({ plan_id: plan ? plan.id : null, status: 'active', expires_at: expiresAt }) }); loadUsers(); }));
}

async function loadSettings() {
  const settings = await apiFetch('/settings');
  mainContent.innerHTML = card('الإعدادات العامة', `<form id="settings-form" class="stack"><div class="form-grid"><div class="form-group"><label>اسم الشركة</label><input name="company_name" value="${settings.company_name || 'Mizan AI'}" /></div><div class="form-group"><label>العملة</label><select name="currency"><option value="SAR" ${settings.currency === 'SAR' ? 'selected' : ''}>SAR</option><option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD</option><option value="AED" ${settings.currency === 'AED' ? 'selected' : ''}>AED</option></select></div><div class="form-group"><label>طريقة الدفع الافتراضية</label><select name="default_payment_method"><option value="bank" ${settings.default_payment_method === 'bank' ? 'selected' : ''}>بنك</option><option value="wallet" ${settings.default_payment_method === 'wallet' ? 'selected' : ''}>محفظة</option><option value="cash" ${settings.default_payment_method === 'cash' ? 'selected' : ''}>نقدي</option></select></div></div><button class="btn primary" type="submit">حفظ الإعدادات</button></form>`);
  document.getElementById('settings-form').addEventListener('submit', async (event) => { event.preventDefault(); const payload = Object.fromEntries(new FormData(event.target).entries()); for (const key of ['company_name', 'currency', 'default_payment_method']) await apiFetch(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value: payload[key] }) }); loadSettings(); });
}

async function loadPage() {
  pageTitle.textContent = state.pages[state.currentPage] || 'لوحة التحكم';
  if (state.currentPage === 'dashboard') return loadDashboard();
  if (state.currentPage === 'plans') return loadPlans();
  if (state.currentPage === 'payments') return loadPayments();
  if (state.currentPage === 'users') return loadUsers();
  if (state.currentPage === 'settings') return loadSettings();
}

async function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const messageBox = document.getElementById('login-message');
  if (!username || !password) { messageBox.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور'; return; }
  try {
    const response = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل الدخول');
    setAuth(data.token, data.user); loginScreen.classList.remove('active'); appShell.classList.remove('hidden'); userLabel.textContent = `${data.user.name} (${data.user.role})`; renderNav(); await loadPage();
  } catch (error) { messageBox.textContent = error.message; }
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('password').addEventListener('keydown', (event) => { if (event.key === 'Enter') login(); });

if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) navigator.serviceWorker.register('/service-worker.js').catch(() => {});

if (state.token && state.user) { loginScreen.classList.remove('active'); appShell.classList.remove('hidden'); userLabel.textContent = `${state.user.name} (${state.user.role})`; renderNav(); loadPage().catch(showError); } else { loginScreen.classList.add('active'); appShell.classList.add('hidden'); renderNav(); }
