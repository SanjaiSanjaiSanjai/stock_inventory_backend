"""Dashboard reporting endpoints."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import AddnewProducts, Order, OrderItems, Stock
from app.schemas.dashboard import DashboardResponse

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(db: Session = Depends(get_db)):
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_start = today_start + timedelta(days=1)
    year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    today_total = db.scalar(select(func.coalesce(func.sum(OrderItems.total_price), 0)).where(OrderItems.created_at >= today_start, OrderItems.created_at < tomorrow_start))
    today_orders = db.scalar(select(func.count(Order.id)).where(Order.created_at >= today_start, Order.created_at < tomorrow_start))
    monthly_rows = db.execute(select(OrderItems.created_at, OrderItems.total_price).where(OrderItems.created_at >= year_start)).all()
    sales_by_month: dict[int, float] = {}
    for created_at, total_price in monthly_rows:
        sales_by_month[created_at.month] = sales_by_month.get(created_at.month, 0) + total_price

    most_selling_products = db.execute(
        select(Order.product_id.label("product_id"), AddnewProducts.name.label("product_name"), func.sum(Order.quantity).label("quantity_sold"), func.coalesce(func.sum(OrderItems.total_price), 0).label("sales"))
        .join(AddnewProducts, AddnewProducts.id == Order.product_id)
        .outerjoin(OrderItems, OrderItems.order_id == Order.id)
        .group_by(Order.product_id, AddnewProducts.name)
        .order_by(func.sum(Order.quantity).desc())
        .limit(5)
    ).mappings().all()
    stock_balance = func.coalesce(func.sum(Stock.quantity), 0)
    low_stock_items = db.execute(
        select(AddnewProducts.id.label("product_id"), AddnewProducts.name.label("product_name"), stock_balance.label("stock"))
        .outerjoin(Stock, Stock.product_id == AddnewProducts.id)
        .group_by(AddnewProducts.id, AddnewProducts.name)
        .having(stock_balance <= 10)
        .order_by(stock_balance)
    ).mappings().all()
    return {
        "one_day_sales": {"total": float(today_total or 0), "orders": today_orders or 0},
        "monthly_sales": [{"month": datetime(2000, month, 1).strftime("%b"), "sales": float(sales)} for month, sales in sorted(sales_by_month.items())],
        "most_selling_products": most_selling_products,
        "low_stock_items": low_stock_items,
        "profit_percentage": 0.0,
        "loss_percentage": 0.0,
    }
