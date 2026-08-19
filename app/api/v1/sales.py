"""Sales endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import staff_or_admin_middleware
from app.db.session import get_db
from app.models import AddnewProducts, Order, OrderItems, Stock
from app.schemas.products import SalesRequest, SalesResponse, SoldProductResponse

router = APIRouter(tags=["sales"])


@router.post("/sales", response_model=SalesResponse)
def sale_product(sales_request: SalesRequest, db: Session = Depends(get_db), _: dict = Depends(staff_or_admin_middleware)):
    if not sales_request.items:
        raise HTTPException(status_code=400, detail="At least one sale item is required")
    last_order = None
    sold_products: list[SoldProductResponse] = []
    try:
        for item in sales_request.items:
            product = db.get(AddnewProducts, item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product with ID {item.product_id} not found")
            stock = db.execute(select(Stock).where(Stock.product_id == item.product_id)).scalar_one_or_none()
            if not stock or stock.quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product ID {item.product_id}")
            stock.quantity -= item.quantity
            order = Order(product_id=item.product_id, quantity=item.quantity)
            db.add(order)
            db.flush()
            db.add(OrderItems(order_id=order.id, product_name=product.name, total_price=product.price * item.quantity, customer_name=sales_request.customer_name, customer_mobile=sales_request.customer_mobile))
            sold_products.append(SoldProductResponse(product_id=product.id, product_name=product.name, product_price=product.price, product_category=product.category, product_unit=product.unit))
            last_order = order
        db.commit()
        db.refresh(last_order)
    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process sale") from exc
    return SalesResponse(sales_id=last_order.id, quantity_sold=last_order.quantity, sale_date=last_order.created_at, products_details=sold_products, customer_name=sales_request.customer_name, customer_mobile=sales_request.customer_mobile)
