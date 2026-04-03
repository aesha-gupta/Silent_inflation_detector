"""
anomaly_service.py
Detects anomalous spending months using Z-score and Isolation Forest.
"""

from __future__ import annotations
import numpy as np

CATEGORIES = ["food", "housing", "transport", "clothing", "healthcare", "entertainment", "others"]


def _zscore_threshold_for_sample(n: int, default_threshold: float) -> float:
    # Be slightly more sensitive with short histories, then tighten to the default.
    if n < 6:
        return min(default_threshold, 1.3)
    return default_threshold


def detect_anomalies_zscore(history: list[dict], threshold: float = 2.0) -> list[dict]:
    """
    Flag months where any category has |Z-score| >= threshold.

    Returns list of dicts with month, category, is_anomaly, zscore, direction, message.
    Returns empty list if fewer than 3 months.
    """
    if len(history) < 3:
        return []

    sorted_history = sorted(history, key=lambda r: r["month"])
    effective_threshold = _zscore_threshold_for_sample(len(sorted_history), threshold)
    anomalies: list[dict] = []

    for cat in CATEGORIES:
        values = np.array([float(r.get(cat, 0.0)) for r in sorted_history], dtype=float)
        std = values.std()
        if std == 0:
            continue
        mean = values.mean()
        zscores = (values - mean) / std

        for row, z in zip(sorted_history, zscores):
            if abs(z) >= effective_threshold:
                direction = "spike" if z > 0 else "drop"
                month = row["month"]
                anomalies.append({
                    "month": month,
                    "method": "zscore",
                    "category": cat,
                    "is_anomaly": True,
                    "zscore": round(float(z), 2),
                    "direction": direction,
                    "confidence": "medium" if len(sorted_history) < 12 else "high",
                    "message": (
                        f"Your {cat} spending in {month} was unusually "
                        f"{'high' if direction == 'spike' else 'low'} (Z={round(float(z), 1)}, threshold={effective_threshold})."
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
                "method": "isolation_forest",
                "category": "overall",
                "is_anomaly": True,
                "zscore": round(float(-score), 2),  # invert so higher = more anomalous
                "direction": "spike",
                "confidence": "medium" if len(sorted_history) < 12 else "high",
                "message": (
                    f"Overall spending pattern in {month} was unusual "
                    "across multiple categories."
                ),
            })

    return sorted(anomalies, key=lambda a: a["month"])


def detect_anomalies_small_sample_guardrail(
    history: list[dict],
    mom_threshold: float = 0.6,
    robust_z_threshold: float = 2.5,
) -> list[dict]:
    """
    Fallback detector for short histories (2 to 5 months).

    Flags strong month-over-month jumps or robust outliers using MAD-based z-scores.
    """
    n = len(history)
    if n < 2:
        return []

    sorted_history = sorted(history, key=lambda r: r["month"])
    anomalies: list[dict] = []
    seen: set[tuple[str, str]] = set()

    for cat in CATEGORIES:
        values = np.array([float(r.get(cat, 0.0)) for r in sorted_history], dtype=float)

        # Rule 1: Month-over-month jump/drop
        for idx in range(1, n):
            prev_val = float(values[idx - 1])
            curr_val = float(values[idx])
            denom = prev_val if abs(prev_val) > 1e-9 else 1.0
            mom_change = (curr_val - prev_val) / denom
            if abs(mom_change) >= mom_threshold:
                month = sorted_history[idx]["month"]
                key = (month, cat)
                if key in seen:
                    continue
                seen.add(key)
                direction = "spike" if mom_change > 0 else "drop"
                anomalies.append({
                    "month": month,
                    "method": "small_sample_guardrail",
                    "category": cat,
                    "is_anomaly": True,
                    "zscore": round(float(mom_change), 2),
                    "direction": direction,
                    "confidence": "low",
                    "message": (
                        f"{cat.capitalize()} changed by {round(abs(mom_change) * 100, 1)}% from the previous month "
                        f"in {month}, which is unusually large for a short history."
                    ),
                })

        # Rule 2: Robust z-score against median and MAD
        median = float(np.median(values))
        mad = float(np.median(np.abs(values - median)))
        if mad <= 1e-9:
            continue

        robust_zscores = 0.6745 * (values - median) / mad
        for row, rz in zip(sorted_history, robust_zscores):
            if abs(float(rz)) >= robust_z_threshold:
                month = row["month"]
                key = (month, cat)
                if key in seen:
                    continue
                seen.add(key)
                direction = "spike" if rz > 0 else "drop"
                anomalies.append({
                    "month": month,
                    "method": "small_sample_guardrail",
                    "category": cat,
                    "is_anomaly": True,
                    "zscore": round(float(rz), 2),
                    "direction": direction,
                    "confidence": "low",
                    "message": (
                        f"{cat.capitalize()} in {month} is an outlier relative to recent months "
                        f"(robust score={round(float(rz), 2)})."
                    ),
                })

    return sorted(anomalies, key=lambda a: a["month"])
