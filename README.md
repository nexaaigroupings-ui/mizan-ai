# 🚀 Mizan AI — نسخة الإنتاج النهائية

**منصة إدارة الاشتراكات والحسابات المتكاملة** مع دعم كامل للويب والأندرويد والحاسوب

---

## 📋 المميزات

✅ **لوحة إدارة شاملة** — إدارة المستخدمين والاشتراكات والخطط
✅ **نظام اشتراكات متقدم** — خطط مرنة وتحكم كامل
✅ **وسائل دفع متعددة** — بنك، محفظة رقمية، نقدي
✅ **آمان عالي** — JWT و bcrypt و SSL/TLS
✅ **API قوي** — REST API كامل مع توثيق
✅ **واجهة سهلة** — تصميم عصري وسهل الاستخدام
✅ **دعم RTL** — واجهة كاملة باللغة العربية
✅ **متعدد المنصات** — ويب، أندرويد، حاسوب

---

## 🌐 الرابط المباشر

**https://mizan-ai.up.railway.app**

---

## 🔑 بيانات الدخول

### حساب الإدارة
- المستخدم: `admin`
- كلمة المرور: `admin123`

### حساب تجريبي
- المستخدم: `demo`
- كلمة المرور: `customer123`

⚠️ **غير كلمات المرور فورًا بعد أول دخول!**

---

## 🛠️ التثبيت المحلي

```bash
# استنساخ المستودع
git clone https://github.com/nexaaigroupings-ui/mizan-ai.git
cd mizan-ai

# تثبيت الحزم
npm install

# التشغيل المحلي
npm start

# سيفتح على: http://localhost:3000
```

---

## 📱 تثبيت على الأندرويد

```bash
# إضافة Capacitor Android
npm run mobile:add

# مزامنة الملفات
npm run mobile:sync

# فتح Android Studio
npm run mobile:open

# من Android Studio: Run → Run 'app'
```

---

## 💻 تثبيت على الحاسوب

```bash
# التشغيل مع Railway
MIZAN_WEB_URL=https://mizan-ai.up.railway.app npm run desktop

# البناء للتوزيع
npm run desktop:build
```

---

## 🔌 استخدام API

### تسجيل الدخول
```bash
curl -X POST https://mizan-ai.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### فحص الصحة
```bash
curl https://mizan-ai.up.railway.app/api/health
```

---

## 📊 الإحصائيات

- **المستخدمون النشطون** — عرض مباشر
- **الخطط المتاحة** — إدارة مرنة
- **وسائل الدفع** — تتبع كامل
- **الإيرادات** — تقارير شاملة

---

## 🔒 الأمان

- JWT للتوثيق (8 ساعات)
- تشفير bcrypt لكلمات المرور
- SSL/TLS للاتصالات
- حماية من CORS
- Input validation شامل

---

## 📖 التوثيق

- **RAILWAY_DEPLOYMENT_GUIDE.md** — دليل النشر الكامل
- **API Endpoints** — شرح جميع النقاط
- **Database Schema** — هيكل قاعدة البيانات

---

## 🚀 النشر على Railway

1. اذهب إلى https://railway.app
2. اربط المستودع
3. أضف متغيرات البيئة
4. أنشئ Volume في `/data`
5. ابدأ النشر

---

## 📞 المساعدة

- 📖 اقرأ: RAILWAY_DEPLOYMENT_GUIDE.md
- 🐛 تقرير الأخطاء: افتح Issue على GitHub
- 💬 استفسارات: راجع الـ FAQ

---

**تم النشر بنجاح! 🎉**

النسخة: v3.2.0 | الترخيص: MIT
