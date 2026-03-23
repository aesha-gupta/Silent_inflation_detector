"""
generate_mock_cpi.py
Generates 24 months of realistic CPI Urban data starting from 2022-01
and saves to backend/data/cpi_data.csv
"""

import csv
import os
import random
from pathlib import Path

random.seed(42)

OUTPUT_PATH = Path(__file__).parent.parent / "data" / "cpi_data.csv"

COLUMNS = [
    "Year", "Month",
    "General", "Food_Beverages", "Housing",
    "Transport_Communication", "Clothing_Footwear", "Health", "Miscellaneous"
]

# Starting CPI Urban index levels (Base 2012=100)
START_VALUES = {
    "General":                 170.0,
    "Food_Beverages":          185.0,
    "Housing":                 155.0,
    "Transport_Communication": 145.0,
    "Clothing_Footwear":       160.0,
    "Health":                  165.0,
    "Miscellaneous":           160.0,
}

NUM_MONTHS = 72  # Jan 2022 – Dec 2027
START_YEAR  = 2022
START_MONTH = 1

rows = []
current = dict(START_VALUES)
year, month = START_YEAR, START_MONTH

for _ in range(NUM_MONTHS):
    row = {"Year": year, "Month": month}
    for col in COLUMNS[2:]:
        row[col] = round(current[col], 2)
        # Monthly change between +0.2% and +0.8%
        pct_change = random.uniform(0.002, 0.008)
        current[col] *= (1 + pct_change)
    rows.append(row)

    month += 1
    if month > 12:
        month = 1
        year += 1

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

with open(OUTPUT_PATH, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=COLUMNS)
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {NUM_MONTHS} months of CPI data → {OUTPUT_PATH}")
