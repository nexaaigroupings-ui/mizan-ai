const API_URL = '/api';

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
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_URL}${url}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'حدث خطأ غير متوقع');
  }

  return data;
}

function renderNav() {
  const items = Object.entries(state.pages).map(([key, label]) => {
    const isAdmin = state.user && state.user.role === 'admin';
    if ((key === 'users' || key === 'settings' || key === 'plans' || key === 'payments') && !isAdmin) {
      return null;
    }
    return `
      <button class="nav-item ${state.currentPage === key ? 'active' : ''}" data-page="${key}">
        ${label}
      </button>
    `;
  });

  nav.innerHTML = items.filter(Boolean).join('');
  nav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.currentPage = btn.dataset.page;
      renderNav();
      loadPage();
    });
  });
}

function card(title, content) {
  return `
    <div class="card">
      <div class="card-header">
        <h3>${title}</h3>
      </div>
      <div class="card-body">${content}</div>
    </div>
  `;
}

function metricCard(label, value) {
  return `
    <div class="card metric">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  `;
}

function renderDashboard(data) {
  const active = data.activeUsers || 0;
  const inactive = data.inactiveUsers || 0;

  const html = `
    <div class="grid">
      ${metricCard('المستخدمون النشطون', active)}
      ${metricCard('المستخدمون غير النشطين', inactive)}
      ${metricCard('عدد الخطط', (data.plans || []).length)}
      ${metricCard('وسائل الدفع', (data.paymentMethods || []).length)}
    </div>

    <div class="stack">
      ${card('نظرة عامة', `
        <div class="status-box">
          <h4>حالة النظام</h4>
          <div>اسم الشركة: <strong>${data.company || 'Mizan AI'}</strong></div>
          <div>العملة: <strong>${data.currency || 'SAR'}</strong></div>
        </div>
      `)}

      ${card('أحدث المستخدمين', `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الشركة</th>
                <th>الخطة</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${(data.users || []).slice(0, 6).map((user) => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.company}</td>
                  <td>${user.plan ? user.plan.name : '—'}</td>
                  <td><span class="badge ${user.subscription_active ? '' : 'inactive'}">${user.subscription_active ? 'نشط' : 'غير نشط'}</span></td>
                </tr>
              `).join('') || '<tr><td colspan="4">لا توجد بيانات</td></tr>'}
            </tbody>
          </table>
        </div>
      `)}
    </div>
  `;

  mainContent.innerHTML = html;
}

async function loadDashboard() {
  const data = await apiFetch('/dashboard');
  renderDashboard(data);
}

async function loadPlans() {
  const plans = await apiFetch('/plans');
  const html = `
    <div class="card">
      <div class="card-header">
        <h3>إدارة الخطط</h3>
      </div>
      <div class="card-body">
        <form id="plan-form" class="stack">
          <div class="form-grid">
            <div class="form-group">
              <label>اسم الخطة</label>
              <input name="name" required placeholder="مثال: Premium" />
            </div>
            <div class="form-group">
              <label>السعر</label>
              <input name="price" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label>أيام الاشتراك</label>
              <input name="duration_days" type="number" min="1" required value="30" />
            </div>
            <div class="form-group">
              <label>الحالة</label>
              <select name="active">
                <option value="1">نشط</option>
                <option value="0">غير نشط</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>الوصف</label>
            <textarea name="description" rows="3" placeholder="وصف الخطة"></textarea>
          </div>
          <div class="actions">
            <button class="btn primary" type="submit">حفظ الخطة</button>
          </div>
        </form>

        <div class="table-wrap" style="margin-top:20px;">
          <table>
            <thead>
              <tr>
                <th>اسم الخطة</th>
                <th>السعر</th>
                <th>الأيام</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${(plans || []).map((plan) => `
                <tr>
                  <td>${plan.name}</td>
                  <td>${Number(plan.price).toFixed(2)} ${state.user && state.user.company ? '' : ''}</td>
                  <td>${plan.duration_days}</td>
                  <td><span class="badge ${plan.active ? '' : 'inactive'}">${plan.active ? 'نشط' : 'غير نشط'}</span></td>
                  <td>
                    <button class="small-btn danger" data-delete-plan="${plan.id}">حذف</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="5">لا توجد خطط</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;
  document.getElementById('plan-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.price = Number(payload.price);
    payload.duration_days = Number(payload.duration_days);
    payload.active = Number(payload.active);

    await apiFetch('/plans', { method: 'POST', body: JSON.stringify(payload) });
    state.currentPage = 'plans';
    loadPlans();
  });

  document.querySelectorAll('[data-delete-plan]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deletePlan;
      await apiFetch(`/plans/${id}`, { method: 'DELETE' });
      loadPlans();
    });
  });
}

async function loadPayments() {
  const methods = await apiFetch('/payment-methods');
  const html = `
    <div class="card">
      <div class="card-header">
        <h3>طرق الدفع</h3>
      </div>
      <div class="card-body">
        <form id="payment-form" class="stack">
          <div class="form-grid">
            <div class="form-group">
              <label>اسم طريقة الدفع</label>
              <input name="name" required placeholder="مثل بنك الرياض" />
            </div>
            <div class="form-group">
              <label>النوع</label>
              <select name="type">
                <option value="bank">بنك</option>
                <option value="wallet">محفظة</option>
                <option value="cash">نقدي</option>
              </select>
            </div>
            <div class="form-group">
              <label>اسم الحساب</label>
              <input name="account_name" placeholder="اسم صاحب الحساب" />
            </div>
            <div class="form-group">
              <label>رقم الحساب</label>
              <input name="account_number" placeholder="رقم الحساب" />
            </div>
            <div class="form-group">
              <label>IBAN</label>
              <input name="iban" placeholder="IBAN" />
            </div>
            <div class="form-group">
              <label>الحالة</label>
              <select name="active">
                <option value="1">نشط</option>
                <option value="0">غير نشط</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button class="btn primary" type="submit">حفظ طريقة الدفع</button>
          </div>
        </form>

        <div class="table-wrap" style="margin-top:20px;">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>النوع</th>
                <th>الحساب</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${(methods || []).map((method) => `
                <tr>
                  <td>${method.name}</td>
                  <td>${method.type}</td>
                  <td>${method.account_name || method.account_number || method.iban || '—'}</td>
                  <td><span class="badge ${method.active ? '' : 'inactive'}">${method.active ? 'نشط' : 'غير نشط'}</span></td>
                  <td>
                    <button class="small-btn danger" data-delete-payment="${method.id}">حذف</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="5">لا توجد طرق دفع</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;

  document.getElementById('payment-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    payload.active = Number(payload.active);

    await apiFetch('/payment-methods', { method: 'POST', body: JSON.stringify(payload) });
    loadPayments();
  });

  document.querySelectorAll('[data-delete-payment]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deletePayment;
      await apiFetch(`/payment-methods/${id}`, { method: 'DELETE' });
      loadPayments();
    });
  });
}

async function loadUsers() {
  const users = await apiFetch('/users');
  const plans = await apiFetch('/plans');
  const html = `
    <div class="card">
      <div class="card-header">
        <h3>إدارة المستخدمين والاشتراكات</h3>
      </div>
      <div class="card-body">
        <form id="user-form" class="stack">
          <div class="form-grid">
            <div class="form-group"><label>اسم المستخدم</label><input name="username" required /></div>
            <div class="form-group"><label>كلمة المرور</label><input name="password" type="password" required /></div>
            <div class="form-group"><label>اسم العميل</label><input name="name" required /></div>
            <div class="form-group"><label>الشركة</label><input name="company" required /></div>
            <div class="form-group"><label>الدور</label><select name="role"><option value="user">مستخدم</option><option value="admin">مدير</option></select></div>
            <div class="form-group"><label>الخطة</label><select name="plan_id">${(plans || []).map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
          </div>
          <div class="actions">
            <button class="btn primary" type="submit">إضافة مستخدم</button>
          </div>
        </form>

        <div class="table-wrap" style="margin-top:20px;">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>المستخدم</th>
                <th>الشركة</th>
                <th>الخطة</th>
                <th>الاشتراك</th>
                <th>تجديد</th>
              </tr>
            </thead>
            <tbody>
              ${(users || []).map((user) => `
                <tr>
                  <td>${user.name}</td>
                  <td>${user.username}</td>
                  <td>${user.company}</td>
                  <td>${user.plan ? user.plan.name : '—'}</td>
                  <td><span class="badge ${user.subscription_active ? '' : 'inactive'}">${user.subscription_active ? 'نشط' : 'غير نشط'}</span></td>
                  <td>
                    <button class="small-btn" data-subscribe="${user.id}">تفعيل</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6">لا يوجد مستخدمون</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;

  document.getElementById('user-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    payload.plan_id = Number(payload.plan_id);
    await apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) });
    loadUsers();
  });

  document.querySelectorAll('[data-subscribe]').forEach((button) => {
    button.addEventListener('click', async () => {
      const userId = button.dataset.subscribe;
      const plan = (await apiFetch('/plans'))[0];
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await apiFetch(`/subscriptions/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ plan_id: plan ? plan.id : null, status: 'active', expires_at: expiresAt })
      });
      loadUsers();
    });
  });
}

async function loadSettings() {
  const settings = await apiFetch('/settings');
  const html = `
    <div class="card">
      <div class="card-header">
        <h3>الإعدادات العامة</h3>
      </div>
      <div class="card-body">
        <form id="settings-form" class="stack">
          <div class="form-grid">
            <div class="form-group">
              <label>اسم الشركة</label>
              <input name="company_name" value="${settings.company_name || 'Mizan AI'}" />
            </div>
            <div class="form-group">
              <label>العملة</label>
              <select name="currency">
                <option value="SAR" ${settings.currency === 'SAR' ? 'selected' : ''}>SAR</option>
                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD</option>
                <option value="AED" ${settings.currency === 'AED' ? 'selected' : ''}>AED</option>
              </select>
            </div>
            <div class="form-group">
              <label>طريقة الدفع الافتراضية</label>
              <select name="default_payment_method">
                <option value="bank" ${settings.default_payment_method === 'bank' ? 'selected' : ''}>بنك</option>
                <option value="wallet" ${settings.default_payment_method === 'wallet' ? 'selected' : ''}>محفظة</option>
                <option value="cash" ${settings.default_payment_method === 'cash' ? 'selected' : ''}>نقدي</option>
              </select>
            </div>
          </div>
          <div class="actions">
            <button class="btn primary" type="submit">حفظ الإعدادات</button>
          </div>
        </form>
      </div>
    </div>
  `;

  mainContent.innerHTML = html;

  document.getElementById('settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    await apiFetch('/settings/company_name', { method: 'PUT', body: JSON.stringify({ value: payload.company_name }) });
    await apiFetch('/settings/currency', { method: 'PUT', body: JSON.stringify({ value: payload.currency }) });
    await apiFetch('/settings/default_payment_method', { method: 'PUT', body: JSON.stringify({ value: payload.default_payment_method }) });
    loadSettings();
  });
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

  if (!username || !password) {
    messageBox.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
    return;
  }

  try {
    const data = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(async (r) => {
      const parsed = await r.json();
      if (!r.ok) throw new Error(parsed.message || 'فشل الدخول');
      return parsed;
    });

    setAuth(data.token, data.user);
    loginScreen.classList.remove('active');
    appShell.classList.remove('hidden');
    userLabel.textContent = `${data.user.name} (${data.user.role})`;
    renderNav();
    await loadPage();
  } catch (error) {
    messageBox.textContent = error.message;
  }
}

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('password').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') login();
});

if (state.token && state.user) {
  loginScreen.classList.remove('active');
  appShell.classList.remove('hidden');
  userLabel.textContent = `${state.user.name} (${state.user.role})`;
  renderNav();
  loadPage();
} else {
  loginScreen.classList.add('active');
  appShell.classList.add('hidden');
  renderNav();
}
