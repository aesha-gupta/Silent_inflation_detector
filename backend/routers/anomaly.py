"""
routers/anomaly.py
Spending anomaly detection endpoints.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from services.anomaly_service import (
    detect_anomalies_zscore,
    detect_anomalies_isolation_forest,
)

router = APIRouter(prefix="/anomaly", tags=["anomaly"])

DB_PATH = Path(__file__).parent.parent / "spending.db"

VALID_METHODS = {"zscore", "isolation_forest"}


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/")
def get_anomalies(
    method: str = Query(default="zscore"),
) -> dict[str, Any]:
    if method not in VALID_METHODS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid method '{method}'. Choose from: {sorted(VALID_METHODS)}",
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

    if method == "zscore":
        anomalies = detect_anomalies_zscore(history)
    else:
        anomalies = detect_anomalies_isolation_forest(history)

    return {
        "method": method,
        "total_flagged": len(anomalies),
        "anomalies": anomalies,
    }
