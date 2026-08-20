"""Configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _get_int_env(name: str, default: int) -> int:
	value = os.getenv(name, "").strip()
	try:
		return int(value) if value else default
	except ValueError:
		return default


DATABASE_URL = (
	os.getenv("DATABASE_URL")
	or os.getenv("POSTGRES_URL_NON_POOLING")
	or os.getenv("POSTGRES_URL")
)
ACCESS_SECRET_KEY = os.getenv("JWT_ACCESSTOKEN_SECRET_KEY", "my-super-secret-access-token-key-change")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESHTOKEN_SECRET_KEY", "my-super-secret-refresh-token-key-change")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = _get_int_env("JWT_ACCESS_EXPIRE_MINUTES", 1)
REFRESH_TOKEN_EXPIRE_MINUTES = _get_int_env("JWT_REFRESH_EXPIRE_MINUTES", 10)
UPLOAD_DIR = Path("/tmp/uploads/products" if os.getenv("VERCEL") else "uploads/products")
