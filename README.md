# Mizan AI

## المتطلبات

- Node.js 22.x
- npm

## التثبيت

```bash
npm install
```

## التشغيل محلياً

```bash
npm start
```

## المتغيرات البيئية

```env
PORT=3000
JWT_SECRET=change_this_to_a_secure_secret
DATABASE_PATH=./data/mizan.db
```

## بيانات الدخول الافتراضية

- admin / admin123
- demo / customer123

## النشر على Railway

1. أضف المشروع إلى GitHub
2. اربط المستودع بـ Railway
3. اختر `Deploy from GitHub repo`
4. أضف متغيرات البيئة:
   - `PORT=3000`
   - `JWT_SECRET=your_secure_secret`
   - `DATABASE_PATH=/data/mizan.db`
5. أضف Volume في Railway على المسار `/data`
6. قم بالنشر

## ملاحظة

تم إتاحة دعم كامل للاشتراكات، إدارة خطط الاشتراك، طرق الدفع، وتكوين الشركة. إذا انتهت مدة الاشتراك يمنع الدخول إلى التطبيق إلا بعد تجديد الاشتراك.
