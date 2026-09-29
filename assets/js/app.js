const API_URL = window.MIZAN_API_URL || '/api';
let currentUser = null;
let currentToken = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appShell = document.getElementById('app-shell');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');
const logoutBtn = document.getElementById('logout-btn');
const mainContent = document.getElementById('main-content');
const userLabel = document.getElementById('user-label');
const pageTitle = document.getElementById('page-title');
const nav = document.getElementById('nav');

// Event Listeners
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showLoginMessage('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      currentToken = data.token;
      localStorage.setItem('mizan_token', currentToken);
      localStorage.setItem('mizan_user', JSON.stringify(currentUser));
      showApp();
    } else {
      showLoginMessage(data.message || 'فشل تسجيل الدخول', 'error');
    }
  } catch (error) {
    showLoginMessage('خطأ في الاتصال بالخادم', 'error');
    console.error(error);
  }
}

// Handle Logout
function handleLogout() {
  currentUser = null;
  currentToken = null;
  localStorage.removeItem('mizan_token');
  localStorage.removeItem('mizan_user');
  usernameInput.value = '';
  passwordInput.value = '';
  loginMessage.textContent = '';
  showLogin();
}

// Show Login Screen
function showLogin() {
  loginScreen.classList.remove('hidden');
  appShell.classList.add('hidden');
}

// Show App
function showApp() {
  loginScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
  userLabel.textContent = currentUser.name || currentUser.username;
  renderNav();
  loadDashboard();
}

// Render Navigation
function renderNav() {
  const navItems = [
    { id: 'dashboard', label: '📊 لوحة التحكم', icon: '📊' },
    { id: 'users', label: '👥 المستخدمون', icon: '👥', adminOnly: true },
    { id: 'plans', label: '💳 خطط الاشتراك', icon: '💳', adminOnly: true },
    { id: 'payments', label: '💰 وسائل الدفع', icon: '💰', adminOnly: true },
    { id: 'settings', label: '⚙️ الإعدادات', icon: '⚙️', adminOnly: true }
  ];

  nav.innerHTML = '';
  navItems.forEach(item => {
    if (item.adminOnly && currentUser.role !== 'admin') return;
    const li = document.createElement('li');
    li.className = 'nav-item' + (item.id === 'dashboard' ? ' active' : '');
    li.textContent = item.label;
    li.onclick = () => loadPage(item.id);
    nav.appendChild(li);
  });
}

// Load Page
async function loadPage(page) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  event.target.classList.add('active');
  pageTitle.textContent = event.target.textContent;

  switch (page) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'users':
      loadUsers();
      break;
    case 'plans':
      loadPlans();
      break;
    case 'payments':
      loadPayments();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Load Dashboard
async function loadDashboard() {
  try {
    const response = await fetch(`${API_URL}/dashboard`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await response.json();

    if (response.ok) {
      mainContent.innerHTML = `
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-title">المستخدمون النشطون</div>
            <div class="card-value">${data.activeUsers}</div>
            <div class="card-subtitle">عدد المستخدمين بخطة نشطة</div>
          </div>
          <div class="card">
            <div class="card-title">المستخدمون غير النشطين</div>
            <div class="card-value">${data.inactiveUsers}</div>
            <div class="card-subtitle">بدون اشتراك نشط</div>
          </div>
          <div class="card">
            <div class="card-title">عدد الخطط</div>
            <div class="card-value">${data.plans.length}</div>
            <div class="card-subtitle">خطط الاشتراك المتاحة</div>
          </div>
          <div class="card">
            <div class="card-title">وسائل الدفع</div>
            <div class="card-value">${data.paymentMethods.length}</div>
            <div class="card-subtitle">طرق الدفع النشطة</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 20px;">آخر المستخدمين</h3>
        <table>
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>الاسم</th>
              <th>الشركة</th>
              <th>الحالة</th>
              <th>الصلاحية</th>
            </tr>
          </thead>
          <tbody>
            ${data.users.slice(0, 5).map(user => `
              <tr>
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.company}</td>
                <td><span class="badge ${user.subscription_active ? 'success' : 'danger'}">${user.status}</span></td>
                <td>${new Date(user.expires_at).toLocaleDateString('ar-SA')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  } catch (error) {
    mainContent.innerHTML = '<p style="color: red;">خطأ في تحميل لوحة التحكم</p>';
    console.error(error);
  }
}

// Load Users
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const users = await response.json();

    mainContent.innerHTML = `
      <button class="btn primary" style="margin-bottom: 20px;" onclick="showAddUserForm()">+ إضافة مستخدم جديد</button>
      <table>
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>الاسم</th>
            <th>الشركة</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>${user.username}</td>
              <td>${user.name}</td>
              <td>${user.company}</td>
              <td>${user.role}</td>
              <td><span class="badge ${user.subscription_active ? 'success' : 'danger'}">${user.status}</span></td>
              <td><button class="btn primary" style="padding: 6px 12px; font-size: 12px;" onclick="editUser(${user.id})">تعديل</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    mainContent.innerHTML = '<p style="color: red;">خطأ في تحميل المستخدمين</p>';
  }
}

// Load Plans
async function loadPlans() {
  try {
    const response = await fetch(`${API_URL}/plans`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const plans = await response.json();

    mainContent.innerHTML = `
      <button class="btn primary" style="margin-bottom: 20px;" onclick="showAddPlanForm()">+ إضافة خطة جديدة</button>
      <table>
        <thead>
          <tr>
            <th>اسم الخطة</th>
            <th>السعر</th>
            <th>المدة</th>
            <th>الوصف</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${plans.map(plan => `
            <tr>
              <td>${plan.name}</td>
              <td>${plan.price} ${(currentUser.company_currency || 'SAR')}</td>
              <td>${plan.duration_days} يوم</td>
              <td>${plan.description}</td>
              <td><span class="badge ${plan.active ? 'success' : 'danger'}">${plan.active ? 'نشط' : 'غير نشط'}</span></td>
              <td><button class="btn primary" style="padding: 6px 12px; font-size: 12px;" onclick="editPlan(${plan.id})">تعديل</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    mainContent.innerHTML = '<p style="color: red;">خطأ في تحميل الخطط</p>';
  }
}

// Load Payments
async function loadPayments() {
  try {
    const response = await fetch(`${API_URL}/payment-methods`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const methods = await response.json();

    mainContent.innerHTML = `
      <button class="btn primary" style="margin-bottom: 20px;" onclick="showAddPaymentForm()">+ إضافة وسيلة دفع</button>
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>النوع</th>
            <th>صاحب الحساب</th>
            <th>الحساب</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          ${methods.map(method => `
            <tr>
              <td>${method.name}</td>
              <td>${method.type}</td>
              <td>${method.account_name}</td>
              <td>${method.account_number}</td>
              <td><span class="badge ${method.active ? 'success' : 'danger'}">${method.active ? 'نشط' : 'غير نشط'}</span></td>
              <td><button class="btn primary" style="padding: 6px 12px; font-size: 12px;" onclick="editPayment(${method.id})">تعديل</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    mainContent.innerHTML = '<p style="color: red;">خطأ في تحميل وسائل الدفع</p>';
  }
}

// Load Settings
async function loadSettings() {
  mainContent.innerHTML = `
    <div class="card">
      <h3>إعدادات عامة</h3>
      <div style="margin-top: 20px;">
        <label class="field-label">اسم الشركة</label>
        <input type="text" id="company-name" placeholder="اسم الشركة" />
        <label class="field-label">العملة</label>
        <input type="text" id="currency" placeholder="الرمز" />
        <button class="btn primary" onclick="saveSettings()">حفظ</button>
      </div>
    </div>
  `;
}

// Helper Functions
function showLoginMessage(message, type) {
  loginMessage.textContent = message;
  loginMessage.className = 'message ' + type;
}

function showAddUserForm() {
  const form = prompt('أدخل بيانات المستخدم (username:password:name)');
  if (form) {
    const [username, password, name] = form.split(':');
    if (username && password && name) {
      addUser(username, password, name);
    }
  }
}

async function addUser(username, password, name) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ username, password, name, company: name, role: 'user' })
    });

    if (response.ok) {
      alert('تم إضافة المستخدم بنجاح');
      loadUsers();
    } else {
      alert('فشل إضافة المستخدم');
    }
  } catch (error) {
    console.error(error);
  }
}

function editUser(id) {
  alert(`تعديل المستخدم ${id}`);
}

function showAddPlanForm() {
  const form = prompt('أدخل بيانات الخطة (name:price:days:description)');
  if (form) {
    const [name, price, days, description] = form.split(':');
    if (name && price && days) {
      addPlan(name, parseFloat(price), parseInt(days), description);
    }
  }
}

async function addPlan(name, price, duration_days, description) {
  try {
    const response = await fetch(`${API_URL}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ name, price, duration_days, description })
    });

    if (response.ok) {
      alert('تم إضافة الخطة بنجاح');
      loadPlans();
    } else {
      alert('فشل إضافة الخطة');
    }
  } catch (error) {
    console.error(error);
  }
}

function editPlan(id) {
  alert(`تعديل الخطة ${id}`);
}

function showAddPaymentForm() {
  const form = prompt('أدخل بيانات وسيلة الدفع (name:type:account_name:account_number)');
  if (form) {
    const [name, type, account_name, account_number] = form.split(':');
    if (name && type && account_name && account_number) {
      addPayment(name, type, account_name, account_number);
    }
  }
}

async function addPayment(name, type, account_name, account_number) {
  try {
    const response = await fetch(`${API_URL}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ name, type, account_name, account_number })
    });

    if (response.ok) {
      alert('تم إضافة وسيلة الدفع بنجاح');
      loadPayments();
    } else {
      alert('فشل إضافة وسيلة الدفع');
    }
  } catch (error) {
    console.error(error);
  }
}

function editPayment(id) {
  alert(`تعديل وسيلة الدفع ${id}`);
}

async function saveSettings() {
  const companyName = document.getElementById('company-name').value;
  const currency = document.getElementById('currency').value;

  await fetch(`${API_URL}/settings/company_name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify({ value: companyName })
  });

  await fetch(`${API_URL}/settings/currency`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify({ value: currency })
  });

  alert('تم حفظ الإعدادات');
}

// Initialize
window.addEventListener('load', () => {
  const token = localStorage.getItem('mizan_token');
  const user = localStorage.getItem('mizan_user');

  if (token && user) {
    currentToken = token;
    currentUser = JSON.parse(user);
    showApp();
  } else {
    showLogin();
  }
});
