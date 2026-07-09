# DEPLOY - تعليمات النشر

## النشر عبر Netlify (موصى به)

### الطريقة 1: عبر واجهة Netlify
1. سجل الدخول إلى [netlify.com](https://netlify.com)
2. اضغط "Add new site" → "Import an existing project"
3. قم بربط مستودع Git الخاص بك
4. إعدادات البناء:
   - **Build command**: `cd artifacts/athkari && pnpm install && pnpm run build`
   - **Publish directory**: `artifacts/athkari/dist/public`
5. اضغط "Deploy site"

### الطريقة 2: عبر Netlify CLI
```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# البناء
cd artifacts/athkari
npm install
npm run build

# النشر
netlify deploy --prod --dir=dist/public
```

### ملف الإعداد
- `netlify.toml` موجود في جذر المشروع
- يدعم rewrites لروابط SPA

## النشر عبر Vercel (بديل)

### Build Settings
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm --filter @workspace/athkari run build`
- Output Directory: `artifacts/athkari/dist/public`

### ملف الإعداد
- `vercel.json` موجود في جذر المشروع
- يدعم rewrites لروابط SPA

## النشر عبر Google Cloud Platform (بديل)

### المتطلبات
- حساب Google Cloud
- Node.js 24
- pnpm

### خطوات النشر

#### 1. بناء المشروع
```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/athkari run build
```

#### 2. مجلد الإخراج
- المسار: `artifacts/athkari/dist/public`
- يحتوي على جميع الملفات الثابتة

#### 3. النشر على Google Cloud Storage
```bash
gsutil rsync -R artifacts/athkari/dist/public gs://your-bucket-name
```

#### 4. إعداد Cloud CDN (اختياري)
- تفعيل CDN لتحسين الأداء
- إعداد cache headers للملفات الثابتة

#### 5. إعداد Load Balancer
- توجيه الحركة إلى Cloud Storage
- إعداد SSL certificate

## الملاحظات
- المشروع تطبيق SPA (Single Page Application)
- جميع الملفات ثابتة (static)
- لا حاجة لخادم backend للواجهة
- البيانات تُجلب من API خارجية (hisnmuslim.com, aladhan.com)
