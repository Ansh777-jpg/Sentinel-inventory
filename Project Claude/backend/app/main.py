"""
Main FastAPI app.
Run with: uvicorn app.main:app --reload
"""
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import io
from datetime import datetime, timedelta
from typing import Optional

from app.database import init_db, get_db, User, InventoryRecord, ForecastResult
from app.auth import hash_password, verify_password, create_access_token, decode_access_token
from app.schemas import UserCreate, UserLogin, Token
from app.forecasting import forecast_item_demand, calculate_reorder_alert

app = FastAPI(title="AI Demand Forecasting & Inventory Management API")

# Allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your deployed frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------- Auth helpers ----------

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Auth routes ----------

@app.post("/api/auth/signup", response_model=Token)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=user_in.email, hashed_password=hash_password(user_in.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"access_token": token}


@app.post("/api/auth/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"user_id": user.id, "email": user.email})
    return {"access_token": token}


# ---------- Data upload ----------

@app.post("/api/inventory/upload")
async def upload_inventory_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Expects a CSV with columns: date, item_id, item_name, quantity, category (optional)
    """
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV file.")

    required_cols = {"date", "item_id", "item_name", "quantity"}
    if not required_cols.issubset(set(df.columns.str.lower())):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {', '.join(required_cols)}. Found: {list(df.columns)}",
        )

    df.columns = df.columns.str.lower()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    if df["date"].isna().any():
        raise HTTPException(status_code=400, detail="Some rows have unparseable dates. Use YYYY-MM-DD format.")

    records_created = 0
    for _, row in df.iterrows():
        record = InventoryRecord(
            user_id=current_user.id,
            item_id=str(row["item_id"]),
            item_name=str(row["item_name"]),
            category=str(row["category"]) if "category" in df.columns and pd.notna(row.get("category")) else None,
            date=row["date"].date(),
            quantity=float(row["quantity"]),
        )
        db.add(record)
        records_created += 1

    db.commit()
    return {"message": "Upload successful", "records_created": records_created}


# ---------- Forecasting ----------

@app.get("/api/items")
def list_items(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Returns distinct items the user has uploaded data for."""
    items = (
        db.query(InventoryRecord.item_id, InventoryRecord.item_name, InventoryRecord.category)
        .filter(InventoryRecord.user_id == current_user.id)
        .distinct()
        .all()
    )
    return [{"item_id": i[0], "item_name": i[1], "category": i[2]} for i in items]


@app.get("/api/forecast/{item_id}")
def get_forecast(
    item_id: str,
    periods: int = 30,
    current_stock: float = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(InventoryRecord)
        .filter(InventoryRecord.user_id == current_user.id, InventoryRecord.item_id == item_id)
        .order_by(InventoryRecord.date)
        .all()
    )
    if not records:
        raise HTTPException(status_code=404, detail="No data found for this item.")

    history_df = pd.DataFrame(
        [{"ds": r.date, "y": r.quantity} for r in records]
    )
    history_df["ds"] = pd.to_datetime(history_df["ds"])
    # Aggregate multiple entries on the same date
    history_df = history_df.groupby("ds", as_index=False)["y"].sum()

    try:
        forecast_df = forecast_item_demand(history_df, periods=periods)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    reorder_info = calculate_reorder_alert(current_stock, forecast_df)

    return {
        "item_id": item_id,
        "item_name": records[0].item_name,
        "history": [
            {"date": row["ds"].strftime("%Y-%m-%d"), "quantity": row["y"]}
            for _, row in history_df.iterrows()
        ],
        "forecast": [
            {
                "date": row["ds"].strftime("%Y-%m-%d"),
                "predicted_quantity": round(row["yhat"], 2),
                "lower_bound": round(row["yhat_lower"], 2),
                "upper_bound": round(row["yhat_upper"], 2),
            }
            for _, row in forecast_df.iterrows()
        ],
        "reorder_alert": reorder_info,
    }


@app.get("/api/dashboard/summary")
def dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Quick overview across all items - used for the main dashboard landing view.
    Note: for a demo/college project, this recomputes forecasts on the fly for each item.
    """
    items = (
        db.query(InventoryRecord.item_id, InventoryRecord.item_name)
        .filter(InventoryRecord.user_id == current_user.id)
        .distinct()
        .all()
    )

    summary = []
    reorder_count = 0

    for item_id, item_name in items:
        records = (
            db.query(InventoryRecord)
            .filter(InventoryRecord.user_id == current_user.id, InventoryRecord.item_id == item_id)
            .order_by(InventoryRecord.date)
            .all()
        )
        history_df = pd.DataFrame([{"ds": r.date, "y": r.quantity} for r in records])
        history_df["ds"] = pd.to_datetime(history_df["ds"])
        history_df = history_df.groupby("ds", as_index=False)["y"].sum()

        try:
            forecast_df = forecast_item_demand(history_df, periods=14)
            reorder_info = calculate_reorder_alert(current_stock=0, forecast_df=forecast_df)
            next_14_day_demand = round(forecast_df["yhat"].sum(), 2)
            needs_reorder = reorder_info["needs_reorder"]
        except ValueError:
            next_14_day_demand = None
            needs_reorder = False

        if needs_reorder:
            reorder_count += 1

        summary.append({
            "item_id": item_id,
            "item_name": item_name,
            "next_14_day_demand_forecast": next_14_day_demand,
            "needs_reorder": needs_reorder,
        })

    return {
        "total_items": len(items),
        "items_needing_reorder": reorder_count,
        "items": summary,
    }


@app.get("/")
def root():
    return {"status": "ok", "message": "Inventory Forecasting API is running"}
