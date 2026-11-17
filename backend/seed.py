"""استيراد الأقسام والمنتجات من products-data.js إلى الداتابيز.
الاستخدام:  python seed.py ../products-data.js
"""
import json, re, sys
from pathlib import Path
from app.database import Base, engine, SessionLocal
from app import models

src = Path(sys.argv[1] if len(sys.argv) > 1 else "../products-data.js").read_text(encoding="utf-8")


def grab(var):
    m = re.search(r"var\s+" + var + r"\s*=\s*(\[.*?\n?\]);", src, re.S)
    return json.loads(m.group(1))


Base.metadata.create_all(engine)
with SessionLocal() as db:
    nc = npd = 0
    for c in grab("BODA_CATEGORIES_DEFAULT"):
        if not db.get(models.Category, c["name"]):
            db.add(models.Category(**{k: c.get(k, "" if k != "subs" else []) for k in ("name", "icon", "shop", "desc", "long", "subs")})); nc += 1
    db.flush()
    for i, p in enumerate(grab("BODA_PRODUCTS")):
        if not db.get(models.Product, p["id"]):
            db.add(models.Product(
                id=p["id"], name=p["name"], cat=p["cat"], sub=p.get("sub", ""), price=p["price"], old=p.get("old", 0),
                img=p.get("img", ""), desc=p.get("desc", ""), features=p.get("features", []), badge=p.get("badge", ""),
                stock=p.get("stock", True), created=1_700_000_000_000 + i)); npd += 1
    db.commit()
print(f"Imported {nc} categories, {npd} products")
