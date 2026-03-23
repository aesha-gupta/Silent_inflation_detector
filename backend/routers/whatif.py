"""
routers/whatif.py
What-If simulator: shows how a % change in one category affects personal inflation.
"""

from typing import Any

from fastapi import APIRouter, HTTPException

from models.schemas import WhatIfInput
from services.inflation_service import compute_personal_inflation
from services.cpi_service import CPI_COLUMNS

router = APIRouter(prefix="/whatif", tags=["whatif"])

CPI_MAPPED_CATEGORIES = set(CPI_COLUMNS.keys())  # excludes entertainment


@router.post("/")
def simulate_whatif(body: WhatIfInput) -> dict[str, Any]:
    if body.category == "entertainment":
        raise HTTPException(
            status_code=400,
            detail="Entertainment is not tracked in CPI Urban and cannot be used in What-If simulation.",
        )

    if body.category not in CPI_MAPPED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Category must be one of: {sorted(CPI_MAPPED_CATEGORIES)}",
        )

    spending = body.base_spending.model_dump()
    month = spending["month"]

    # --- Original inflation ---
    try:
        original = compute_personal_inflation(spending, month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    original_inflation = original["personal_inflation_rate"]

    # --- Modified spending ---
    modified = dict(spending)
    old_value = float(modified.get(body.category, 0.0))
    modified[body.category] = old_value * (1 + body.change_percent / 100)

    try:
        new_result = compute_personal_inflation(modified, month)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    new_inflation = new_result["personal_inflation_rate"]
    delta = round(new_inflation - original_inflation, 2)

    spent_more       = body.change_percent > 0
    spent_less       = body.change_percent < 0
    inflation_rose   = delta > 0.005
    inflation_fell   = delta < -0.005
    negligible       = abs(delta) < 0.005

    cat = body.category.capitalize()

    if negligible:
        message = (
            f"Changing {cat} spending by {abs(body.change_percent):.0f}% has virtually no "
            f"effect on your personal inflation — this category carries a small weight in your spend mix."
        )

    # ✅ Normal: spend more → inflation rises
    elif spent_more and inflation_rose:
        message = (
            f"A {abs(body.change_percent):.0f}% rise in {cat} spending increases your "
            f"personal inflation by {abs(delta):.2f} pp. {cat} inflation is above your "
            f"current average, so spending more here directly raises your cost burden."
        )

    # ✅ Normal: spend less → inflation falls
    elif spent_less and inflation_fell:
        message = (
            f"A {abs(body.change_percent):.0f}% cut in {cat} spending reduces your "
            f"personal inflation by {abs(delta):.2f} pp. Spending less on a higher-inflation "
            f"category lowers its weight, pulling your overall rate down."
        )

    # ⚠️ Counterintuitive: spend less → inflation RISES
    elif spent_less and inflation_rose:
        message = (
            f"⚠️ Even though you cut {cat} spending by {abs(body.change_percent):.0f}%, "
            f"your personal inflation rises by {abs(delta):.2f} pp.\n\n"
            f"Why: {cat} carries a LOWER CPI inflation rate than your other categories. "
            f"Reducing it shifts proportional weight onto higher-inflation categories "
            f"(like Food or Housing), nudging your weighted average up.\n\n"
            f"This is NOT a recommendation to spend more on {cat}. "
            f"It shows that your inflation exposure is driven by your other categories — "
            f"cutting those would have a much larger positive impact."
        )

    # ⚠️ Counterintuitive: spend more → inflation FALLS
    elif spent_more and inflation_fell:
        message = (
            f"⚠️ Even though you increased {cat} spending by {abs(body.change_percent):.0f}%, "
            f"your personal inflation falls by {abs(delta):.2f} pp.\n\n"
            f"Why: {cat} carries a LOWER CPI inflation rate than your other categories. "
            f"Spending more on it dilutes the weight of higher-inflation categories, "
            f"pulling your weighted average down.\n\n"
            f"This is NOT a recommendation to spend more on {cat}. "
            f"Increasing spending to reduce an inflation metric is not financially sound. "
            f"The real takeaway: your inflation is driven by higher-CPI categories — "
            f"focus on managing those directly."
        )

    else:
        message = (
            f"A {abs(body.change_percent):.0f}% change in {cat} spending "
            f"shifts your personal inflation by {delta:+.2f} pp."
        )

    return {
        "original_inflation": original_inflation,
        "new_inflation": new_inflation,
        "delta": delta,
        "message": message,
    }
