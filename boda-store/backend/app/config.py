import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
# تحميل .env بسيط بدون مكتبات إضافية
_env = BASE_DIR / ".env"
if _env.exists():
    for line in _env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

DATABASE_URL = os.getenv("BODA_DATABASE_URL", f"sqlite:///{BASE_DIR / 'boda.db'}")
SECRET_KEY = os.getenv("BODA_SECRET_KEY", "dev-only-change-me")
ADMIN_USER = os.getenv("BODA_ADMIN_USER", "admin")
ADMIN_PASSWORD = os.getenv("BODA_ADMIN_PASSWORD", "")
CORS_ORIGINS = [o.strip() for o in os.getenv("BODA_CORS_ORIGINS", "*").split(",") if o.strip()]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_UPLOAD_MB = 5
TOKEN_HOURS = 12
