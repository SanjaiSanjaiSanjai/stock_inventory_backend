"""Product and sale schemas."""

from datetime import datetime

from pydantic import BaseModel


class AvailableProductResponse(BaseModel):
    id: int
    name: str
    price: float
    category: str
    unit: str
    description: str
    image_url: str
    stock_balance: int


class AvailableProductsResponse(BaseModel):
    products: list[AvailableProductResponse]


class SalesItem(BaseModel):
    product_id: int
    quantity: int


class SalesRequest(BaseModel):
    customer_name: str
    customer_mobile: str
    items: list[SalesItem]


class SoldProductResponse(BaseModel):
    product_id: int
    product_name: str
    product_price: float
    product_category: str
    product_unit: str


class SalesResponse(BaseModel):
    sales_id: int
    quantity_sold: int
    sale_date: datetime
    products_details: list[SoldProductResponse]
    customer_name: str
    customer_mobile: str
