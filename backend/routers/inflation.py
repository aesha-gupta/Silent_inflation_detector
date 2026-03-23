"""
routers/inflation.py
Endpoints to compute personal and national CPI inflation.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from services.inflation_service import compute_personal_inflation
from services.cpi_service import get_national_inflation

router = APIRouter(prefix="/inflation", tags=["inflation"])

DB_PATH = Path(__file__).parent.parent / "spending.db"


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def _row_to_dict(row: sqlite3.Row) -> dict:
    return dict(row)


@router.get("/history/all")
def get_inflation_history() -> dict[str, Any]:
    """Compute personal inflation for every month in the DB."""
    try:
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM spending ORDER BY month ASC"
            ).fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    if len(rows) < 1:
        raise HTTPException(
            status_code=400,
            detail="No spending data found. Please submit at least 1 month.",
        )

    history = []
    for row in rows:
        spending = _row_to_dict(row)
        month = spending["month"]
        try:
            result = compute_personal_inflation(spending, month)
            history.append({"month": month, **result})
        except ValueError:
            # Skip months where CPI data is unavailable
            continue

    if len(history) < 1:
        raise HTTPException(
            status_code=400,
            detail="No spending months matched available CPI data.",
        )

    return {"history": history}


@router.get("/national/{month}")
def get_national_cpi(month: str) -> dict[str, Any]:
    """Return national CPI YoY % for a given YYYY-MM month."""
    try:
        rate = get_national_inflation(month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"month": month, "national_cpi_rate": rate}


@router.get("/{month}")
def get_inflation_for_month(month: str) -> dict[str, Any]:
    """Compute personal inflation for a specific month."""
    try:
        with _get_conn() as conn:
            row = conn.execute(
                "SELECT * FROM spending WHERE month = ?", (month,)
            ).fetchone()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    if row is None:
        raise HTTPException(
            status_code=404, detail=f"No spending data found for month {month}."
        )

    spending = _row_to_dict(row)
    try:
        result = compute_personal_inflation(spending, month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"month": month, **result}
