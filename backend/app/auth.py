import hashlib, hmac, os, time
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from . import config

bearer = HTTPBearer(auto_error=False)


def hash_password(pw: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, 200_000)
    return salt.hex() + "$" + dk.hex()


def verify_password(pw: str, stored: str) -> bool:
    try:
        salt_hex, _ = stored.split("$", 1)
    except ValueError:
        return False
    return hmac.compare_digest(hash_password(pw, bytes.fromhex(salt_hex)), stored)


def make_token(username: str) -> str:
    exp = int(time.time()) + config.TOKEN_HOURS * 3600
    return jwt.encode({"sub": username, "exp": exp}, config.SECRET_KEY, algorithm="HS256")


def require_admin(cred: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if not cred:
        raise HTTPException(401, "Login required")
    try:
        return jwt.decode(cred.credentials, config.SECRET_KEY, algorithms=["HS256"])["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
