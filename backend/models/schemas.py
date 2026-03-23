"""Pydantic models for Silent Inflation Detector API."""

import re
from typing import Dict, List, Optional
from pydantic import BaseModel, field_validator


MONTH_REGEX = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")
VALID_CATEGORIES = {"food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"}


class MonthlySpending(BaseModel):
    month: str
    food: float = 0.0
    housing: float = 0.0
    transport: float = 0.0
    clothing: float = 0.0
    healthcare: float = 0.0
    entertainment: float = 0.0
    others: float = 0.0

    @field_validator("month")
    @classmethod
    def validate_month_format(cls, v: str) -> str:
        if not MONTH_REGEX.match(v):
            raise ValueError("month must be in YYYY-MM format (e.g. 2023-01)")
        return v

    @field_validator("food", "housing", "transport", "clothing", "healthcare", "entertainment", "others")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Spending values must be non-negative")
        return v


class SpendingHistory(BaseModel):
    entries: List[MonthlySpending]


class PersonalInflationResult(BaseModel):
    month: str
    personal_inflation_rate: float
    national_cpi_rate: float
    difference: float
    category_contributions: Dict[str, float]
    entertainment_spend: float
    entertainment_flagged: bool = True


class ForecastPoint(BaseModel):
    month: str
    predicted: float
    lower: float
    upper: float


class ForecastResult(BaseModel):
    category: str
    forecast: List[Dict]


class AnomalyResult(BaseModel):
    month: str
    category: str
    is_anomaly: bool = True
    zscore: float
    direction: str  # "spike" or "drop"
    message: str


class InsightCard(BaseModel):
    type: str  # "warning" / "info" / "positive" / "flag"
    title: str
    body: str
    category: Optional[str] = None


class WhatIfInput(BaseModel):
    base_spending: MonthlySpending
    category: str
    change_percent: float

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"category must be one of {sorted(VALID_CATEGORIES)}")
        return v


class WhatIfResult(BaseModel):
    original_inflation: float
    new_inflation: float
    delta: float
    message: str
