from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class InventoryRecordOut(BaseModel):
    item_id: str
    item_name: str
    category: Optional[str]
    date: date
    quantity: float

    class Config:
        from_attributes = True


class ForecastPoint(BaseModel):
    date: date
    predicted_quantity: float
    lower_bound: float
    upper_bound: float


class ItemForecastResponse(BaseModel):
    item_id: str
    item_name: str
    history: List[dict]
    forecast: List[ForecastPoint]
    reorder_alert: dict


class DashboardSummary(BaseModel):
    total_items: int
    items_needing_reorder: int
    items: List[dict]
