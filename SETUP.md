# METANOIA – ميتانويا | دليل التشغيل

## 1) المتطلبات
- Node.js 18+ و npm
- حساب على [Supabase](https://supabase.com)

## 2) إنشاء مشروع Supabase
1. اذهب إلى https://supabase.com/dashboard وأنشئ مشروع جديد.
2. من **Project Settings → API** خد:
   - `Project URL`
   - `anon public key`
3. من **SQL Editor** افتح `supabase_schema.sql` اللي في المشروع وشغّله (Run).
4. من **Authentication → Users → Add User** أنشئ مستخدم للأب:
   - الإيميل الحقيقي اللي هيستخدمه للدخول واستعادة الباسورد
   - باسورد قوي
   - فعّل خيار "Auto Confirm User" عشان يقدر يدخل فورًا.

## 3) إعداد الملفات
```bash
cp .env.example .env