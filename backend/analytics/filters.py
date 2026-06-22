"""
Shared filter logic. All KPI endpoints accept the same filter set.
"""
from __future__ import annotations
from datetime import datetime


def _to_dt(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", ""))
    except Exception:
        return None


def apply_filters(records, f):
    f = f or {}
    year = f.get("year")
    quarter = f.get("quarter")
    month = f.get("month")
    dept = f.get("department")
    env = f.get("environment")
    rtype = f.get("request_type")
    status = f.get("status")
    server_type = f.get("server_type")
    priority = f.get("priority")

    out = []
    for r in records:
        d = _to_dt(r.get("created_at"))
        if year and (not d or d.year != int(year)):
            continue
        if quarter and (not d or ((d.month - 1) // 3 + 1) != int(quarter)):
            continue
        if month and (not d or d.month != int(month)):
            continue
        if dept and r.get("department") != dept:
            continue
        if env and r.get("environment") != env:
            continue
        if rtype and r.get("request_type_code") != rtype:
            continue
        if status and r.get("status") != status:
            continue
        if priority and r.get("priority") != priority:
            continue
        if server_type:
            if server_type not in (r.get("server_types") or []):
                continue
        out.append(r)
    return out


def distinct_values(records):
    """Return sorted distinct filter values for the FilterBar dropdowns."""
    years, depts, envs, rtypes, rtype_labels, statuses, server_types, priorities = (
        set(), set(), set(), {}, {}, set(), set(), set()
    )
    for r in records:
        d = _to_dt(r.get("created_at"))
        if d:
            years.add(d.year)
        if r.get("department"):
            depts.add(r["department"])
        if r.get("environment"):
            envs.add(r["environment"])
        if r.get("request_type_code"):
            rtypes[r["request_type_code"]] = r.get("request_type_label") or r["request_type_code"]
        if r.get("status"):
            statuses.add(r["status"])
        for s in (r.get("server_types") or []):
            server_types.add(s)
        if r.get("priority"):
            priorities.add(r["priority"])
    return {
        "years": sorted(years, reverse=True),
        "quarters": [1, 2, 3, 4],
        "months": list(range(1, 13)),
        "departments": sorted(depts),
        "environments": sorted(envs),
        "request_types": [{"code": c, "label": rtype_labels.get(c, l)}
                          for c, l in sorted(rtypes.items(), key=lambda x: x[1])],
        "statuses": sorted(statuses),
        "server_types": sorted(server_types),
        "priorities": sorted(priorities),
    }
