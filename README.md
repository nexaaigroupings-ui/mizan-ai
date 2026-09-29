# تشغيل Mizan AI على الويب وأندرويد والحاسوب

## نفس الكود

الواجهة الموجود�� في `index.html` و`assets/` مشتركة بين الويب وAndroid وElectron.

## الويب وRailway

```bash
npm install
npm start
```

في Railway استخدم:

```env
JWT_SECRET=ضع_قيمة_سرية_قوية
DATABASE_PATH=/data/mizan.db
```

وأضف Volume على `/data`.

## Android عبر Capacitor

ثبت Android Studio وAndroid SDK ثم نفذ:

```bash
npm install
npm run mobile:add
npm run mobile:sync
npm run mobile:open
```

إذا كان الـ API منشورًا على Railway، أنشئ ملف `platform-config.js` قبل المزامنة وضع فيه:

```js
window.MIZAN_API_URL = 'https://YOUR-RAILWAY-DOMAIN/api';
```

ثم نفذ `npm run mobile:sync` وابنِ التطبيق من Android Studio.

يمكن بدل ذلك ضبط `CAPACITOR_SERVER_URL` على رابط Railway لتحميل الواجهة المنشورة.

## تطبيق الحاسوب عبر Electron

للتطوير المحلي:

```bash
npm install
electron .
```

لتشغيل نسخة سطح المكتب من الواجهة المنشورة:

```bash
MIZAN_WEB_URL=https://YOUR-RAILWAY-DOMAIN npm run desktop
```

لبناء مثبت Windows/macOS/Linux:

```bash
npm run desktop:build
```

## ملاحظة مهمة

Android والحاسوب يستخدمان نفس الواجهة، لكنهما يحتاجان الوصول إلى API منشور وآمن عبر HTTPS. لا تستخدم `localhost` داخل التطبيق المثبت؛ استخدم رابط Railway الحقيقي.
