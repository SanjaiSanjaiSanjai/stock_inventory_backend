"""Dashboard response schemas."""

from pydantic import BaseModel


class OneDaySalesResponse(BaseModel):
    total: float
    orders: int


class MonthlySalesResponse(BaseModel):
    month: str
    sales: float


class MostSellingProductResponse(BaseModel):
    product_id: int
    product_name: str
    quantity_sold: int
    sales: float


class LowStockItemResponse(BaseModel):
    product_id: int
    product_name: str
    stock: int


class DashboardResponse(BaseModel):
    one_day_sales: OneDaySalesResponse
    monthly_sales: list[MonthlySalesResponse]
    most_selling_products: list[MostSellingProductResponse]
    low_stock_items: list[LowStockItemResponse]
    profit_percentage: float
    loss_percentage: float
