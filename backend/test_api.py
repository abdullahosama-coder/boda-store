import io, os
os.environ.update(BODA_ADMIN_PASSWORD="Test-Pass-123", BODA_SECRET_KEY="testsecret")
from fastapi.testclient import TestClient
from app.main import app
with TestClient(app) as c:
    pub = c.get("/api/products?limit=5").json(); print("public total", pub["total"], "pages", pub["pages"], len(pub["items"]))
    print("offers", c.get("/api/products?offers=true&limit=100").json()["total"])
    print("search", c.get("/api/products?q=hoodie").json()["total"], "| cats", len(c.get("/api/categories").json()))
    print("admin no token ->", c.get("/api/admin/products").status_code)
    print("bad login ->", c.post("/api/auth/login", json={"username":"admin","password":"x"}).status_code)
    tok = c.post("/api/auth/login", json={"username":"admin","password":"Test-Pass-123"}).json()["token"]; H={"Authorization":"Bearer "+tok}
    r = c.get("/api/admin/products?limit=10&stock=in&cat=Electronics", headers=H).json(); print("admin filter", r["total"], r["pages"])
    r = c.post("/api/admin/products", headers=H, json={"id":"tst1","name":"Test","cat":"Books","price":10,"img":"http://x/y.png"}); print("create", r.status_code, r.json()["id"])
    print("dup", c.post("/api/admin/products", headers=H, json={"id":"TST1","name":"T","cat":"Books","price":1}).status_code)
    print("bad cat", c.post("/api/admin/products", headers=H, json={"name":"T","cat":"Nope","price":1}).status_code)
    print("patch", c.patch("/api/admin/products/TST1", headers=H, json={"hidden":True}).json()["hidden"], "| hidden public ->", c.get("/api/products/TST1").status_code)
    o = c.post("/api/orders", json={"name":"Ali","phone":"01000000000","items":[{"id":"LAP001","qty":2}]}); print("order", o.status_code, o.json()["total"])
    print("order bad id", c.post("/api/orders", json={"name":"A","phone":"01000000","items":[{"id":"ZZZ","qty":1}]}).status_code)
    oid=o.json()["id"]; print("status", c.patch(f"/api/admin/orders/{oid}", headers=H, json={"status":"shipped"}).json()["status"])
    print("msg", c.post("/api/messages", json={"name":"Sara","message":"hi"}).status_code, c.get("/api/admin/messages", headers=H).json()["total"])
    png=b"\x89PNG\r\n\x1a\n"+b"0"*50
    u=c.post("/api/admin/upload", headers=H, files={"file":("a.png",io.BytesIO(png),"image/png")}); print("upload", u.status_code, u.json()["url"][-12:])
    print("upload bad", c.post("/api/admin/upload", headers=H, files={"file":("a.png",io.BytesIO(b"<script>"),"image/png")}).status_code)
    print("file served", c.get(u.json()["url"].replace("http://testserver","")).status_code)
    print("bulk del", c.post("/api/admin/products/bulk-delete", headers=H, json={"ids":["TST1","KEY001"]}).json())
    print("del cat w/ products", c.delete("/api/admin/categories/Electronics", headers=H).status_code)
