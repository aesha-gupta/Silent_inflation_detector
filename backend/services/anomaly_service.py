"""
anomaly_service.py
Detects anomalous spending months using Z-score and Isolation Forest.
"""

from __future__ import annotations
import numpy as np

CATEGORIES = ["food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"]


def detect_anomalies_zscore(history: list[dict], threshold: float = 2.0) -> list[dict]:
    """
    Flag months where any category has |Z-score| >= threshold.

    Returns list of dicts with month, category, is_anomaly, zscore, direction, message.
    Returns empty list if fewer than 3 months.
    """
    if len(history) < 3:
        return []

    sorted_history = sorted(history, key=lambda r: r["month"])
    anomalies: list[dict] = []

    for cat in CATEGORIES:
        values = np.array([float(r.get(cat, 0.0)) for r in sorted_history], dtype=float)
        std = values.std()
        if std == 0:
            continue
        mean = values.mean()
        zscores = (values - mean) / std

        for row, z in zip(sorted_history, zscores):
            if abs(z) >= threshold:
                direction = "spike" if z > 0 else "drop"
                month = row["month"]
                anomalies.append({
                    "month": month,
                    "category": cat,
                    "is_anomaly": True,
                    "zscore": round(float(z), 2),
                    "direction": direction,
                    "message": (
                        f"Your {cat} spending in {month} was unusually "
                        f"{'high' if direction == 'spike' else 'low'} (Z={round(float(z), 1)})."
                    ),
                })

    return sorted(anomalies, key=lambda a: a["month"])


def detect_anomalies_isolation_forest(history: list[dict]) -> list[dict]:
    """
    Flag months with unusual overall spending patterns using Isolation Forest.

    Returns empty list if fewer than 6 months.
    """
    if len(history) < 6:
        return []

    try:
        from sklearn.ensemble import IsolationForest
    except ImportError:
        return []

    sorted_history = sorted(history, key=lambda r: r["month"])
    X = np.array(
        [[float(r.get(cat, 0.0)) for cat in CATEGORIES] for r in sorted_history],
        dtype=float,
    )

    clf = IsolationForest(contamination=0.15, random_state=42)
    preds = clf.fit_predict(X)  # -1 = anomaly, 1 = normal
    scores = clf.decision_function(X)

    anomalies = []
    for row, pred, score in zip(sorted_history, preds, scores):
        if pred == -1:
            month = row["month"]
            anomalies.append({
                "month": month,
                "category": "overall",
                "is_anomaly": True,
                "zscore": round(float(-score), 2),  # invert so higher = more anomalous
                "direction": "spike",
                "message": (
                    f"Overall spending pattern in {month} was unusual "
                    "across multiple categories."
                ),
            })

    return sorted(anomalies, key=lambda a: a["month"])
