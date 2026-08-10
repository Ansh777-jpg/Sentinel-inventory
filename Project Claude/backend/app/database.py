"""
Database setup using SQLite + SQLAlchemy.
Keeps things simple - no external DB server needed.
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./inventory.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("InventoryRecord", back_populates="owner")


class InventoryRecord(Base):
    """Raw uploaded historical data - one row per date/item/quantity entry."""
    __tablename__ = "inventory_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(String, index=True, nullable=False)
    item_name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    quantity = Column(Float, nullable=False)  # quantity sold/used/consumed

    owner = relationship("User", back_populates="items")


class ForecastResult(Base):
    """Stores generated forecasts so we don't recompute every time the dashboard loads."""
    __tablename__ = "forecast_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(String, index=True, nullable=False)
    item_name = Column(String, nullable=False)
    forecast_date = Column(Date, nullable=False)
    predicted_quantity = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=True)
    upper_bound = Column(Float, nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
