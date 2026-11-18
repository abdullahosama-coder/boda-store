"""اختبار صفحة تأكيد الطلب (عرض / تعديل / إلغاء) على داتابيز مؤقتة — مش بيلمس boda.db.
التشغيل:  python test_orders.py
"""
import os, tempfile
_tmp = tempfile.mkdtemp()
os.environ.update(BODA_DATABASE_URL=f"sqlite:///{_tmp}/t.db", BODA_ADMIN_PASSWORD="Test-Pass-123", BODA_SECRET_KEY="test-secret-key-at-least-32-bytes-long")
from fastapi.testclient import TestClient
from app.main import app

def ok(name, cond):
    print(("PASS " if cond else "FAIL ") + name)
    assert cond, name

with TestClient(app) as c:
    tok = c.post("/api/auth/login", json={"username": "admin", "password": "Test-Pass-123"}).json()["token"]
    H = {"Authorization": "Bearer " + tok}
    c.post("/api/admin/categories", headers=H, json={"name": "Books"})
    for pid, price, qty in (("AAA", 10, 5), ("BBB", 20, 3), ("CCC", 5, None)):
        c.post("/api/admin/products", headers=H, json={"id": pid, "name": "P-" + pid, "cat": "Books", "price": price, "qty": qty})
    def stock(pid): return c.get(f"/api/admin/products?q={pid}", headers=H).json()["items"][0]
    PH = "01012345678"

    # duplicate lines are merged before the stock check
    r = c.post("/api/orders", json={"name": "Ali", "phone": PH, "items": [{"id": "AAA", "qty": 3}, {"id": "AAA", "qty": 3}]})
    ok("duplicate lines exceeding stock rejected", r.status_code == 422 and stock("AAA")["qty"] == 5)

    r = c.post("/api/orders", json={"name": "Ali", "phone": PH, "items": [{"id": "AAA", "qty": 2}, {"id": "BBB", "qty": 1}]})
    oid = r.json()["id"]; ok("create order", r.status_code == 201 and r.json()["total"] == 40 and stock("AAA")["qty"] == 3)

    # lookup needs the right phone
    ok("view with phone", c.get(f"/api/orders/{oid}", params={"phone": "+20 101 234 5678"}).json()["id"] == oid)
    ok("wrong phone -> 404", c.get(f"/api/orders/{oid}", params={"phone": "01099999999"}).status_code == 404)
    ok("unknown id -> 404 (same as wrong phone)", c.get("/api/orders/NOPE", params={"phone": PH}).status_code == 404)

    # edit quantities, remove a line, add a line  (price comes from the DB, not the browser)
    r = c.patch(f"/api/orders/{oid}", json={"phone": PH, "items": [{"id": "AAA", "qty": 4}, {"id": "CCC", "qty": 2}]})
    j = r.json(); ok("edit items", r.status_code == 200 and j["total"] == 50 and [i["id"] for i in j["items"]] == ["AAA", "CCC"])
    ok("stock re-balanced (AAA 5-4, BBB back to 3)", stock("AAA")["qty"] == 1 and stock("BBB")["qty"] == 3)

    # over-stock edit fails and leaves everything unchanged
    r = c.patch(f"/api/orders/{oid}", json={"phone": PH, "items": [{"id": "AAA", "qty": 6}]})
    ok("over-stock edit rejected", r.status_code == 422)
    ok("rollback kept order + stock", c.get(f"/api/orders/{oid}", params={"phone": PH}).json()["total"] == 50 and stock("AAA")["qty"] == 1)

    r = c.patch(f"/api/orders/{oid}", json={"phone": PH, "items": []})
    ok("empty items rejected (use cancel)", r.status_code == 422)

    r = c.patch(f"/api/orders/{oid}", json={"phone": PH, "address": "5 Nile St", "city": "Alexandria"})
    ok("edit shipping only", r.json()["city"] == "Alexandria" and r.json()["total"] == 50)

    # cancel restores stock; cancelled/shipped orders are locked
    r = c.post(f"/api/orders/{oid}/cancel", json={"phone": PH})
    ok("cancel", r.json()["status"] == "cancelled" and stock("AAA")["qty"] == 5)
    ok("edit after cancel -> 409", c.patch(f"/api/orders/{oid}", json={"phone": PH, "name": "X"}).status_code == 409)
    ok("cancel is idempotent (no double restock)", c.post(f"/api/orders/{oid}/cancel", json={"phone": PH}).status_code == 200 and stock("AAA")["qty"] == 5)

    o2 = c.post("/api/orders", json={"name": "Sara", "phone": PH, "items": [{"id": "BBB", "qty": 3}]}).json()["id"]
    ok("last unit sets stock off", stock("BBB")["stock"] is False)
    c.patch(f"/api/admin/orders/{o2}", headers=H, json={"status": "shipped"})
    ok("shipped order is locked", c.patch(f"/api/orders/{o2}", json={"phone": PH, "name": "Z"}).status_code == 409
       and c.post(f"/api/orders/{o2}/cancel", json={"phone": PH}).status_code == 409)

    # admin cancelling also restores stock; un-cancelling takes it again
    c.patch(f"/api/admin/orders/{o2}", headers=H, json={"status": "cancelled"})
    ok("admin cancel restores stock and re-enables product", stock("BBB")["qty"] == 3 and stock("BBB")["stock"] is True)
    c.patch(f"/api/admin/orders/{o2}", headers=H, json={"status": "new"})
    ok("admin un-cancel deducts again", stock("BBB")["qty"] == 0)

    # brute-force guard on the phone check
    codes = [c.get(f"/api/orders/{oid}", params={"phone": f"0100000{i:04d}"}).status_code for i in range(12)]
    ok("rate limit after repeated wrong phones", 429 in codes)
print("ALL OK")
