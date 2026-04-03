"""
routers/anomaly.py
Spending anomaly detection endpoints.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from services.anomaly_service import (
    detect_anomalies_small_sample_guardrail,
    detect_anomalies_zscore,
    detect_anomalies_isolation_forest,
)

router = APIRouter(prefix="/anomaly", tags=["anomaly"])

DB_PATH = Path(__file__).parent.parent / "spending.db"

VALID_METHODS = {"zscore", "isolation_forest", "auto"}


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@router.get("/")
def get_anomalies(
    method: str = Query(default="auto"),
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
    history = [dict(r) for r in rows]

    def _run_selected(selected: str) -> list[dict]:
        if selected == "zscore":
            return detect_anomalies_zscore(history) if n >= 3 else []
        return detect_anomalies_isolation_forest(history) if n >= 6 else []

    methods_run: list[str]
    if method == "auto":
        methods_run = []
        anomalies: list[dict] = []
        if 2 <= n <= 5:
            methods_run.append("small_sample_guardrail")
            anomalies.extend(detect_anomalies_small_sample_guardrail(history))
        if n >= 3:
            methods_run.append("zscore")
            anomalies.extend(_run_selected("zscore"))
        if n >= 6:
            methods_run.append("isolation_forest")
            anomalies.extend(_run_selected("isolation_forest"))
    else:
        methods_run = [method] if ((method == "zscore" and n >= 3) or (method == "isolation_forest" and n >= 6)) else []
        anomalies = _run_selected(method)

    return {
        "method": method,
        "months_available": n,
        "minimum_months": {"small_sample_guardrail": 2, "zscore": 3, "isolation_forest": 6},
        "methods_run": methods_run,
        "total_flagged": len(anomalies),
        "anomalies": anomalies,
    }
