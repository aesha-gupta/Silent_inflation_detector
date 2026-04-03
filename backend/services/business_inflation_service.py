from services.wpi_service import get_wpi_category_inflation, get_wpi_general_inflation
from services.cpi_service import get_category_inflation
from data.sectors import SECTORS

def compute_business_inflation(sector: str, costs: dict, month: str) -> dict:
    """
    Computes business input cost inflation rate.

    sector: one of the keys in SECTORS dict
    costs: dict of category -> monthly spend amount
    month: "YYYY-MM"

    Logic:
    1. Validate sector exists
    2. Total all cost category spends
    3. For each category with a WPI column: fetch WPI YoY inflation
    4. For rent categories (wpi_col=None): use CPI Housing as proxy
    5. For labour categories (wpi_col=None): use fixed 8% (avg Indian wage inflation)
    6. Compute spend-weighted average inflation across all categories
    7. Fetch WPI General as benchmark
    8. Compute "should raise prices" signal:
       - If business_inflation > 6%: "Yes — your costs are rising fast"
       - If business_inflation 3-6%: "Monitor — moderate cost pressure"  
       - If business_inflation < 3%: "No — cost pressure is manageable"

    Returns:
        business_inflation_rate: float
        wpi_general_rate: float
        difference: float (business rate - WPI general)
        category_contributions: dict
        top_cost_driver: str (category with highest contribution)
        should_raise_prices: str ("Yes" / "Monitor" / "No")
        raise_prices_message: str
        sector_display_name: str
    """

    LABOUR_INFLATION = 8.0  # Fixed assumption — avg Indian informal sector wage growth

    if sector not in SECTORS:
        raise ValueError(f"Unknown sector '{sector}'. Choose from: {list(SECTORS.keys())}")

    sector_def = SECTORS[sector]
    categories = sector_def["categories"]

    total_cost = sum(costs.get(cat, 0) for cat in categories)
    if total_cost == 0:
        raise ValueError("Total business costs are zero — cannot compute inflation.")

    category_contributions = {}
    business_inflation = 0.0

    for cat, meta in categories.items():
        spend = costs.get(cat, 0)
        spend_share = spend / total_cost

        if meta["wpi_col"] is not None:
            inflation_rate = get_wpi_category_inflation(cat, month)
        elif cat == "rent":
            inflation_rate = get_category_inflation("housing", month)  # CPI Housing proxy
        else:  # labour
            inflation_rate = LABOUR_INFLATION

        contribution = spend_share * inflation_rate
        category_contributions[meta["label"]] = round(contribution, 4)
        business_inflation += contribution

    business_inflation = round(business_inflation, 2)
    wpi_general = get_wpi_general_inflation(month)
    top_driver = max(category_contributions, key=category_contributions.get)

    if business_inflation > 6:
        signal = "Yes"
        signal_message = (f"Your input costs are rising at {business_inflation}%. "
                         f"Consider a price revision to protect margins.")
    elif business_inflation >= 3:
        signal = "Monitor"
        signal_message = (f"Your input costs are rising at {business_inflation}%. "
                         f"Monitor closely — a price revision may be needed soon.")
    else:
        signal = "No"
        signal_message = (f"Your input costs are rising at {business_inflation}%. "
                         f"Cost pressure is manageable — no immediate price revision needed.")

    return {
        "business_inflation_rate": business_inflation,
        "wpi_general_rate": wpi_general,
        "difference": round(business_inflation - wpi_general, 2),
        "category_contributions": category_contributions,
        "top_cost_driver": top_driver,
        "should_raise_prices": signal,
        "raise_prices_message": signal_message,
        "sector_display_name": sector_def["display_name"],
    }