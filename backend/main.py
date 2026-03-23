"""
main.py — Silent Inflation Detector API
FastAPI app root: registers all routers, CORS, and health endpoint.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import spending, inflation, forecast, anomaly, insights, whatif

app = FastAPI(
    title="Silent Inflation Detector API",
    description="Computes personal inflation from CPI Urban data.",
    version="1.0.0",
)

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(spending.router)
app.include_router(inflation.router)
app.include_router(forecast.router)
app.include_router(anomaly.router)
app.include_router(insights.router)
app.include_router(whatif.router)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    """Return API health and whether CPI data loaded successfully."""
    cpi_loaded = False
    try:
        from services.cpi_service import get_cpi_df
        df = get_cpi_df()
        cpi_loaded = len(df) > 0
    except Exception:
        cpi_loaded = False

    return {"status": "ok", "cpi_data_loaded": cpi_loaded}
