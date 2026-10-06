# أثري | ATHARI

منصة عربية (RTL) لتوثيق **الأثر السريري** و**الأثر المؤسسي** في الرعاية الصحية، من رحلة المريض إلى مستوى المنشأة والنطاق والتجمع الصحي.

> **ATHARI** is an Arabic-first (RTL) web platform for documenting clinical and organizational impact in healthcare — from a single patient's journey up to facility, scope, and cluster-level dashboards and reports.

> ⚠️ **نسخة تجريبية (Demo).** جميع البيانات وهمية ومخزّنة في متصفح الزائر فقط (`localStorage`)، ولا يوجد أي Backend أو قاعدة بيانات أو بيانات مرضى حقيقية. تبديل الدور (مساهم / مراجع) متاح لأي زائر لأغراض العرض فقط، بدون تسجيل دخول.
>
> **Demo build.** All data is fictional and lives only in each visitor's own browser (`localStorage`). There is no backend, database, or real patient data. The role switcher (Contributor / Reviewer) is open to everyone for demonstration purposes — there is no authentication.

## المزايا

- **مسار الأثر السريري:** إضافة أثر مرتبط برحلة مريض (برقم الملف MRN)، نوع أثر متعدد الاختيار مع حقل «أخرى»، مشاركون متعددون، أقسام مشاركة، مصدر توثيق.
- **مسار الأثر المؤسسي:** مبادرات وآثار مؤسسية (مشروع، تدريب، سياسة، جودة، ابتكار، تحسين عملية).
- **الأدوار على كل أثر:** منشئ الأثر (Created by)، المساهمون (Contributors)، والمراجع/المعتمِد (Reviewer/Approver).
- **المراجعة والاعتماد:** اعتماد، عدم اعتماد بسبب إلزامي، أو إرجاع للتعديل بمهلة 7 أيام، مع سجل زمني كامل.
- **شهادات الأثر:** بعد الاعتماد يحصل **كل مشارك** على شهادة مستقلة باسمه مرتبطة بنفس الأثر، برمز تحقق فريد (مثل `ATH-2026-00001-C2`) ورمز QR، وقابلة للطباعة/الحفظ PDF بصيغة A4 أفقي.
- **الإرسال عبر QR (`/submit`):** مسار عام ثنائي اللغة (عربي/إنجليزي) من النطاق إلى المنشأة إلى نوع الأثر، مع تحقق تجريبي من رقم الجوال (OTP) ومتابعة الطلب برقم الأثر.
- **اللوحات والتقارير:** لوحة تنفيذية للتجمع، لوحة لكل نطاق ولكل منشأة، تقارير نطاق ومنشأة، وتقارير شهرية وسنوية (سريرية ومؤسسية) وتقرير رحلة المريض.

## التقنيات المستخدمة

- [Next.js 14](https://nextjs.org/) (App Router) + React 18 + TypeScript
- [Tailwind CSS 3](https://tailwindcss.com/) — واجهة RTL متجاوبة (جوال/حاسوب)
- [Zustand](https://github.com/pmndrs/zustand) مع `persist` (التخزين المحلي في المتصفح)
- [`qrcode`](https://github.com/soldair/node-qrcode) لتوليد رموز QR
- خط [Tajawal](https://fonts.google.com/specimen/Tajawal) من Google Fonts

## التشغيل محليًا

المتطلبات: Node.js 18.18 أو أحدث (يفضّل 20 LTS).

```bash
git clone https://github.com/alhanoufalarifi2-ops/ATHARI.git
cd ATHARI
npm install
npm run dev
```

ثم افتح <http://localhost:3001>.

| الأمر | الوصف |
| --- | --- |
| `npm run dev` | تشغيل بيئة التطوير على المنفذ 3001 |
| `npm run build` | بناء نسخة الإنتاج |
| `npm start` | تشغيل نسخة الإنتاج بعد البناء |
| `npm run lint` | فحص ESLint |
| `npm run generate:qr` | إعادة توليد رمز QR الخاص بمسار `/submit` |

## النشر (Vercel)

1. ارفع المستودع إلى GitHub.
2. من [vercel.com/new](https://vercel.com/new) استورد المستودع — الإعدادات الافتراضية لـ Next.js تعمل كما هي (لا توجد متغيرات بيئة مطلوبة للتشغيل).
3. بعد الحصول على الرابط العام، أعد توليد رمز QR بالرابط الحقيقي:

```bash
# Linux / macOS
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app npm run generate:qr
# Windows (PowerShell)
$env:NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"; npm run generate:qr
```

ثم ارفع الملف المحدّث `public/athari-submit-qr.png`.

## إعادة تعيين البيانات التجريبية

احذف بيانات الموقع المحلية (Local Storage) من إعدادات المتصفح لعنوان الموقع، وستعود البيانات التجريبية إلى حالتها الأصلية.

## هيكل المشروع

```
app/            صفحات Next.js (App Router)
  cluster/      اللوحة التنفيذية، النطاقات، المنشآت، وتقاريرها
  dashboard/    لوحة الأثر السريري
  org/          مسار الأثر المؤسسي (لوحة، مبادرات، مراجعة، تقارير)
  patients/     المرضى ورحلة المريض
  add-impact/   نموذج إضافة أثر سريري
  review/       قائمة وتفاصيل المراجعة (دور المراجع)
  reports/      تقارير سريرية: رحلة مريض، شهري، سنوي
  submit/       مسار الإرسال العام عبر QR، المتابعة، والشهادات
components/     مكوّنات واجهة قابلة لإعادة الاستخدام
lib/            الأنواع، البيانات التجريبية، المخزن (zustand)، الترجمات، أدوات مساعدة
scripts/        سكربت توليد رمز QR
public/         الشعارات ورمز QR
```

## ملاحظات

- لا تحتوي هذه النسخة على أي مفاتيح أو أسرار. الملف `.env.example` يوضح المتغير الوحيد الاختياري (`NEXT_PUBLIC_BASE_URL`) المستخدم عند توليد QR فقط.
- التحقق من الجوال (OTP) محاكاة بالكامل: الرمز يُولَّد ويُعرض داخل الواجهة ولا تُرسل أي رسائل فعلية.
- لا يوجد ترخيص مفتوح المصدر محدد حاليًا — جميع الحقوق محفوظة لصاحبة المشروع.
