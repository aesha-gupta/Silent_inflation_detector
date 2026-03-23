"""
routers/forecast.py
Spending forecast endpoint.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from services.forecast_service import forecast_category

router = APIRouter(prefix="/forecast", tags=["forecast"])

DB_PATH = Path(__file__).parent.parent / "spending.db"

VALID_CATEGORIES = {"food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"}


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/{category}")
def get_forecast(
    category: str,
    periods: int = Query(default=6, ge=1, le=24),
) -> dict[str, Any]:
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Must be one of: {sorted(VALID_CATEGORIES)}",
        )

    try:
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM spending ORDER BY month ASC"
            ).fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    n = len(rows)
    if n < 3:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least 3 months of data. You have submitted {n}.",
        )

    history = [dict(r) for r in rows]

    try:
        result = forecast_category(history, category, periods)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result
