"""Password hashing and JWT helpers."""

from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import (
    ACCESS_SECRET_KEY,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_SECRET_KEY,
    REFRESH_TOKEN_EXPIRE_MINUTES,
)

http_bearer = HTTPBearer()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def _generate_token(payload: dict, secret: str, expiry_minutes: int) -> str:
    data = payload.copy()
    if hasattr(data.get("role"), "value"):
        data["role"] = data["role"].value
    data["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes)
    return jwt.encode(data, secret, algorithm=ALGORITHM)


def generate_accesstoken(payload: dict) -> str:
    return _generate_token(payload, ACCESS_SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES)


def generate_refreshtoken(payload: dict) -> str:
    return _generate_token(payload, REFRESH_SECRET_KEY, REFRESH_TOKEN_EXPIRE_MINUTES)


def decode_refresh_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return {key: payload[key] for key in ("id", "email", "role")}
    except (JWTError, KeyError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please login") from exc


def decodejwt_current_user(credentials: HTTPAuthorizationCredentials = Depends(http_bearer)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, ACCESS_SECRET_KEY, algorithms=[ALGORITHM])
        return {key: payload[key] for key in ("id", "email", "role")}
    except (JWTError, KeyError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc
