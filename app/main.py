"""ASGI application entry point."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
from app.core.config import UPLOAD_DIR
from app.db.session import engine
from app.models import Base


def create_application() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR.parent), name="uploads")

    @app.get("/")
    async def health_check():
        return {"status": "ok", "service": "stock-inventory-backend"}

    app.include_router(api_router)
    return app


if engine is not None and not os.getenv("VERCEL"):
    Base.metadata.create_all(bind=engine)
app = create_application()
