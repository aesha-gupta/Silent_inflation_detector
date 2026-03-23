"""
forecast_service.py
Forecasts future category spending using a tiered fallback strategy:
  1. Simple Exponential Smoothing (statsmodels)
  2. Linear Regression (scikit-learn)
  3. Repeat last value
"""

from __future__ import annotations
import logging
import warnings
from datetime import datetime

import numpy as np

from utils.helpers import add_months

logger = logging.getLogger(__name__)


def _next_months(last_month: str, periods: int) -> list[str]:
    months = []
    cur = last_month
    for _ in range(periods):
        cur = add_months(cur, 1)
        months.append(cur)
    return months


def forecast_category(
    history: list[dict], category: str, periods: int = 6
) -> dict:
    """
    Forecast `periods` months of spending for one category.

    Parameters
    ----------
    history  : list of dicts with keys 'month' and the category name
    category : str   one of the 7 spending categories
    periods  : int   number of months to forecast (default 6)

    Returns
    -------
    dict with keys 'category' and 'forecast'
    forecast = list of {month, predicted, lower, upper}
    """
    n = len(history)
    if n < 3:
        raise ValueError(
            f"Need at least 3 months of data to forecast {category}. Got {n}."
        )

    sorted_history = sorted(history, key=lambda r: r["month"])
    values = [float(r.get(category, 0.0)) for r in sorted_history]
    last_month = sorted_history[-1]["month"]
    future_months = _next_months(last_month, periods)

    def build_result(preds: list[float]) -> dict:
        forecast = []
        for m, p in zip(future_months, preds):
            p = max(0.0, p)
            forecast.append({
                "month": m,
                "predicted": round(p, 2),
                "lower": round(max(0.0, p * 0.90), 2),
                "upper": round(p * 1.10, 2),
            })
        return {"category": category, "forecast": forecast}

    # All-zero → flat forecast
    if all(v == 0.0 for v in values):
        return build_result([0.0] * periods)

    # --- Strategy 1: Simple Exponential Smoothing ---
    try:
        from statsmodels.tsa.holtwinters import SimpleExpSmoothing
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            model = SimpleExpSmoothing(values, initialization_method="estimated").fit(
                optimized=True
            )
        preds = model.forecast(periods).tolist()
        return build_result(preds)
    except Exception as exc:
        logger.warning("SimpleExpSmoothing failed for %s (%s). Trying LinearRegression.", category, exc)

    # --- Strategy 2: Linear Regression ---
    try:
        from sklearn.linear_model import LinearRegression
        X = np.arange(n).reshape(-1, 1)
        y = np.array(values)
        lr = LinearRegression().fit(X, y)
        future_X = np.arange(n, n + periods).reshape(-1, 1)
        preds = lr.predict(future_X).tolist()
        return build_result(preds)
    except Exception as exc:
        logger.warning("LinearRegression failed for %s (%s). Using last value.", category, exc)

    # --- Strategy 3: Repeat last value ---
    return build_result([values[-1]] * periods)
