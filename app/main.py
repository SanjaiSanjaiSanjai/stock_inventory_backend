"""ASGI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import api_router
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
    Path("uploads/products").mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    app.include_router(api_router)
    return app


if engine is not None:
    Base.metadata.create_all(bind=engine)
app = create_application()
