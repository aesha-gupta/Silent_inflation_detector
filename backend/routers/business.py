from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from services.business_inflation_service import compute_business_inflation
from data.sectors import SECTORS

router = APIRouter(prefix="/business", tags=["Business"])

class BusinessInflationInput(BaseModel):
    sector: str
    costs: Dict[str, float]
    month: str  # YYYY-MM format


class BusinessBatchEntry(BaseModel):
    month: str
    costs: Dict[str, float]


class BusinessInflationBatchInput(BaseModel):
    sector: str
    entries: list[BusinessBatchEntry]

@router.get("/sectors", summary="Get all available business sectors and their cost categories")
def get_sectors():
    """Returns sector definitions for frontend to build dynamic forms."""
    return {
        sector_key: {
            "display_name": sector_data["display_name"],
            "categories": {
                cat_key: meta["label"]
                for cat_key, meta in sector_data["categories"].items()
            }
        }
        for sector_key, sector_data in SECTORS.items()
    }

@router.post("/inflation", summary="Compute business input cost inflation")
def get_business_inflation(data: BusinessInflationInput):
    """
    Accepts sector, cost breakdown, and month.
    Returns business inflation rate vs WPI + insights.
    Validates: sector must be valid, all cost values >= 0,
    month must be YYYY-MM format, at least one cost > 0.
    """
    if data.sector not in SECTORS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sector. Choose from: {list(SECTORS.keys())}"
        )
    if any(v < 0 for v in data.costs.values()):
        raise HTTPException(status_code=400, detail="Cost values cannot be negative.")
    if sum(data.costs.values()) == 0:
        raise HTTPException(status_code=400, detail="At least one cost category must be greater than zero.")
    try:
        result = compute_business_inflation(data.sector, data.costs, data.month)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/inflation/batch", summary="Compute business inflation for multiple months")
def get_business_inflation_batch(data: BusinessInflationBatchInput):
    """
    Accepts one sector and multiple month+cost entries.
    Returns computed inflation results for each month.
    """
    if data.sector not in SECTORS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sector. Choose from: {list(SECTORS.keys())}"
        )
    if not data.entries:
        raise HTTPException(status_code=400, detail="entries must contain at least one month.")

    seen_months = set()
    results = []
    for entry in data.entries:
        if entry.month in seen_months:
            raise HTTPException(status_code=400, detail=f"Duplicate month found: {entry.month}")
        seen_months.add(entry.month)

        if any(v < 0 for v in entry.costs.values()):
            raise HTTPException(status_code=400, detail=f"Cost values cannot be negative for month {entry.month}.")
        if sum(entry.costs.values()) == 0:
            raise HTTPException(status_code=400, detail=f"At least one cost category must be greater than zero for month {entry.month}.")

        try:
            month_result = compute_business_inflation(data.sector, entry.costs, entry.month)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        month_result["month"] = entry.month
        results.append(month_result)

    results = sorted(results, key=lambda r: r["month"])
    return {
        "sector": data.sector,
        "total_months": len(results),
        "results": results,
    }
