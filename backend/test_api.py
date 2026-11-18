"""اختبار API على قاعدة SQLite مؤقتة مع تحميل بيانات المتجر الافتراضية.
لا يلمس قاعدة بيانات التطوير أو الإنتاج.
تشغيل: python test_api.py
"""
import os
import subprocess
import sys
import tempfile
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent

with tempfile.TemporaryDirectory(prefix="boda-api-test-") as tmp:
    db_path = Path(tmp) / "test.db"
    env = os.environ.copy()
    env.update({
        "BODA_DATABASE_URL": f"sqlite:///{db_path}",
        "BODA_ADMIN_USER": "admin",
        "BODA_ADMIN_PASSWORD": "Test-Pass-123",
        "BODA_SECRET_KEY": "test-secret-key-at-least-32-bytes-long",
        "BODA_CORS_ORIGINS": "*",
    })

    # Seed defaults in a separate process so the test never touches a real DB.
    subprocess.run(
        [sys.executable, "seed.py", "products-data.js"],
        cwd=BACKEND_DIR,
        env=env,
        check=True,
    )

    os.environ.update(env)
    sys.path.insert(0, str(BACKEND_DIR))
    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as c:
        pub = c.get("/api/products?limit=5").json()
        assert pub["total"] == 21, pub
        print("public products ->", pub["total"])
        cats = c.get("/api/categories").json()
        assert len(cats) == 8, cats
        print("categories ->", len(cats))
        assert c.get("/api/admin/products").status_code == 401
        print("admin without token -> 401")
        assert c.post("/api/auth/login", json={"username": "admin", "password": "x"}).status_code == 401
        tok = c.post("/api/auth/login", json={"username": "admin", "password": "Test-Pass-123"}).json()["token"]
        headers = {"Authorization": "Bearer " + tok}

        created = c.post("/api/admin/products", headers=headers, json={
            "id": "TST001", "name": "Test Product", "cat": "Books", "price": 10,
            "img": "http://example.test/image.png",
        })
        assert created.status_code == 201, created.text
        print("admin create product ->", created.status_code)
        assert c.post("/api/admin/products", headers=headers, json={
            "id": "TST001", "name": "Duplicate", "cat": "Books", "price": 1,
        }).status_code == 409
        assert c.post("/api/admin/products", headers=headers, json={
            "name": "Bad category", "cat": "Nope", "price": 1,
        }).status_code == 422
        patched = c.patch("/api/admin/products/TST001", headers=headers, json={"hidden": True})
        assert patched.status_code == 200 and patched.json()["hidden"] is True
        assert c.get("/api/products/TST001").status_code == 404
        print("product patch + public visibility -> OK")

        order = c.post("/api/orders", json={
            "name": "Ali", "phone": "01000000000", "items": [{"id": "LAP001", "qty": 2}],
        })
        assert order.status_code == 201, order.text
        oid = order.json()["id"]
        print("create order ->", order.status_code, "total", order.json()["total"])
        assert c.get(f"/api/orders/{oid}?phone=01000000000").status_code == 200
        assert c.get(f"/api/orders/{oid}?phone=01111111111").status_code == 404

        msg = c.post("/api/messages", json={"name": "Sara", "message": "Hello"})
        assert msg.status_code == 201, msg.text
        assert c.get("/api/admin/messages", headers=headers).json()["total"] == 1
        print("contact message + admin inbox -> OK")

        bad_upload = c.post(
            "/api/admin/upload", headers=headers,
            files={"file": ("bad.png", b"<script>", "image/png")},
        )
        assert bad_upload.status_code == 415
        print("invalid image upload -> 415")

print("ALL API TESTS PASSED")
