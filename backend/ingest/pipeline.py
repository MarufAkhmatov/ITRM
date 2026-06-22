"""
End-to-end ingestion: bytes -> normalized records + ingestion report.
"""
from __future__ import annotations
from collections import Counter

from .reader import read_table
from .normalize import build_column_index, normalize_row


def ingest_bytes(data: bytes, filename: str = ""):
    fmt, headers, rows = read_table(data, filename)
    idx = build_column_index(headers)

    records, quarantine = [], []
    seen_keys = {}
    dept_seen, req_types_seen, status_seen = Counter(), Counter(), Counter()
    unmapped = {"request_type": set(), "department": set(), "status": set()}

    for raw_row in rows:
        if not raw_row or all((c is None or str(c).strip() == "") for c in raw_row):
            continue
        rec, err = normalize_row(raw_row, idx)
        if err:
            quarantine.append({"reason": err, "raw": raw_row})
            continue
        # last-wins dedupe by issue_key (keeps newest entry in the file)
        seen_keys[rec["issue_key"]] = rec

        dept_seen[rec["department"]] += 1
        req_types_seen[rec["request_type_code"]] += 1
        status_seen[rec["status"]] += 1
        if rec["request_type_code"] == "other" and rec["request_type_raw"]:
            unmapped["request_type"].add(rec["request_type_raw"])
        if rec["status"] == "Unknown":
            unmapped["status"].add(str(rec.get("status_group") or ""))

    records = list(seen_keys.values())

    report = {
        "format": fmt,
        "filename": filename,
        "headers_detected": headers,
        "columns_mapped": {k: headers[v] if v < len(headers) else None
                           for k, v in idx.items()},
        "columns_unmapped": [h for i, h in enumerate(headers)
                             if i not in set(idx.values())],
        "rows_in_file": len(rows),
        "rows_valid": len(records),
        "rows_quarantined": len(quarantine),
        "distinct_request_types": len(req_types_seen),
        "request_type_counts": dict(req_types_seen),
        "status_counts": dict(status_seen),
        "department_count": len(dept_seen),
        "top_departments": dict(dept_seen.most_common(15)),
        "unmapped_samples": {k: sorted(list(v))[:20] for k, v in unmapped.items()},
    }
    return records, report, quarantine
