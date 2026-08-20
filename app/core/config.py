"""Configuration loaded from environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ACCESS_SECRET_KEY = os.getenv("JWT_ACCESSTOKEN_SECRET_KEY", "my-super-secret-access-token-key-change")
REFRESH_SECRET_KEY = os.getenv("JWT_REFRESHTOKEN_SECRET_KEY", "my-super-secret-refresh-token-key-change")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "1"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_REFRESH_EXPIRE_MINUTES", "10"))
UPLOAD_DIR = Path("/tmp/uploads/products" if os.getenv("VERCEL") else "uploads/products")
