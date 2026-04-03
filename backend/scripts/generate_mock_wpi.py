import csv
import random
from pathlib import Path

def generate_mock_wpi():
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    out_file = data_dir / "wpi_data.csv"

    columns = ["Year", "Month", "WPI_General", "Food_Articles", "Fuel_Power", "Manufactured_Products", "Primary_Articles"]

    indices = {
        "WPI_General": 153.0,
        "Food_Articles": 172.0,
        "Fuel_Power": 142.0,
        "Manufactured_Products": 148.0,
        "Primary_Articles": 168.0,
    }

    with open(out_file, mode="w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(columns)

        for year in [2023, 2024]:
            for month in range(1, 13):
                row = [year, f"{month:02d}"]
                for col in columns[2:]:
                    # random increment between +0.1% and +0.6%
                    increment = random.uniform(0.001, 0.006)
                    indices[col] = indices[col] * (1 + increment)
                    row.append(round(indices[col], 1))
                writer.writerow(row)

if __name__ == "__main__":
    generate_mock_wpi()
    print("Generated mock WPI data at backend/data/wpi_data.csv")
