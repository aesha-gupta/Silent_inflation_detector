# Each sector has 5-6 cost categories mapped to WPI sub-indices
# These represent what businesses in that sector actually spend on

SECTORS = {
    "restaurant": {
        "display_name": "Restaurant / F&B",
        "categories": {
            "raw_materials":   {"label": "Food & Raw Materials", "wpi_col": "Food_Articles"},
            "fuel":            {"label": "Fuel & Electricity",   "wpi_col": "Fuel_Power"},
            "manufactured":    {"label": "Packaging & Supplies", "wpi_col": "Manufactured_Products"},
            "rent":            {"label": "Rent & Premises",      "wpi_col": None},  # use CPI Housing
            "labour":          {"label": "Labour & Wages",       "wpi_col": None},  # fixed, no index
        }
    },
    "logistics": {
        "display_name": "Logistics / Transport",
        "categories": {
            "fuel":            {"label": "Diesel & Fuel",        "wpi_col": "Fuel_Power"},
            "manufactured":    {"label": "Vehicle Maintenance",  "wpi_col": "Manufactured_Products"},
            "raw_materials":   {"label": "Spare Parts",          "wpi_col": "Primary_Articles"},
            "rent":            {"label": "Warehouse Rent",       "wpi_col": None},  # use CPI Housing
            "labour":          {"label": "Driver & Staff Wages", "wpi_col": None},
        }
    },
    "retail": {
        "display_name": "Retail / FMCG",
        "categories": {
            "manufactured":    {"label": "Stock & Inventory",    "wpi_col": "Manufactured_Products"},
            "raw_materials":   {"label": "Raw Materials",        "wpi_col": "Primary_Articles"},
            "fuel":            {"label": "Electricity & Fuel",   "wpi_col": "Fuel_Power"},
            "rent":            {"label": "Shop Rent",            "wpi_col": None},
            "labour":          {"label": "Staff Wages",          "wpi_col": None},
        }
    },
    "healthcare": {
        "display_name": "Healthcare Clinic",
        "categories": {
            "manufactured":    {"label": "Medicines & Supplies", "wpi_col": "Manufactured_Products"},
            "raw_materials":   {"label": "Medical Equipment",    "wpi_col": "Primary_Articles"},
            "fuel":            {"label": "Electricity",          "wpi_col": "Fuel_Power"},
            "rent":            {"label": "Clinic Rent",          "wpi_col": None},
            "labour":          {"label": "Staff Salaries",       "wpi_col": None},
        }
    },
    "construction": {
        "display_name": "Construction",
        "categories": {
            "raw_materials":   {"label": "Cement & Steel",       "wpi_col": "Primary_Articles"},
            "manufactured":    {"label": "Tools & Equipment",    "wpi_col": "Manufactured_Products"},
            "fuel":            {"label": "Fuel & Power",         "wpi_col": "Fuel_Power"},
            "rent":            {"label": "Site & Equipment Rent","wpi_col": None},
            "labour":          {"label": "Labour Wages",         "wpi_col": None},
        }
    },
}
