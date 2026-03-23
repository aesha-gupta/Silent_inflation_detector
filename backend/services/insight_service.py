"""
insight_service.py
Generates InsightCard dicts from computed inflation and anomaly data.
"""

from __future__ import annotations


def generate_insights(
    personal_inflation: float,
    national_inflation: float,
    category_contributions: dict[str, float],
    anomalies: list[dict],
    entertainment_spend: float,
    forecast_summary: dict[str, float],  # {category: next_month_predicted}
    history_length: int,
) -> list[dict]:
    """
    Generate a list of InsightCard dicts.
    """
    cards: list[dict] = []
    difference = round(personal_inflation - national_inflation, 2)

    # 1 — Personal vs National
    if difference > 2:
        cards.append({
            "type": "warning",
            "title": "Your inflation is significantly above the national average",
            "body": (
                f"Your personal inflation rate is {personal_inflation:.1f}%, "
                f"vs the national average of {national_inflation:.1f}%. "
                f"You are paying {difference:.1f}% more than the government's headline figure."
            ),
            "category": None,
        })
    elif difference < -1:
        cards.append({
            "type": "positive",
            "title": "You are beating the national inflation rate",
            "body": (
                f"Your personal inflation rate of {personal_inflation:.1f}% is "
                f"{abs(difference):.1f}% below the national average of {national_inflation:.1f}%. "
                "Your spending mix is insulating you from headline price pressures."
            ),
            "category": None,
        })
    else:
        cards.append({
            "type": "info",
            "title": "Your inflation broadly tracks the national average",
            "body": (
                f"Your personal inflation rate ({personal_inflation:.1f}%) is close to "
                f"the national CPI ({national_inflation:.1f}%). "
                "Your spending mix aligns reasonably with the RBI basket."
            ),
            "category": None,
        })

    # 2 — Biggest category driver
    if category_contributions:
        top_cat = max(category_contributions, key=lambda c: category_contributions[c])
        top_val = category_contributions[top_cat]
        cards.append({
            "type": "info",
            "title": f"{top_cat.capitalize()} is your biggest inflation driver",
            "body": (
                f"{top_cat.capitalize()} contributes {top_val:.2f} percentage points "
                "to your personal inflation rate. Consider reviewing your spend in this category."
            ),
            "category": top_cat,
        })

    # 3 — Entertainment flag (always if > 0)
    if entertainment_spend > 0:
        cards.append({
            "type": "flag",
            "title": "Your entertainment spend is invisible to policymakers",
            "body": (
                f"You spend ₹{entertainment_spend:,.0f}/month on entertainment. "
                "This category is NOT tracked in RBI's official CPI Urban basket, "
                "meaning your true cost of living is underrepresented in government inflation data."
            ),
            "category": "entertainment",
        })

    # 4 — Anomaly alerts (up to 2)
    for anomaly in anomalies[:2]:
        cards.append({
            "type": "warning",
            "title": f"Spending anomaly detected — {anomaly.get('category', 'unknown').capitalize()}",
            "body": anomaly.get("message", "An unusual spending pattern was detected."),
            "category": anomaly.get("category"),
        })

    # 5 — Forecast card (highest predicted next-month spend)
    if forecast_summary:
        top_forecast_cat = max(forecast_summary, key=lambda c: forecast_summary[c])
        top_forecast_val = forecast_summary[top_forecast_cat]
        if top_forecast_val > 0:
            cards.append({
                "type": "info",
                "title": f"Forecast: {top_forecast_cat.capitalize()} spending next month",
                "body": (
                    f"Based on your history, your {top_forecast_cat} spending is "
                    f"projected at ₹{top_forecast_val:,.0f} next month."
                ),
                "category": top_forecast_cat,
            })

    return cards
