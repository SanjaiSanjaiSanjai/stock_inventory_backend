"""Product catalogue and stock-management endpoints."""

import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.dependencies import adminmiddleware, staff_or_admin_middleware
from app.db.session import get_db
from app.models import AddnewProducts, Stock
from app.schemas.products import AvailableProductsResponse
from app.services.products import build_product_image_filename

router = APIRouter(tags=["products"])
UPLOAD_DIR = Path("uploads/products")


@router.get("/home/products", response_model=AvailableProductsResponse)
async def get_available_products(db: Session = Depends(get_db), _: dict = Depends(staff_or_admin_middleware)):
    statement = (
        select(AddnewProducts.id, AddnewProducts.name, AddnewProducts.price, AddnewProducts.category, AddnewProducts.unit, AddnewProducts.description, AddnewProducts.image_url, func.coalesce(func.sum(Stock.quantity), 0).label("stock_balance"))
        .outerjoin(Stock, Stock.product_id == AddnewProducts.id)
        .where(AddnewProducts.isAvailable.is_(True))
        .group_by(AddnewProducts.id, AddnewProducts.name, AddnewProducts.price, AddnewProducts.category, AddnewProducts.unit, AddnewProducts.description, AddnewProducts.image_url)
        .order_by(AddnewProducts.name)
    )
    return {"products": db.execute(statement).mappings().all()}


@router.post("/add-product")
async def add_product(
    name: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    unit: str = Form(...),
    stock: int = Form(...),
    description: str = Form(...),
    isAvailable: bool = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: dict = Depends(adminmiddleware),
):
    extension = Path(image.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image format.")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    filename = build_product_image_filename(name, extension)
    filepath = UPLOAD_DIR / filename
    try:
        with filepath.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        product = AddnewProducts(name=name, price=price, category=category, unit=unit, description=description, isAvailable=isAvailable, image_url=f"/uploads/products/{filename}")
        db.add(product)
        db.flush()
        stock_record = Stock(product_id=product.id, quantity=stock)
        db.add(stock_record)
        db.commit()
        db.refresh(product)
        db.refresh(stock_record)
    except Exception as exc:
        db.rollback()
        if filepath.exists():
            filepath.unlink()
        raise HTTPException(status_code=500, detail="Failed to add product") from exc
    finally:
        await image.close()
    return {"message": "Product added successfully", "product": {"name": product.name, "category": product.category, "unit": product.unit, "description": product.description, "isAvailable": product.isAvailable, "image_url": product.image_url}, "stock": {"quantity": stock_record.quantity}}
