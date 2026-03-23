"""General helper utilities."""

from datetime import datetime, timedelta


def add_months(year_month: str, n: int) -> str:
    """Add n months to a YYYY-MM string and return YYYY-MM."""
    dt = datetime.strptime(year_month + "-01", "%Y-%m-%d")
    month = dt.month - 1 + n
    year  = dt.year + month // 12
    month = month % 12 + 1
    return f"{year:04d}-{month:02d}"


def clamp(value: float, min_val: float = 0.0) -> float:
    """Return value clamped to min_val."""
    return max(value, min_val)
