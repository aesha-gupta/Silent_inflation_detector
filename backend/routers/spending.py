"""
routers/spending.py
CRUD endpoints for monthly spending data stored in SQLite.
"""

import sqlite3
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from models.schemas import MonthlySpending, SpendingHistory

router = APIRouter(prefix="/spending", tags=["spending"])

DB_PATH = Path(__file__).parent.parent / "spending.db"  # backend/spending.db


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS spending (
                month       TEXT PRIMARY KEY,
                food        REAL,
                housing     REAL,
                transport   REAL,
                clothing    REAL,
                healthcare  REAL,
                entertainment REAL,
                others      REAL
            )
        """)
        conn.commit()


# Initialize table on module load
_init_db()


@router.post("/")
def submit_spending(body: MonthlySpending) -> dict[str, Any]:
    try:
        with _get_conn() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO spending
                    (month, food, housing, transport, clothing, healthcare, entertainment, others)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    body.month, body.food, body.housing, body.transport,
                    body.clothing, body.healthcare, body.entertainment, body.others,
                ),
            )
            conn.commit()
            count = conn.execute("SELECT COUNT(*) FROM spending").fetchone()[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    return {"status": "ok", "month": body.month, "total_entries": count}


@router.post("/batch")
def submit_spending_batch(body: SpendingHistory) -> dict[str, Any]:
    if not body.entries:
        raise HTTPException(status_code=400, detail="entries must contain at least one month.")

    try:
        with _get_conn() as conn:
            for entry in body.entries:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO spending
                        (month, food, housing, transport, clothing, healthcare, entertainment, others)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        entry.month, entry.food, entry.housing, entry.transport,
                        entry.clothing, entry.healthcare, entry.entertainment, entry.others,
                    ),
                )
            conn.commit()
            count = conn.execute("SELECT COUNT(*) FROM spending").fetchone()[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    return {
        "status": "ok",
        "months_saved": len(body.entries),
        "saved_months": [entry.month for entry in body.entries],
        "total_entries": count,
    }


@router.get("/")
def get_spending_history() -> dict[str, Any]:
    try:
        with _get_conn() as conn:
            rows = conn.execute(
                "SELECT * FROM spending ORDER BY month ASC"
            ).fetchall()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    if not rows:
        return {"message": "No spending entries found. Submit data first.", "entries": []}

    entries = [dict(r) for r in rows]
    return {"entries": entries}


@router.delete("/{month}")
def delete_spending(month: str) -> dict[str, str]:
    try:
        with _get_conn() as conn:
            cursor = conn.execute(
                "DELETE FROM spending WHERE month = ?", (month,)
            )
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"No entry found for month {month}.")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Database error: {exc}") from exc

    return {"status": "deleted", "month": month}

def get_all_spending() -> list:
    """
    Helper used by other routers to fetch all spending entries from SQLite.
    Returns list of dicts sorted by month ascending.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM spending ORDER BY month ASC")
    rows = cursor.fetchall()
    conn.close()
    columns = ["month", "food", "housing", "transport", "clothing",
               "healthcare", "entertainment", "others"]
    return [dict(zip(columns, row)) for row in rows]

