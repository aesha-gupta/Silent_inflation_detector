"""
wpi_service.py
Loads and caches WPI data. Exposes helpers to fetch national WPI and
WPI category-level inflation for a given month.
"""

from __future__ import annotations
import pandas as pd
from utils.wpi_loader import load_wpi_data, get_wpi_yoy_inflation

WPI_COLUMNS = {
    "raw_materials":  "Primary_Articles",
    "fuel":           "Fuel_Power",
    "manufactured":   "Manufactured_Products",
    "food_stock":     "Food_Articles",
    "general":        "WPI_General",
}

# Module-level cache
_wpi_df: pd.DataFrame | None = None

def get_wpi_df() -> pd.DataFrame:
    """Return the cached WPI DataFrame, loading it on first call."""
    global _wpi_df
    if _wpi_df is None:
        _wpi_df = load_wpi_data()
    return _wpi_df

def get_wpi_general_inflation(month: str) -> float:
    """Return General WPI YoY % change for the given YYYY-MM month."""
    df = get_wpi_df()
    return get_wpi_yoy_inflation(df, "WPI_General", month)

def get_wpi_category_inflation(category: str, month: str) -> float:
    """Return YoY % change for a specific WPI-mapped category."""
    if category not in WPI_COLUMNS:
        raise ValueError(
            f"'{category}' is not a WPI-mapped category. "
            f"Valid options: {sorted(list(WPI_COLUMNS.keys()))}"
        )
    df = get_wpi_df()
    return get_wpi_yoy_inflation(df, WPI_COLUMNS[category], month)

def get_all_available_wpi_months() -> list[str]:
    """Return sorted list of YYYY-MM strings available in the WPI data."""
    df = get_wpi_df()
    return sorted(df.index.strftime("%Y-%m").tolist())
