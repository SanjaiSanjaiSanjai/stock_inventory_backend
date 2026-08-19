"""Aggregate router for version 1 endpoints."""

from fastapi import APIRouter

from app.api.v1 import auth, dashboard, products, sales

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(products.router)
api_router.include_router(sales.router)
