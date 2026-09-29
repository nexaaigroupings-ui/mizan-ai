# Mizan AI — الويب + Android + الحاسوب

المشروع يستخدم نفس `index.html` و`assets/` للمنصات الثلاث.

## الويب وRailway

```bash
npm install
npm start
```

متغيرات Railway:

```env
JWT_SECRET=ضع_قيمة_سرية_قوية
DATABASE_PATH=/data/mizan.db
```

أضف Volume على `/data`.

## Android

المتطلبات: Node.js، Android Studio، Android SDK.

```bash
npm install
npm run mobile:add
```

أنشئ `platform-config.js` قبل المزامنة:

```js
window.MIZAN_API_URL = 'https://YOUR-RAILWAY-DOMAIN/api';
```

ثم:

```bash
npm run mobile:sync
npm run mobile:open
```

لا تستخدم `localhost` داخل APK؛ استخدم رابط Railway عبر HTTPS.

## تطبيق الحاسوب

للتشغيل المحلي مع API محلي:

```bash
npm install
npm run desktop
```

للتشغيل مع Railway:

```bash
MIZAN_WEB_URL=https://YOUR-RAILWAY-DOMAIN MIZAN_API_URL=https://YOUR-RAILWAY-DOMAIN/api npm run desktop
```

لبناء مثبت Windows/macOS/Linux:

```bash
npm run desktop:build
```

## الحسابات التجريبية

- `admin / admin123`
- `demo / customer123`

غيّر كلمات المرور الافتراضية قبل الاستخدام الفعلي.
