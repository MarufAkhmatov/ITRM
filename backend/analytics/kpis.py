"""
KPI computation: Executive dashboard, per-request-type dashboard.
All numbers are computed against the filtered active dataset.
"""
from __future__ import annotations
from collections import Counter, defaultdict
from datetime import datetime
from statistics import mean

from .filters import apply_filters


def _dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", ""))
    except Exception:
        return None


def _sum(records, key):
    return round(sum((r.get(key) or 0) for r in records), 2)


def _avg(values):
    vals = [v for v in values if v is not None]
    return round(mean(vals), 2) if vals else None


def executive(records, f=None):
    rs = apply_filters(records, f)
    total = len(rs)
    closed = sum(1 for r in rs if r.get("status_group") == "closed")
    rejected = sum(1 for r in rs if r.get("status_group") == "rejected")
    open_ = sum(1 for r in rs if r.get("status_group") == "open")
    fulfilled = sum(1 for r in rs if r.get("status") == "Done")

    # Allocated resources = sum from closed/done rows (resource truly granted).
    granted = [r for r in rs if r.get("status_group") == "closed"]
    alloc_cpu = _sum(granted, "cpu_vcpu")
    alloc_ram = _sum(granted, "ram_gb")
    alloc_storage = _sum(granted, "storage_gb")

    # All-rows totals (demand)
    req_cpu = _sum(rs, "cpu_vcpu")
    req_ram = _sum(rs, "ram_gb")
    req_storage = _sum(rs, "storage_gb")

    # Top departments (by request count and by resources)
    dept_req = Counter()
    dept_cpu = defaultdict(float)
    dept_ram = defaultdict(float)
    dept_storage = defaultdict(float)
    for r in rs:
        d = r.get("department") or "Unassigned"
        dept_req[d] += 1
        dept_cpu[d] += r.get("cpu_vcpu") or 0
        dept_ram[d] += r.get("ram_gb") or 0
        dept_storage[d] += r.get("storage_gb") or 0

    def _topn(d, n=10):
        return [{"name": k, "value": round(v, 2)}
                for k, v in sorted(d.items(), key=lambda x: -x[1])[:n]]

    # Monthly trend (requests, cpu, ram, storage)
    monthly = defaultdict(lambda: {"requests": 0, "cpu": 0.0, "ram": 0.0, "storage": 0.0})
    for r in rs:
        d = _dt(r.get("created_at"))
        if not d:
            continue
        k = f"{d.year}-{d.month:02d}"
        b = monthly[k]
        b["requests"] += 1
        b["cpu"] += r.get("cpu_vcpu") or 0
        b["ram"] += r.get("ram_gb") or 0
        b["storage"] += r.get("storage_gb") or 0
    trend = [{"month": k, **{kk: round(vv, 2) for kk, vv in v.items()}}
             for k, v in sorted(monthly.items())]

    # Request type distribution
    rt_counts = Counter()
    rt_labels = {}
    for r in rs:
        c = r.get("request_type_code") or "other"
        rt_counts[c] += 1
        rt_labels[c] = r.get("request_type_label") or c
    by_request_type = [{"code": c, "label": rt_labels[c], "value": n}
                       for c, n in rt_counts.most_common()]

    # Environment distribution
    env_counts = Counter(r.get("environment") or "Unspecified" for r in rs)
    by_environment = [{"name": k, "value": v}
                      for k, v in env_counts.most_common()]

    # Status distribution
    status_counts = Counter(r.get("status") or "Unknown" for r in rs)
    by_status = [{"name": k, "value": v} for k, v in status_counts.most_common()]

    # Lead / cycle times
    avg_lead = _avg([r.get("lead_time_hours") for r in rs])
    avg_cycle = _avg([r.get("cycle_time_hours") for r in rs])

    return {
        "summary": {
            "total_requests": total,
            "open_requests": open_,
            "closed_requests": closed,
            "fulfilled_requests": fulfilled,
            "rejected_requests": rejected,
            "fulfillment_rate": round(fulfilled / total * 100, 1) if total else 0,
            "rejection_rate": round(rejected / total * 100, 1) if total else 0,
            "avg_lead_time_hours": avg_lead,
            "avg_cycle_time_hours": avg_cycle,
            "allocated_cpu_vcpu": alloc_cpu,
            "allocated_ram_gb": alloc_ram,
            "allocated_storage_gb": alloc_storage,
            "requested_cpu_vcpu": req_cpu,
            "requested_ram_gb": req_ram,
            "requested_storage_gb": req_storage,
        },
        "trend": trend,
        "top_departments_by_requests": _topn(dept_req),
        "top_departments_by_cpu": _topn(dept_cpu),
        "top_departments_by_ram": _topn(dept_ram),
        "top_departments_by_storage": _topn(dept_storage),
        "by_request_type": by_request_type,
        "by_environment": by_environment,
        "by_status": by_status,
    }


def request_type_dashboard(records, code, f=None):
    f = dict(f or {})
    f["request_type"] = code
    rs = apply_filters(records, f)
    total = len(rs)
    label = (rs[0]["request_type_label"] if rs else code)

    status_counts = Counter(r.get("status") or "Unknown" for r in rs)
    priority_counts = Counter(r.get("priority") or "Medium" for r in rs)
    env_counts = Counter(r.get("environment") or "Unspecified" for r in rs)
    dept_counts = Counter(r.get("department") or "Unassigned" for r in rs)

    monthly = defaultdict(int)
    for r in rs:
        d = _dt(r.get("created_at"))
        if d:
            monthly[f"{d.year}-{d.month:02d}"] += 1
    trend = [{"month": k, "requests": v} for k, v in sorted(monthly.items())]

    return {
        "code": code,
        "label": label,
        "summary": {
            "total": total,
            "open": sum(1 for r in rs if r.get("status_group") == "open"),
            "closed": sum(1 for r in rs if r.get("status_group") == "closed"),
            "rejected": sum(1 for r in rs if r.get("status_group") == "rejected"),
            "fulfillment_rate": round(
                sum(1 for r in rs if r.get("status") == "Done") / total * 100, 1
            ) if total else 0,
            "avg_lead_time_hours": _avg([r.get("lead_time_hours") for r in rs]),
            "avg_cycle_time_hours": _avg([r.get("cycle_time_hours") for r in rs]),
            "allocated_cpu_vcpu": _sum(
                [r for r in rs if r.get("status_group") == "closed"], "cpu_vcpu"),
            "allocated_ram_gb": _sum(
                [r for r in rs if r.get("status_group") == "closed"], "ram_gb"),
            "allocated_storage_gb": _sum(
                [r for r in rs if r.get("status_group") == "closed"], "storage_gb"),
        },
        "trend": trend,
        "by_status": [{"name": k, "value": v} for k, v in status_counts.most_common()],
        "by_priority": [{"name": k, "value": v} for k, v in priority_counts.most_common()],
        "by_environment": [{"name": k, "value": v} for k, v in env_counts.most_common()],
        "top_departments": [{"name": k, "value": v}
                            for k, v in dept_counts.most_common(10)],
        "rows": rs[:500],
    }


def departments_analytics(records, f=None):
    rs = apply_filters(records, f)
    bucket = defaultdict(lambda: {"requests": 0, "cpu": 0.0, "ram": 0.0,
                                   "storage": 0.0, "envs": Counter(),
                                   "types": Counter()})
    monthly = defaultdict(lambda: defaultdict(int))  # dept -> month -> count

    for r in rs:
        d = r.get("department") or "Unassigned"
        b = bucket[d]
        b["requests"] += 1
        b["cpu"] += r.get("cpu_vcpu") or 0
        b["ram"] += r.get("ram_gb") or 0
        b["storage"] += r.get("storage_gb") or 0
        b["envs"][r.get("environment") or "Unspecified"] += 1
        b["types"][r.get("request_type_label") or "Other"] += 1
        dt = _dt(r.get("created_at"))
        if dt:
            monthly[d][f"{dt.year}-{dt.month:02d}"] += 1

    rows = []
    for d, b in bucket.items():
        months = monthly[d]
        rows.append({
            "department": d,
            "requests": b["requests"],
            "cpu_vcpu": round(b["cpu"], 2),
            "ram_gb": round(b["ram"], 2),
            "storage_gb": round(b["storage"], 2),
            "top_env": (b["envs"].most_common(1) or [("Unspecified", 0)])[0][0],
            "top_request_type": (b["types"].most_common(1) or [("Other", 0)])[0][0],
            "monthly": [{"month": m, "requests": c}
                        for m, c in sorted(months.items())],
        })
    rows.sort(key=lambda x: -x["requests"])

    # Heatmap data: dept x month (top 15 departments only)
    top = [r["department"] for r in rows[:15]]
    all_months = sorted({m for d in top for m in monthly[d].keys()})
    heatmap = []
    for d in top:
        for m in all_months:
            heatmap.append({"department": d, "month": m,
                            "value": monthly[d].get(m, 0)})

    return {"rows": rows, "heatmap": heatmap, "months": all_months,
            "top_departments": top}
