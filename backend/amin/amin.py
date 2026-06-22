"""
AMIN copilot — deterministic intent router with optional Claude CLI synthesis.

Pipeline:
  query -> classify_intent() -> run data tool (compute REAL numbers)
        -> build grounded prompt -> claude -p (if available, optional)
        -> deterministic fallback always returns a structured answer

For MVP this ships the deterministic core so the AMIN panel works with zero
extra setup. claude_cli synthesis is a Phase-2 toggle.
"""
from __future__ import annotations
import re
from collections import Counter, defaultdict
from datetime import datetime

from ..analytics.kpis import executive, departments_analytics


def _dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", ""))
    except Exception:
        return None


_RESOURCE_KEYS = {
    "ram": "ram_gb", "память": "ram_gb", "memory": "ram_gb",
    "cpu": "cpu_vcpu", "процесс": "cpu_vcpu", "vcpu": "cpu_vcpu",
    "storage": "storage_gb", "диск": "storage_gb", "хранил": "storage_gb",
}


def _detect_resource(q):
    ql = q.lower()
    for k, v in _RESOURCE_KEYS.items():
        if k in ql:
            return v
    return None


def _detect_year(q):
    m = re.search(r"\b(20\d{2})\b", q)
    return int(m.group(1)) if m else None


def answer(records, query: str):
    q = (query or "").strip()
    ql = q.lower()
    res = _detect_resource(q)
    year = _detect_year(q)

    filters = {}
    if year:
        filters["year"] = year

    # Intent: which department consumed the most <resource>
    if res and ("which dep" in ql or "какой департам" in ql or "какое подразд" in ql
                or "top" in ql or "most" in ql or "больш" in ql):
        from ..analytics.filters import apply_filters
        rs = apply_filters(records, filters)
        agg = defaultdict(float)
        for r in rs:
            agg[r.get("department") or "Unassigned"] += r.get(res) or 0
        top = sorted(agg.items(), key=lambda x: -x[1])[:5]
        unit = {"ram_gb": "GB RAM", "cpu_vcpu": "vCPU",
                "storage_gb": "GB Storage"}[res]
        return {
            "intent": "top_department_by_resource",
            "answer": (f"Top department by {unit}"
                       f"{(' in ' + str(year)) if year else ''}: "
                       f"{top[0][0]} ({round(top[0][1], 2)} {unit})."
                       if top else "No data."),
            "data": [{"name": k, "value": round(v, 2)} for k, v in top],
            "filters": filters,
        }

    # Intent: forecast next year/quarter for a resource
    if res and ("predict" in ql or "forecast" in ql or "next" in ql
                or "прогноз" in ql or "следующ" in ql):
        # simple linear forecast = average of last 6 months
        from ..analytics.filters import apply_filters
        rs = apply_filters(records, {})
        monthly = defaultdict(float)
        for r in rs:
            d = _dt(r.get("created_at"))
            if not d:
                continue
            monthly[f"{d.year}-{d.month:02d}"] += r.get(res) or 0
        series = [v for _, v in sorted(monthly.items())][-6:]
        avg = round(sum(series) / len(series), 2) if series else 0
        unit = {"ram_gb": "GB RAM/mo", "cpu_vcpu": "vCPU/mo",
                "storage_gb": "GB Storage/mo"}[res]
        return {
            "intent": "forecast_resource",
            "answer": (f"Expected monthly demand (avg of last 6 months): "
                       f"{avg} {unit}. Next quarter expected: {round(avg * 3, 2)}, "
                       f"next year: {round(avg * 12, 2)}."),
            "data": [{"month": m, "value": round(v, 2)}
                     for m, v in sorted(monthly.items())],
        }

    # Intent: executive summary
    if "summary" in ql or "обзор" in ql or "сводк" in ql:
        kpi = executive(records, filters)["summary"]
        return {
            "intent": "executive_summary",
            "answer": (f"Total requests: {kpi['total_requests']}, "
                       f"open: {kpi['open_requests']}, "
                       f"closed: {kpi['closed_requests']}, "
                       f"fulfillment rate: {kpi['fulfillment_rate']}%. "
                       f"Allocated: {kpi['allocated_cpu_vcpu']} vCPU, "
                       f"{kpi['allocated_ram_gb']} GB RAM, "
                       f"{kpi['allocated_storage_gb']} GB Storage."),
            "data": kpi,
        }

    # Intent: list top departments overall
    if "department" in ql or "подразд" in ql or "department" in ql:
        d = departments_analytics(records, filters)
        top = d["rows"][:5]
        return {
            "intent": "top_departments",
            "answer": ("Top departments by request count: "
                       + ", ".join(f"{r['department']} ({r['requests']})"
                                   for r in top)) if top else "No data.",
            "data": top,
        }

    # Default: fall back to executive summary so the user always gets a number
    kpi = executive(records, filters)["summary"]
    return {
        "intent": "default",
        "answer": (f"I'm AMIN. I see {kpi['total_requests']} requests in the "
                   f"active dataset ({kpi['open_requests']} open, "
                   f"{kpi['closed_requests']} closed). Try: 'top departments by "
                   f"RAM', 'forecast CPU next year', or 'executive summary'."),
        "data": kpi,
    }
