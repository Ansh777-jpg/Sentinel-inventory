"""
Forecasting engine using Prophet.
Takes historical (date, quantity) pairs per item and predicts future demand.
"""
import pandas as pd
from prophet import Prophet
import logging

logging.getLogger("prophet").setLevel(logging.WARNING)
logging.getLogger("cmdstanpy").setLevel(logging.WARNING)


def forecast_item_demand(history_df: pd.DataFrame, periods: int = 30):
    """
    history_df: DataFrame with columns ['ds', 'y'] where
        ds = date, y = quantity sold/used on that date
    periods: number of future days to forecast

    Returns a DataFrame with columns: ds, yhat, yhat_lower, yhat_upper
    (only the future rows, not the historical fit)
    """
    if len(history_df) < 5:
        # Not enough data for Prophet to find a meaningful pattern
        raise ValueError("Need at least 5 historical data points to forecast this item.")

    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.85,
    )
    model.fit(history_df)

    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    # Only return the future portion
    future_forecast = forecast.tail(periods)[["ds", "yhat", "yhat_lower", "yhat_upper"]]

    # Demand can't be negative - clip it
    future_forecast["yhat"] = future_forecast["yhat"].clip(lower=0)
    future_forecast["yhat_lower"] = future_forecast["yhat_lower"].clip(lower=0)
    future_forecast["yhat_upper"] = future_forecast["yhat_upper"].clip(lower=0)

    return future_forecast


def calculate_reorder_alert(current_stock: float, forecast_df: pd.DataFrame, lead_time_days: int = 7, safety_stock_pct: float = 0.15):
    """
    Simple reorder logic:
    - Sum predicted demand over the lead time window
    - Add a safety stock buffer
    - If current stock won't cover that, flag a reorder with a suggested quantity
    """
    lead_time_demand = forecast_df.head(lead_time_days)["yhat"].sum()
    safety_stock = lead_time_demand * safety_stock_pct
    reorder_point = lead_time_demand + safety_stock

    needs_reorder = current_stock < reorder_point
    suggested_qty = max(0, round(reorder_point - current_stock, 2)) if needs_reorder else 0

    return {
        "needs_reorder": bool(needs_reorder),
        "reorder_point": round(reorder_point, 2),
        "suggested_reorder_qty": suggested_qty,
        "lead_time_days": lead_time_days,
    }
