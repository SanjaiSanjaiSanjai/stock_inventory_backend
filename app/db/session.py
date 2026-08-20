"""SQLAlchemy engine and request-scoped session dependency."""

from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import DATABASE_URL

engine = create_engine(DATABASE_URL) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine, autoflush=False) if engine else None


def get_db() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database is not configured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
