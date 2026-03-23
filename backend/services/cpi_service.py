"""
cpi_service.py
Loads and caches CPI data. Exposes helpers to fetch national and
category-level inflation for a given month.

CPI Urban — Base Year 2012
Source: MOSPI (mospi.gov.in)
Do NOT substitute with CPI Rural or CPI Combined.
CPI Urban reflects prices experienced by city-dwelling consumers.
"""

from __future__ import annotations
import pandas as pd
from utils.data_loader import load_cpi_data, get_yoy_inflation

# ---------------------------------------------------------------------------
# Weights from RBI/MOSPI CPI Urban basket
# ---------------------------------------------------------------------------
CPI_WEIGHTS = {
    "food":          0.4586,
    "housing":       0.1007,
    "transport":     0.0737,
    "clothing":      0.0653,
    "healthcare":    0.0589,
    "entertainment": None,      # NOT IN RBI CPI — flagged separately
    "others":        0.2832,
}

CPI_COLUMNS = {
    "food":        "Food_Beverages",
    "housing":     "Housing",
    "transport":   "Transport_Communication",
    "clothing":    "Clothing_Footwear",
    "healthcare":  "Health",
    "others":      "Miscellaneous",
}

# Module-level cache
_cpi_df: pd.DataFrame | None = None


def get_cpi_df() -> pd.DataFrame:
    """Return the cached CPI DataFrame, loading it on first call."""
    global _cpi_df
    if _cpi_df is None:
        _cpi_df = load_cpi_data()
    return _cpi_df


def get_national_inflation(month: str) -> float:
    """Return General CPI YoY % change for the given YYYY-MM month."""
    df = get_cpi_df()
    return get_yoy_inflation(df, "General", month)


def get_category_inflation(category: str, month: str) -> float:
    """Return YoY % change for a specific CPI-mapped category."""
    if category not in CPI_COLUMNS:
        raise ValueError(
            f"'{category}' is not a CPI-mapped category. "
            f"Valid options: {sorted(CPI_COLUMNS)}"
        )
    df = get_cpi_df()
    return get_yoy_inflation(df, CPI_COLUMNS[category], month)


def get_all_available_months() -> list[str]:
    """Return sorted list of YYYY-MM strings available in the CPI data."""
    df = get_cpi_df()
    return sorted(df.index.strftime("%Y-%m").tolist())
