"""
inflation_service.py
Computes personal inflation by weighting each category's CPI YoY rate
against the user's own spend mix.
"""

from services.cpi_service import CPI_COLUMNS, get_category_inflation, get_national_inflation


def compute_personal_inflation(spending: dict, month: str) -> dict:
    """
    Compute personal inflation rate for a given month's spending.

    Parameters
    ----------
    spending : dict  keys match MonthlySpending fields (food, housing, ...)
    month    : str   YYYY-MM

    Returns
    -------
    dict with personal_inflation_rate, national_cpi_rate, difference,
         category_contributions, entertainment_spend, entertainment_flagged
    """
    # Only the 6 CPI-mapped categories are used for the calculation
    mapped_categories = list(CPI_COLUMNS.keys())  # excludes entertainment

    total_mapped_spend = sum(float(spending.get(cat, 0.0)) for cat in mapped_categories)

    if total_mapped_spend <= 0:
        raise ValueError(
            "All mapped category spends are zero — cannot compute personal inflation."
        )

    category_contributions: dict[str, float] = {}
    personal_inflation = 0.0

    for cat in mapped_categories:
        cat_spend = float(spending.get(cat, 0.0))
        spend_share = cat_spend / total_mapped_spend
        cat_inflation = get_category_inflation(cat, month)
        contribution = round(spend_share * cat_inflation, 4)
        category_contributions[cat] = contribution
        personal_inflation += contribution

    national_cpi = get_national_inflation(month)
    personal_inflation = round(personal_inflation, 2)
    difference = round(personal_inflation - national_cpi, 2)

    entertainment_spend = float(spending.get("entertainment", 0.0))

    return {
        "personal_inflation_rate": personal_inflation,
        "national_cpi_rate": national_cpi,
        "difference": difference,
        "category_contributions": category_contributions,
        "entertainment_spend": entertainment_spend,
        "entertainment_flagged": True,
    }
