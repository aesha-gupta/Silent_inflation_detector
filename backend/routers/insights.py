"""
routers/insights.py
Generates actionable insight cards from all computed data.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from services.inflation_service import compute_personal_inflation
from services.anomaly_service import detect_anomalies_zscore
from services.forecast_service import forecast_category
from services.insight_service import generate_insights

router = APIRouter(prefix="/insights", tags=["insights"])

DB_PATH = Path(__file__).parent.parent / "spending.db"


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/")
def get_insights() -> dict[str, Any]:
    try:
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM spending ORDER BY month ASC"
            ).fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    if not rows:
        raise HTTPException(
            status_code=400,
            detail="No spending data found. Submit at least 1 month of data.",
        )

    history = [dict(r) for r in rows]
    latest = history[-1]
    month = latest["month"]

    # Compute inflation for latest month
    try:
        inflation_data = compute_personal_inflation(latest, month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    # Compute anomalies
    anomalies = detect_anomalies_zscore(history) if len(history) >= 3 else []

    # Forecast food, housing, transport (1 period each)
    forecast_summary: dict[str, float] = {}
    if len(history) >= 3:
        for cat in ("food", "housing", "transport"):
            try:
                result = forecast_category(history, cat, periods=1)
                if result["forecast"]:
                    forecast_summary[cat] = result["forecast"][0]["predicted"]
            except Exception:
                pass

    insights = generate_insights(
        personal_inflation=inflation_data["personal_inflation_rate"],
        national_inflation=inflation_data["national_cpi_rate"],
        category_contributions=inflation_data["category_contributions"],
        anomalies=anomalies,
        entertainment_spend=inflation_data["entertainment_spend"],
        forecast_summary=forecast_summary,
        history_length=len(history),
    )

    return {"month": month, "insights": insights}
