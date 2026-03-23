"""Utilities to load and validate CPI data from CSV."""

from pathlib import Path
import pandas as pd

CPI_CSV_PATH = Path(__file__).parent.parent / "data" / "cpi_data.csv"

REQUIRED_COLUMNS = {
    "Year", "Month", "General", "Food_Beverages", "Housing",
    "Transport_Communication", "Clothing_Footwear", "Health", "Miscellaneous"
}


def load_cpi_data() -> pd.DataFrame:
    """Load and validate the CPI Urban CSV. Returns a clean DataFrame."""
    if not CPI_CSV_PATH.exists():
        raise FileNotFoundError(
            f"CPI data file not found at {CPI_CSV_PATH}. "
            "Run scripts/generate_mock_cpi.py first or place real MOSPI CPI Urban data there."
        )

    df = pd.read_csv(CPI_CSV_PATH)

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"CPI CSV is missing required columns: {sorted(missing)}")

    # Build datetime index from Year + Month columns
    df["date"] = pd.to_datetime(
        df["Year"].astype(str) + "-" + df["Month"].astype(str).str.zfill(2),
        format="%Y-%m"
    )
    df = df.set_index("date").sort_index()

    # Drop rows with nulls in any CPI numeric column
    cpi_cols = list(REQUIRED_COLUMNS - {"Year", "Month"})
    df = df.dropna(subset=cpi_cols)

    return df


def get_yoy_inflation(df: pd.DataFrame, column: str, month: str) -> float:
    """Compute Year-over-Year % change for a column at a given YYYY-MM month."""
    try:
        target_date = pd.Timestamp(month + "-01")
    except Exception:
        raise ValueError(f"Invalid month format '{month}'. Use YYYY-MM.")

    prior_date = target_date - pd.DateOffset(years=1)

    available = df.index.strftime("%Y-%m").tolist()
    earliest = available[0] if available else "N/A"
    latest   = available[-1] if available else "N/A"

    if target_date not in df.index:
        raise ValueError(
            f"CPI data unavailable for {month}. Available range: {earliest} to {latest}."
        )
    if prior_date not in df.index:
        prior_month = prior_date.strftime("%Y-%m")
        raise ValueError(
            f"CPI data unavailable for {prior_month}. Available range: {earliest} to {latest}."
        )

    current_val = df.loc[target_date, column]
    prior_val   = df.loc[prior_date, column]

    if prior_val == 0:
        return 0.0

    yoy = ((current_val - prior_val) / prior_val) * 100
    return round(float(yoy), 2)
