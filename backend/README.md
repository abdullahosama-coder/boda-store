# Boda Store API (FastAPI + SQLAlchemy)

## التشغيل محليًا
```bash
cd backend
python -m venv venv && source venv/bin/activate      # ويندوز: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # غيّر ADMIN_PASSWORD و SECRET_KEY (مهم!)
python seed.py products-data.js     # استيراد المنتجات والأقسام (مرة واحدة)
uvicorn app.main:app --reload --port 8000
```
التوثيق التفاعلي لكل الـ APIs: http://127.0.0.1:8000/docs

## الـ APIs
| الطريقة | المسار | الوصف |
|---|---|---|
| GET | /api/products?cat=&sub=&q=&offers=true&page=&limit= | منتجات الموقع (المخفي مش بيظهر) |
| GET | /api/products/{id} · /api/categories | منتج واحد · الأقسام |
| POST | /api/orders | إنشاء طلب (الأسعار بتتحسب من الداتابيز) |
| POST | /api/messages | رسالة تواصل |
| GET | /api/orders/{id}?phone= | عرض طلب لصفحة تأكيد الطلب (التحقق برقم الطلب + آخر 7 أرقام من التليفون) |
| PATCH | /api/orders/{id} | تعديل الطلب: `phone` + `items` (كميات / حذف / إضافة) و/أو بيانات الشحن — بس طول ما الحالة new أو processing |
| POST | /api/orders/{id}/cancel | إلغاء الطلب (بيرجّع المخزون) |
| POST | /api/auth/login | دخول الأدمن ← token |
| GET/POST/PUT/PATCH/DELETE | /api/admin/products[/{id}] , POST /bulk-delete | إدارة المنتجات (بفلاتر وصفحات) |
| POST/PUT/DELETE | /api/admin/categories[/{name}] | إدارة الأقسام |
| GET/PATCH, POST bulk-delete | /api/admin/orders | الطلبات وتغيير الحالة |
| GET/PATCH, POST bulk-delete | /api/admin/messages | الرسائل |
| POST | /api/admin/upload | رفع صورة (JPG/PNG/GIF/WEBP حتى 5MB) |

كل مسارات `/api/admin/*` محتاجة هيدر `Authorization: Bearer <token>`.

## ملاحظات الطلبات
- الأسعار والمخزون دايمًا من الداتابيز؛ تعديل الطلب بيرجّع الكميات القديمة للمخزون وبعدين يخصم الجديدة، ولو فشل بيرجع كل حاجة زي ما كانت.
- بعد الشحن (`shipped`) أو الإلغاء الطلب بيتقفل: التعديل والإلغاء بيرجّعوا 409.
- تغيير الحالة من الأدمن لـ `cancelled` بيرجّع المخزون، وفكّ الإلغاء بيخصمه تاني.
- محاولات رقم التليفون الغلط ليها حد (10 كل 5 دقايق للـ IP) ومعاها نفس رد 404 عشان مانكشفش وجود الطلب.
- اختبارات: `python test_api.py` و `python test_orders.py` (التاني على داتابيز مؤقتة ومش بيلمس boda.db).

## النشر
GitHub Pages مش بيشغّل Python، فالـ API لازم يتنشر على استضافة (Render / Railway / Fly.io / VPS).
- استخدم PostgreSQL في الإنتاج: `BODA_DATABASE_URL=postgresql+psycopg://...` (وضيف `psycopg[binary]` في requirements).
- الصور المرفوعة بتتخزن في فولدر `uploads/`؛ على استضافات بتمسح الملفات لازم Volume دائم.
- ضبط `BODA_CORS_ORIGINS` على دومين موقعك بس.
