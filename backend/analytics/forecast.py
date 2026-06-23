"""
Deterministic monthly demand forecaster for AMIR's two demo intents.

Inputs:
  records  — the active normalized request dataset
  horizon  — "rest_2026" (project Jul..Dec 2026) | "y2027" (project Jan..Dec 2027)

Method:
  1. Aggregate `cpu_vcpu`, `ram_gb`, `storage_gb` into monthly sums keyed by
     `created_at`'s YYYY-MM.
  2. Fit a simple linear regression (least squares) on the last min(N, 12)
     observed months; this protects against earlier sparse months.
  3. Project months for the requested horizon. For each projected month emit
     `expected`, plus a `best`/`worst` band derived from the residual std.
        best  = max(0, expected - 0.5*sigma)
        worst =          expected + 1.0*sigma   (skew toward conservative planning)
  4. Sum totals over the horizon.

All numbers are computed in code; AMIR's NL layer only formats them.
"""
from __future__ import annotations
from collections import defaultdict
from datetime import datetime
from math import sqrt
from statistics import mean


def _dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(str(s).replace("Z", ""))
    except Exception:
        return None


def _monthly_series(records, field):
    bucket = defaultdict(float)
    for r in records:
        d = _dt(r.get("created_at"))
        if not d:
            continue
        bucket[f"{d.year}-{d.month:02d}"] += float(r.get(field) or 0)
    return [{"month": k, "value": round(v, 2)} for k, v in sorted(bucket.items())]


def _linreg(ys):
    """Plain least-squares on x=0..N-1. Returns (a, b, sigma)."""
    n = len(ys)
    if n < 2:
        return 0.0, (ys[0] if ys else 0.0), 0.0
    xs = list(range(n))
    mx, my = mean(xs), mean(ys)
    num = sum((xs[i] - mx) * (ys[i] - my) for i in range(n))
    den = sum((xs[i] - mx) ** 2 for i in range(n)) or 1.0
    a = num / den
    b = my - a * mx
    resid = [ys[i] - (a * xs[i] + b) for i in range(n)]
    sigma = sqrt(sum(r * r for r in resid) / max(1, n - 1))
    return a, b, sigma


def _months_for_horizon(horizon):
    if horizon == "rest_2026":
        return [f"2026-{m:02d}" for m in range(7, 13)]
    if horizon == "y2027":
        return [f"2027-{m:02d}" for m in range(1, 13)]
    return []


def _project(series, horizon):
    """
    Given monthly history, project the horizon months.

    Strategy (chosen for stability on a tiny bank dataset with one-off spikes):
      * baseline = mean of the last 6 months — robust to skew
      * trend    = mean of the last 12 months' linreg slope, clamped >= 0
                   (capacity demand in a growing bank rarely shrinks)
      * sigma    = std of the last 6 months — controls the best/worst band
    """
    last6   = series[-6:]  if len(series) >= 1 else series
    last12  = series[-12:] if len(series) >= 1 else series
    ys6     = [h["value"] for h in last6]
    ys12    = [h["value"] for h in last12]

    baseline = mean(ys6) if ys6 else 0.0
    _, _, sigma = _linreg(ys6) if len(ys6) >= 2 else (0.0, baseline, 0.0)
    slope, _, _ = _linreg(ys12) if len(ys12) >= 2 else (0.0, 0.0, 0.0)
    slope = max(0.0, slope)  # never project shrinkage

    months = _months_for_horizon(horizon)
    monthly = []
    sum_e = sum_b = sum_w = 0.0
    for i, _m in enumerate(months):
        expected = max(0.0, baseline + slope * (i + 1))
        best  = max(0.0, expected - 0.6 * sigma)
        worst =          expected + 1.2 * sigma
        sum_e += expected; sum_b += best; sum_w += worst
        monthly.append({
            "month": months[i],
            "expected": round(expected, 2),
            "best":     round(best, 2),
            "worst":    round(worst, 2),
        })
    return {
        "monthly": monthly,
        "total": {
            "expected": round(sum_e, 2),
            "best":     round(sum_b, 2),
            "worst":    round(sum_w, 2),
        },
        "history": series,
        "trained_months": len(last12),
    }


HORIZON_LABELS = {
    "rest_2026": {"en": "Forecast — rest of 2026 (Jul-Dec)",
                  "ru": "Прогноз — до конца 2026 (июль-декабрь)",
                  "uz": "Prognoz — 2026 yil yakuniga qadar (iyul-dekabr)"},
    "y2027":     {"en": "Forecast — full 2027",
                  "ru": "Прогноз — весь 2027 год",
                  "uz": "Prognoz — toʻliq 2027 yil"},
}


def forecast_resources(records, horizon: str, lang: str = "en") -> dict:
    if horizon not in ("rest_2026", "y2027"):
        raise ValueError(f"unknown horizon {horizon}")

    cpu = _monthly_series(records, "cpu_vcpu")
    ram = _monthly_series(records, "ram_gb")
    storage = _monthly_series(records, "storage_gb")

    trained_from = min((s[0]["month"] for s in (cpu, ram, storage) if s), default=None)
    trained_to   = max((s[-1]["month"] for s in (cpu, ram, storage) if s), default=None)

    cpu_p = _project(cpu, horizon)
    ram_p = _project(ram, horizon)
    sto_p = _project(storage, horizon)

    return {
        "horizon": horizon,
        "horizon_label": HORIZON_LABELS[horizon].get(lang, HORIZON_LABELS[horizon]["en"]),
        "trained_on": {
            "from": trained_from, "to": trained_to,
            "months": cpu_p["trained_months"],
        },
        "resources": {
            "cpu":     {"unit": "vCPU", **cpu_p},
            "ram":     {"unit": "GB",   **ram_p},
            "storage": {"unit": "GB",   **sto_p},
        },
    }
