# 🚀 نشر Mizan AI على Railway — النسخة النهائية الكاملة

## خطوات النشر المباشرة على Railway

### المتطلبات:
- حساب Railway (railway.app)
- حساب GitHub
- المستودع: nexaaigroupings-ui/mizan-ai

---

## الخطوة 1️⃣: إنشاء حساب وربط المستودع

1. اذهب إلى https://railway.app
2. سجل الدخول أو أنشئ حسابًا
3. اختر "New Project"
4. اختر "Deploy from GitHub Repo"
5. ابحث عن: `nexaaigroupings-ui/mizan-ai`
6. اختر الفرع: `feature/subscriptions`
7. انقر "Deploy Now"

---

## الخطوة 2️⃣: إضافة متغيرات البيئة

**داخل Railway Dashboard:**

1. اذهب إلى البرنامج → Variables
2. أضف المتغيرات التالية:

```env
PORT=3000
JWT_SECRET=Mizan-AI-Production-Secret-Key-Change-This-12345
DATABASE_PATH=/data/mizan.db
NODE_ENV=production
```

**ملاحظة:** غير قيمة `JWT_SECRET` إلى قيمة عشوائية قوية فعليًا:
```
JWT_SECRET=$(openssl rand -base64 32)
```

---

## الخطوة 3️⃣: إضافة Volume للقاعدة

**مهم جدًا:** بدون Volume ستفقد البيانات عند إعادة التشغيل!

1. في Railway → البرنامج → Data
2. أنشئ Volume جديد
3. **Mount Path:** `/data`
4. **Size:** 2GB
5. انقر "Create"

---

## الخطوة 4️⃣: تأكيد الإعدادات والنشر

1. تأكد أن البرنامج متصل بـ GitHub على الفرع `feature/subscriptions`
2. تأكد من المتغيرات البيئة الكاملة
3. تأكد من Volume معبر عنه
4. النشر سيبدأ تلقائيًا
5. انتظر حتى ظهور "Deployment Successful" ✓

---

## الخطوة 5️⃣: الوصول إلى التطبيق

**الرابط النهائي:**
```
https://mizan-ai.up.railway.app
```

**أو رابط مخصص:**
- في Railway → Domains
- أضف domain مخصص إذا أردت

---

## 🔐 بيانات الدخول الافتراضية

**حساب الإدارة:**
- المستخدم: `admin`
- كلمة المرور: `admin123`

**حساب تجريبي:**
- المستخدم: `demo`
- كلمة المرور: `customer123`

**⚠️ غير كلمات المرور فورًا بعد أول دخول!**

---

## 📱 الأنظمة المدعومة

✅ **الويب** — https://mizan-ai.up.railway.app
✅ **الأندرويد** — تطبيق Capacitor
✅ **الحاسوب** — تطبيق Electron
✅ **PWA** — تطبيق ويب متقدم
✅ **Database** — SQLite في Volume
✅ **API** — متاح عبر `/api`
✅ **SSL/TLS** — آمن عبر HTTPS
✅ **نظام الاشتراكات** — متكامل
✅ **Authentication** — JWT آمن

---

## 🎯 الميزات المتاحة

### لوحة الإدارة:
- 📊 لوحة تحكم شاملة
- 👥 إدارة المستخدمين والاشتراكات
- 💳 إدارة خطط الاشتراك (إنشاء/تعديل/حذف)
- 💰 إدارة وسائل الدفع (بنك/محفظة/نقدي)
- ⚙️ إعدادات الشركة والعملة
- 📈 إحصائيات النظام الكاملة
- 🔄 تفعيل/تجديد الاشتراكات

### للمستخدمين العاديين:
- ✅ تسجيل دخول آمن
- 🔒 عرض حالة الاشتراك
- ⏰ تنبيهات انتهاء الاشتراك
- 📱 واجهة متجاوبة (موبايل/ويب/حاسوب)

---

## 🔌 استخدام API

### 1️⃣ تسجيل الدخول:
```bash
curl -X POST https://mizan-ai.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**الرد:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "مدير النظام",
    "company": "Mizan AI",
    "role": "admin",
    "subscription_active": true
  }
}
```

### 2️⃣ استخدام Token للطلبات:
```bash
curl -X GET https://mizan-ai.up.railway.app/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3️⃣ فحص الصحة:
```bash
curl https://mizan-ai.up.railway.app/api/health
```

**الرد:**
```json
{
  "ok": true,
  "name": "Mizan AI API",
  "timestamp": "2026-09-29T16:35:39Z",
  "env": "production"
}
```

---

## 📱 تثبيت النسخة على الأندرويد

### المتطلبات:
- Android Studio (آخر نسخة)
- Android SDK (API 21+)
- Node.js (v20 أو أحدث)
- Gradle

### الخطوات:

```bash
# 1. استنساخ المستودع
git clone https://github.com/nexaaigroupings-ui/mizan-ai.git
cd mizan-ai

# 2. الانتقال للفرع الصحيح
git checkout feature/subscriptions

# 3. تثبيت جميع الحزم
npm install

# 4. إضافة Capacitor Android
npm run mobile:add

# 5. تحديث platform-config.js برابط Railway
# ملف: platform-config.js
window.MIZAN_API_URL = 'https://mizan-ai.up.railway.app/api';

# 6. المزامنة مع Android
npm run mobile:sync

# 7. فتح Android Studio
npm run mobile:open

# 8. بناء وتشغيل من Android Studio
# في Android Studio: Run → Run 'app' (أو اضغط Shift+F10)
```

### الملف المقترح للبناء النهائي:
```bash
# بناء APK للإصدار
cd android
./gradlew assembleRelease
# سيُنشئ: app/build/outputs/apk/release/app-release.apk
```

---

## 💻 تثبيت النسخة على سطح المكتب

### المتطلبات:
- Node.js (v20 أو أحدث)
- Windows/macOS/Linux

### الخطوات:

```bash
# 1. استنساخ المستودع
git clone https://github.com/nexaaigroupings-ui/mizan-ai.git
cd mizan-ai

# 2. الانتقال للفرع الصحيح
git checkout feature/subscriptions

# 3. تثبيت جميع الحزم
npm install

# 4. التشغيل المحلي
npm run desktop

# 5. أو التشغيل مع Railway
MIZAN_WEB_URL=https://mizan-ai.up.railway.app \
MIZAN_API_URL=https://mizan-ai.up.railway.app/api \
npm run desktop
```

### البناء للتوزيع:
```bash
# بناء للويندوز
npm run desktop:build -- --win

# بناء للماك
npm run desktop:build -- --mac

# بناء لينكس
npm run desktop:build -- --linux

# أو بناء جميع الأنظمة
npm run desktop:build
```

**الملفات ستكون في:** `dist/`

---

## 🌐 استخدام كـ PWA (تطبيق ويب متقدم)

### التثبيت على الويب:

1. اذهب إلى https://mizan-ai.up.railway.app
2. في المتصفح اختر: "تثبيت التطبيق"
3. أو شاركه عبر: "إضافة إلى الشاشة الرئيسية"
4. سيعمل كتطبيق كامل بدون إنترنت (مع caching)

---

## 📊 مراقبة التطبيق

### في Railway Dashboard:

1. **Logs** — عرض سجلات الأخطاء والنشاط
   - اذهب إلى: البرنامج → Logs
   - ابحث عن الأخطاء والتحذيرات

2. **Metrics** — عرض استهلاك الموارد
   - اذهب إلى: البرنامج → Metrics
   - راقب الذاكرة والـ CPU

3. **Deploy History** — سجل النشرات
   - اذهب إلى: البرنامج → Deploy
   - عرض النشرات السابقة والفاشلة

4. **Variables** — تحديث المتغيرات البيئية
   - اذهب إلى: البرنامج → Variables
   - تحديث في أي وقت دون إعادة نشر

### فحص الصحة المنتظم:
```bash
# كل دقيقة
watch -n 60 'curl -s https://mizan-ai.up.railway.app/api/health | jq .'
```

---

## 🛡️ الأمان والنسخ الاحتياطية

### نصائح أمان مهمة:

1. **غير كلمات المرور الافتراضية فورًا**
   - ادخل كـ admin
   - غير كلمة مرور كل مستخدم

2. **استخدم JWT_SECRET قوي (عشوائي طويل)**
   ```bash
   openssl rand -base64 32
   # أضف النتيجة في Railway Variables
   ```

3. **تفعيل النسخ الاحتياطية التلقائية**
   - Railway توفر نسخ احتياطية تلقائية
   - يمكنك تحميل البيانات يدويًا من Volume

4. **راقب Logs للأخطاء والمشاكل**
   - ابحث عن: ERROR, Warning, Failed
   - تحقق يوميًا من الأخطاء

5. **استخدم HTTPS فقط للاتصالات**
   - Railway يوفر HTTPS افتراضي
   - لا تستخدم HTTP

6. **حدّث JWT_SECRET شهريًا**
   - تغيير في Railway Variables
   - سيتطلب من المستخدمين تسجيل الدخول مرة أخرى

7. **اضبط صلاحيات الإدارة**
   - فقط مسؤولو النظام يمكنهم التعديل
   - مراجعة الأدوار والصلاحيات

---

## 🔄 التحديثات والصيانة

### تحديث التطبيق:

1. عدّل الكود محليًا
2. ادفع التغييرات:
   ```bash
   git add .
   git commit -m "تحديث: وصف التغيير"
   git push origin feature/subscriptions
   ```
3. Railway سينشر تلقائيًا خلال دقائق
4. تحقق من Logs للتأكد من النشر الناجح

### إعادة التشغيل:

**في Railway Dashboard:**
1. اذهب إلى البرنامج
2. اختر "Redeploy" أو "Restart"
3. انتظر حتى التشغيل الكامل

**أو عبر التحديث التلقائي:**
- Railway سيعيد النشر تلقائيًا عند أي commit جديد

---

## 📞 استكشاف الأخطاء

### المشكلة: "Deployment Failed"
```
الحل:
1. تحقق من package.json صحيح
2. تحقق من Logs في Railway
3. تأكد من npm install يعمل
4. أعد المحاولة بـ "Redeploy"
```

### المشكلة: "Database Connection Error"
```
الحل:
1. تأكد من وجود Volume في /data
2. تأكد من DATABASE_PATH صحيح
3. تحقق من صلاحيات المجلد
4. أعد النشر
```

### المشكلة: "Cannot connect from Android/Desktop"
```
الحل:
1. تأكد من استخدام HTTPS فقط
2. لا تستخدم localhost في APK
3. استخدم رابط Railway الكامل
4. تحقق من firewall
```

### المشكلة: "Unauthorized (401)"
```
الحل:
1. تأكد من JWT_SECRET صحيح في كلا الطرفين
2. تأكد من Token صحيح
3. تحقق من انتهاء صلاحية Token (8 ساعات)
4. سجل الدخول مجددًا
```

### المشكلة: "Memory Limit Exceeded"
```
الحل:
1. زيادة موارد Railway
2. تنظيف قاعدة البيانات (حذف سجلات قديمة)
3. تحسين الاستعلامات
4. ترقية الخطة إذا لزم الحال
```

---

## 📈 الإحصائيات والتقارير

**في Dashboard:**
- 👥 عدد المستخدمين النشطين/غير النشطين
- 📊 عدد الخطط المتاحة
- 💳 وسائل الدفع النشطة
- 💰 إجمالي الإيرادات المتوقعة
- 📅 تواريخ انتهاء الاشتراكات

---

## ✅ قائمة التحقق النهائية

### قبل النشر:
- ✓ تم عمل commit جميع التغييرات
- ✓ تم اختبار الكود محليًا
- ✓ تم التحقق من عدم وجود أخطاء في npm

### بعد ربط Railway:
- ✓ تم اختيار الفرع `feature/subscriptions`
- ✓ تم إضافة جميع متغيرات البيئة
- ✓ تم إنشاء Volume في `/data`
- ✓ تم التحقق من النشر الناجح

### بعد الدخول الأول:
- ✓ تم تسجيل الدخول بـ admin
- ✓ تم تغيير كلمة مرور admin
- ✓ تم تغيير كلمات مرور المستخدمين التجريبيين
- ✓ تم اختبار إضافة مستخدم جديد

### اختبار الوظائف:
- ✓ تم اختبار API بـ curl
- ✓ تم اختبار تسجيل الدخول
- ✓ تم اختبار لوحة التحكم
- ✓ تم اختبار إنشاء خطة
- ✓ تم اختبار تفعيل الاشتراك
- ✓ تم اختبار على الويب

### اختبار المنصات:
- ✓ تم اختبار Capacitor على أندرويد
- ✓ تم اختبار Electron على الحاسوب
- ✓ تم اختبار PWA على المتصفح

### المراقبة المستمرة:
- ✓ تم تفعيل مراقبة Logs
- ✓ تم تفعيل مراقبة Metrics
- ✓ تم إعداد التنبيهات (إن أمكن)

---

## 🎉 اكتمل!

المشروع الآن **منشور وعامل بنسخة واحدة على الويب والأندرويد والحاسوب!**

### الروابط النهائية:
- **الويب:** https://mizan-ai.up.railway.app
- **الـ API:** https://mizan-ai.up.railway.app/api
- **الصحة:** https://mizan-ai.up.railway.app/api/health
- **المستودع:** github.com/nexaaigroupings-ui/mizan-ai
- **الفرع:** feature/subscriptions

### للمساعدة والدعم:
- ✉️ البريد: support@mizan-ai.com (اختياري)
- 📖 التوثيق: README.md و RAILWAY_DEPLOYMENT_GUIDE.md
- 🐛 الأخطاء: تحقق من Railway Logs
- 💬 المشاكل: افتح issue في GitHub

---

**تم النشر بنجاح! 🚀**

**الآن يمكنك:**
1. ✅ الوصول للتطبيق على الويب
2. ✅ تحميل التطبيق على الأندرويد
3. ✅ تشغيل التطبيق على الحاسوب
4. ✅ إدارة المستخدمين والاشتراكات
5. ✅ مراقبة النظام والأداء
6. ✅ تحديث التطبيق تلقائيًا من GitHub

---

**شكرًا لاستخدام Mizan AI! 🎊**
