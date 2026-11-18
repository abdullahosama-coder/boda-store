import re, time, uuid
from math import ceil
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import Session

from . import config, models, schemas
from .auth import hash_password, verify_password, make_token, require_admin
from .database import Base, engine, get_db, SessionLocal

ORDER_STATUSES = ["new", "processing", "shipped", "delivered", "cancelled"]
_attempts: dict[str, list[float]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    # small auto-migration: older databases have no categories.img column yet
    from sqlalchemy import inspect, text
    if "img" not in [c["name"] for c in inspect(engine).get_columns("categories")]:
        with engine.begin() as cx:
            cx.execute(text("ALTER TABLE categories ADD COLUMN img TEXT DEFAULT ''"))
    product_cols = {c["name"] for c in inspect(engine).get_columns("products")}
    with engine.begin() as cx:
        for col, sql in [("condition", "VARCHAR(20) DEFAULT 'new'"), ("colors", "JSON"), ("sizes", "JSON"), ("components", "JSON")]:
            if col not in product_cols:
                cx.execute(text(f"ALTER TABLE products ADD COLUMN {col} {sql}"))
    with SessionLocal() as db:
        if config.ADMIN_PASSWORD and not db.get(models.AdminUser, config.ADMIN_USER):
            db.add(models.AdminUser(username=config.ADMIN_USER, pw_hash=hash_password(config.ADMIN_PASSWORD)))
            db.commit()
    yield


app = FastAPI(title="Boda Store API", version="1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=config.UPLOAD_DIR), name="uploads")


def page_of(db: Session, stmt, page: int, limit: int, schema):
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery()))
    rows = db.scalars(stmt.offset((page - 1) * limit).limit(limit)).all()
    return {"items": [schema.model_validate(r) for r in rows], "total": total, "page": page,
            "pages": max(1, ceil(total / limit)), "limit": limit}


def new_id(prefix: str) -> str:
    return f"{prefix}{int(time.time() * 1000)}{uuid.uuid4().hex[:4]}"


@app.get("/api/health")
def health():
    return {"ok": True}


# ---------------- Auth ----------------
@app.post("/api/auth/login")
def login(body: schemas.LoginIn, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "?"
    recent = [t for t in _attempts.get(ip, []) if time.time() - t < 300]
    if len(recent) >= 8:
        raise HTTPException(429, "Too many attempts, try again in a few minutes")
    u = db.get(models.AdminUser, body.username)
    if not u or not verify_password(body.password, u.pw_hash):
        _attempts[ip] = recent + [time.time()]
        raise HTTPException(401, "Wrong username or password")
    _attempts.pop(ip, None)
    return {"token": make_token(u.username), "username": u.username}


@app.get("/api/auth/me")
def me(user: str = Depends(require_admin)):
    return {"username": user}


@app.post("/api/auth/password")
def change_password(body: dict, user: str = Depends(require_admin), db: Session = Depends(get_db)):
    u = db.get(models.AdminUser, user)
    if not u or not verify_password(str(body.get("old", "")), u.pw_hash):
        raise HTTPException(400, "Current password is wrong")
    new = str(body.get("new", ""))
    if len(new) < 8:
        raise HTTPException(400, "New password must be at least 8 characters")
    u.pw_hash = hash_password(new)
    db.commit()
    return {"ok": True}


# ---------------- Products (public) ----------------
@app.get("/api/products")
def list_products(
    cat: str = "", sub: str = "", q: str = "", offers: bool = False,
    page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db),
):
    stmt = select(models.Product).where(models.Product.hidden.is_(False))
    if cat: stmt = stmt.where(models.Product.cat == cat)
    if sub: stmt = stmt.where(models.Product.sub == sub)
    if offers: stmt = stmt.where(models.Product.old > models.Product.price)
    if q:
        like = f"%{q}%"
        stmt = stmt.where(or_(models.Product.name.ilike(like), models.Product.id.ilike(like), models.Product.desc.ilike(like)))
    return page_of(db, stmt.order_by(models.Product.created, models.Product.id), page, limit, schemas.ProductOut)


@app.get("/api/products/{pid}", response_model=schemas.ProductOut)
def get_product(pid: str, db: Session = Depends(get_db)):
    p = db.get(models.Product, pid)
    if not p or p.hidden:
        raise HTTPException(404, "Product not found")
    return p


@app.get("/api/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.scalars(select(models.Category)).all()


# ---------------- Products (admin) ----------------
@app.get("/api/admin/products")
def admin_products(
    q: str = "", cat: str = "", stock: str = "", visible: str = "",
    page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=200),
    db: Session = Depends(get_db), _: str = Depends(require_admin),
):
    P = models.Product
    stmt = select(P)
    if q: stmt = stmt.where(or_(P.name.ilike(f"%{q}%"), P.id.ilike(f"%{q}%")))
    if cat: stmt = stmt.where(P.cat == cat)
    if stock == "in": stmt = stmt.where(P.stock.is_(True))
    elif stock == "out": stmt = stmt.where(P.stock.is_(False))
    elif stock == "low": stmt = stmt.where(P.qty.is_not(None), P.qty <= 5)
    if visible == "shown": stmt = stmt.where(P.hidden.is_(False))
    elif visible == "hidden": stmt = stmt.where(P.hidden.is_(True))
    return page_of(db, stmt.order_by(P.created, P.id), page, limit, schemas.ProductOut)


def _check_cat(db: Session, name: str):
    if not db.get(models.Category, name):
        raise HTTPException(422, f"Unknown category: {name}")


@app.post("/api/admin/products", response_model=schemas.ProductOut, status_code=201)
def create_product(body: schemas.ProductIn, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    _check_cat(db, body.cat)
    pid = (body.id or "").strip().upper() or new_id("PRD")
    if not re.fullmatch(r"[A-Z0-9_-]{2,40}", pid):
        raise HTTPException(422, "Product code: letters, digits, - and _ only")
    if db.get(models.Product, pid):
        raise HTTPException(409, "Product code already exists")
    data = body.model_dump(exclude={"id"})
    p = models.Product(id=pid, **data)
    db.add(p); db.commit()
    return p


@app.put("/api/admin/products/{pid}", response_model=schemas.ProductOut)
def update_product(pid: str, body: schemas.ProductIn, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    p = db.get(models.Product, pid)
    if not p: raise HTTPException(404, "Product not found")
    _check_cat(db, body.cat)
    for k, v in body.model_dump(exclude={"id"}).items():
        setattr(p, k, v)
    db.commit()
    return p


@app.patch("/api/admin/products/{pid}", response_model=schemas.ProductOut)
def patch_product(pid: str, body: schemas.ProductPatch, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    p = db.get(models.Product, pid)
    if not p: raise HTTPException(404, "Product not found")
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(p, k, v)
    db.commit()
    return p


@app.delete("/api/admin/products/{pid}")
def delete_product(pid: str, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.execute(delete(models.Product).where(models.Product.id == pid)).rowcount
    db.commit()
    if not n: raise HTTPException(404, "Product not found")
    return {"deleted": n}


@app.post("/api/admin/products/bulk-delete")
def bulk_delete_products(body: schemas.BulkIds, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.execute(delete(models.Product).where(models.Product.id.in_(body.ids))).rowcount
    db.commit()
    return {"deleted": n}


# ---------------- Categories (admin) ----------------
@app.post("/api/admin/categories", response_model=schemas.CategoryOut, status_code=201)
def create_category(body: schemas.CategoryIn, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    if db.get(models.Category, body.name): raise HTTPException(409, "Category already exists")
    c = models.Category(**body.model_dump()); db.add(c); db.commit()
    return c


@app.put("/api/admin/categories/{name}", response_model=schemas.CategoryOut)
def update_category(name: str, body: schemas.CategoryIn, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    c = db.get(models.Category, name)
    if not c: raise HTTPException(404, "Category not found")
    for k, v in body.model_dump(exclude={"name"}).items():
        setattr(c, k, v)
    db.commit()
    return c


@app.delete("/api/admin/categories/{name}")
def delete_category(name: str, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    c = db.get(models.Category, name)
    if not c: raise HTTPException(404, "Category not found")
    if db.scalar(select(func.count()).select_from(models.Product).where(models.Product.cat == name)):
        raise HTTPException(409, "Category still has products")
    db.delete(c); db.commit()
    return {"deleted": 1}


# ---------------- Orders ----------------
EDITABLE_STATUSES = ("new", "processing")   # بعد الشحن الطلب بيتقفل


def _merge(items) -> list[dict]:
    """يدمج نفس المنتج لو اتكرر في الطلب (عشان فحص المخزون يبقى صح)."""
    out: dict[str, int] = {}
    for it in items:
        out[it.id] = out.get(it.id, 0) + it.qty
    return [{"id": k, "qty": v} for k, v in out.items()]


def _take(db: Session, items: list[dict]) -> tuple[list[dict], float]:
    """يتحقق من المنتجات والمخزون، يخصم الكميات، ويرجّع (سطور الطلب, الإجمالي). الأسعار من الداتابيز."""
    lines, total = [], 0.0
    for it in items:
        p = db.get(models.Product, it["id"])
        if not p or p.hidden or not p.stock:
            raise HTTPException(422, f"Product unavailable: {it['id']}")
        if p.qty is not None and it["qty"] > p.qty:
            raise HTTPException(422, f"Only {p.qty} left of {p.name}")
        lines.append({"id": p.id, "name": p.name, "price": p.price, "qty": it["qty"], "img": p.img, "brand": p.brand, "condition": p.condition, "colors": p.colors or [], "sizes": p.sizes or [], "components": p.components or [], "features": p.features or [], "stock": p.stock})
        total += p.price * it["qty"]
    for it in items:
        p = db.get(models.Product, it["id"])
        if p.qty is not None:
            p.qty -= it["qty"]
            if p.qty == 0:
                p.stock = False
    return lines, round(total, 2)


def _restock(db: Session, lines: list[dict]):
    for it in lines or []:
        p = db.get(models.Product, it.get("id"))
        if p and p.qty is not None:
            was_zero = p.qty == 0
            p.qty += int(it.get("qty", 0))
            if was_zero and p.qty > 0:
                p.stock = True


def _digits(v: str) -> str:
    return re.sub(r"\D", "", v or "")


def _own_order(db: Session, oid: str, phone: str, request: Request) -> models.Order:
    """العميل مالوش حساب على الـ API: بنتحقق برقم الطلب + آخر 7 أرقام من التليفون. 404 موحّدة عشان ما نكشفش وجود الطلب."""
    ip = "lk:" + (request.client.host if request.client else "?")
    recent = [t for t in _attempts.get(ip, []) if time.time() - t < 300]
    if len(recent) >= 10:
        raise HTTPException(429, "Too many attempts, try again in a few minutes")
    o = db.get(models.Order, oid)
    mine, theirs = _digits(phone)[-7:], _digits(o.phone)[-7:] if o else ""
    if not o or len(mine) < 7 or mine != theirs:
        _attempts[ip] = recent + [time.time()]
        raise HTTPException(404, "Order not found")
    _attempts.pop(ip, None)
    return o


@app.post("/api/orders", status_code=201)
def create_order(body: schemas.OrderIn, db: Session = Depends(get_db)):
    lines, total = _take(db, _merge(body.items))
    o = models.Order(id=new_id("ORD"), name=body.name, phone=body.phone, email=body.email, city=body.city,
                     address=body.address, notes=body.notes, items=lines, total=total)
    db.add(o); db.commit()
    return {"id": o.id, "total": o.total, "status": o.status}


@app.get("/api/orders/{oid}", response_model=schemas.OrderOut)
def get_my_order(oid: str, request: Request, phone: str = Query(..., min_length=5), db: Session = Depends(get_db)):
    """صفحة تأكيد الطلب: عرض الطلب."""
    return _own_order(db, oid, phone, request)


@app.patch("/api/orders/{oid}", response_model=schemas.OrderOut)
def edit_my_order(oid: str, body: schemas.OrderEditIn, request: Request, db: Session = Depends(get_db)):
    """صفحة تأكيد الطلب: تعديل الكميات / حذف أو إضافة منتجات / بيانات الشحن (طول ما الطلب new أو processing)."""
    o = _own_order(db, oid, body.phone, request)
    if o.status not in EDITABLE_STATUSES:
        raise HTTPException(409, f"Order is {o.status} and can no longer be edited")
    try:
        if body.items is not None:
            _restock(db, o.items)                    # رجّع الكميات القديمة الأول
            o.items, o.total = _take(db, _merge(body.items))   # وبعدين خصم الجديدة (فيها فحص المخزون)
        for k in ("name", "email", "city", "address", "notes"):
            v = getattr(body, k)
            if v is not None:
                setattr(o, k, v)
        db.commit()
    except HTTPException:
        db.rollback()                                # فشل؟ المخزون يرجع زي ما كان
        raise
    return o


@app.post("/api/orders/{oid}/cancel", response_model=schemas.OrderOut)
def cancel_my_order(oid: str, body: schemas.PhoneIn, request: Request, db: Session = Depends(get_db)):
    o = _own_order(db, oid, body.phone, request)
    if o.status == "cancelled":
        return o
    if o.status not in EDITABLE_STATUSES:
        raise HTTPException(409, f"Order is {o.status} and can no longer be cancelled")
    _restock(db, o.items)
    o.status = "cancelled"
    db.commit()
    return o


@app.get("/api/admin/orders")
def admin_orders(q: str = "", status: str = "", page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=200),
                 db: Session = Depends(get_db), _: str = Depends(require_admin)):
    O = models.Order; stmt = select(O)
    if q: stmt = stmt.where(or_(O.id.ilike(f"%{q}%"), O.name.ilike(f"%{q}%"), O.phone.ilike(f"%{q}%")))
    if status: stmt = stmt.where(O.status == status)
    return page_of(db, stmt.order_by(O.created.desc()), page, limit, schemas.OrderOut)


@app.patch("/api/admin/orders/{oid}", response_model=schemas.OrderOut)
def set_order_status(oid: str, body: schemas.StatusIn, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    if body.status not in ORDER_STATUSES: raise HTTPException(422, f"Status must be one of {ORDER_STATUSES}")
    o = db.get(models.Order, oid)
    if not o: raise HTTPException(404, "Order not found")
    if body.status == "cancelled" and o.status != "cancelled":
        _restock(db, o.items)                         # الإلغاء بيرجّع المخزون
    elif o.status == "cancelled" and body.status != "cancelled":
        try:
            _take(db, [{"id": i["id"], "qty": i["qty"]} for i in o.items])   # فك الإلغاء بيخصم تاني (لو متاح)
        except HTTPException:
            db.rollback(); raise
    o.status = body.status; db.commit()
    return o


@app.post("/api/admin/orders/bulk-delete")
def bulk_delete_orders(body: schemas.BulkIds, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.execute(delete(models.Order).where(models.Order.id.in_(body.ids))).rowcount; db.commit()
    return {"deleted": n}


# ---------------- Contact messages ----------------
@app.post("/api/messages", status_code=201)
def send_message(body: schemas.MessageIn, db: Session = Depends(get_db)):
    db.add(models.Message(id=new_id("MSG"), **body.model_dump())); db.commit()
    return {"ok": True}


@app.get("/api/admin/messages")
def admin_messages(q: str = "", page: int = Query(1, ge=1), limit: int = Query(10, ge=1, le=200),
                   db: Session = Depends(get_db), _: str = Depends(require_admin)):
    M = models.Message; stmt = select(M)
    if q: stmt = stmt.where(or_(M.name.ilike(f"%{q}%"), M.subject.ilike(f"%{q}%"), M.message.ilike(f"%{q}%")))
    return page_of(db, stmt.order_by(M.created.desc()), page, limit, schemas.MessageOut)


@app.patch("/api/admin/messages/{mid}/read")
def mark_read(mid: str, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    m = db.get(models.Message, mid)
    if not m: raise HTTPException(404, "Message not found")
    m.read = True; db.commit()
    return {"ok": True}


@app.post("/api/admin/messages/bulk-delete")
def bulk_delete_messages(body: schemas.BulkIds, db: Session = Depends(get_db), _: str = Depends(require_admin)):
    n = db.execute(delete(models.Message).where(models.Message.id.in_(body.ids))).rowcount; db.commit()
    return {"deleted": n}


# ---------------- Image upload ----------------
_MAGIC = {b"\xff\xd8\xff": "jpg", b"\x89PNG\r\n\x1a\n": "png", b"GIF8": "gif", b"RIFF": "webp"}


@app.post("/api/admin/upload")
async def upload_image(request: Request, file: UploadFile = File(...), _: str = Depends(require_admin)):
    data = await file.read(config.MAX_UPLOAD_MB * 1024 * 1024 + 1)
    if len(data) > config.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"Max {config.MAX_UPLOAD_MB}MB")
    ext = next((e for m, e in _MAGIC.items() if data.startswith(m)), None)
    if ext == "webp" and data[8:12] != b"WEBP": ext = None
    if not ext: raise HTTPException(415, "Only JPG, PNG, GIF or WEBP images")
    name = f"{uuid.uuid4().hex}.{ext}"
    (config.UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"{str(request.base_url).rstrip('/')}/uploads/{name}"}
