"""
Row-level normalization: raw Jira row -> canonical ITRM request record.

Handles the messy realities of the export:
  - resource fields are free text ("8 GB", "16 ГБ", "4 vCPU", "1 TB")
  - dates are EITHER Excel serial floats OR "dd.mm.yyyy HH:MM" text
  - environment is absent (inferred)
  - status / department / request-type / server-type via mappings.py
"""
from __future__ import annotations
import re
from datetime import datetime, timedelta

from . import mappings as M

# Canonical header -> list of accepted source headers (folded contains-match).
# Drives column auto-mapping; admin overrides can extend this in storage.
COLUMN_ALIASES = {
    "priority":   ["приоритет", "priority"],
    "issue_key":  ["код", "key", "issue key", "ключ"],
    "request_type": ["customer request type", "тип запроса", "request type"],
    "summary":    ["тема", "summary", "краткое описание"],
    "assignee":   ["исполнитель", "assignee"],
    "status_raw": ["статус", "status"],
    "created_at": ["создано", "created", "дата создания"],
    "resolved_at": ["дата решения", "resolved", "resolution date"],
    "first_in_progress_at": ["первый переход в в работе", "first in progress"],
    "last_done_at": ["последний переход в выполнено", "last done"],
    "ram_raw":    ["оперативная память", "ram", "память"],
    "cpu_raw":    ["процессор", "cpu", "vcpu"],
    "os":         ["операционная система", "os", "операционная"],
    "storage_raw": ["хранилище", "storage"],
    "disk_size_raw": ["размер диска", "disk", "диск"],
    "server_type_raw": ["тип сервера", "server type"],
    "internet_needed": ["интернет", "internet"],
    "department_raw": ["подразделение", "department", "отдел"],
    "description": ["описание", "description"],
}

EXCEL_EPOCH = datetime(1899, 12, 30)  # Excel's day 0 (accounts for 1900 leap bug)


def build_column_index(headers):
    """Map canonical field -> source column index using COLUMN_ALIASES.
    Both header and alias are run through fold() so Cyrillic/Latin
    lookalikes and unmapped characters collapse the same way."""
    folded = [M.fold(h) for h in headers]
    index = {}
    for canon, aliases in COLUMN_ALIASES.items():
        folded_aliases = [M.fold(a) for a in aliases]
        for i, h in enumerate(folded):
            if any(fa and fa in h for fa in folded_aliases):
                index[canon] = i
                break
    return index


def _get(row, idx, field):
    i = idx.get(field)
    if i is None or i >= len(row):
        return None
    v = row[i]
    if isinstance(v, str):
        v = v.strip()
    return v if v != "" else None


# --- numeric resource parsing ----------------------------------------------
_NUM = re.compile(r"(\d+[.,]?\d*)")


def _to_gb(raw, default_unit="gb"):
    """Parse free-text size to GB. Understands GB/ГБ/TB/ТБ/MB/МБ."""
    if raw is None:
        return None
    s = str(raw).lower()
    m = _NUM.search(s)
    if not m:
        return None
    num = float(m.group(1).replace(",", "."))
    if "tb" in s or "тб" in s or "tib" in s:
        return round(num * 1024, 2)
    if "mb" in s or "мб" in s:
        return round(num / 1024, 4)
    return round(num, 2)


def _to_vcpu(raw):
    if raw is None:
        return None
    m = _NUM.search(str(raw))
    if not m:
        return None
    return round(float(m.group(1).replace(",", ".")), 2)


# --- date parsing -----------------------------------------------------------
def _parse_date(raw):
    if raw is None or raw == "":
        return None
    # Excel serial
    if isinstance(raw, (int, float)) and not isinstance(raw, bool):
        try:
            return (EXCEL_EPOCH + timedelta(days=float(raw))).isoformat()
        except Exception:
            return None
    s = str(raw).strip()
    if not s:
        return None
    # numeric string -> serial
    if re.fullmatch(r"\d+(\.\d+)?", s):
        try:
            return (EXCEL_EPOCH + timedelta(days=float(s))).isoformat()
        except Exception:
            pass
    for fmt in ("%d.%m.%Y %H:%M", "%d.%m.%Y", "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y %H:%M", "%d/%m/%Y"):
        try:
            return datetime.strptime(s, fmt).isoformat()
        except ValueError:
            continue
    return None


def _hours_between(a, b):
    if not a or not b:
        return None
    try:
        d = datetime.fromisoformat(b) - datetime.fromisoformat(a)
        h = d.total_seconds() / 3600.0
        return round(h, 2) if h >= 0 else None
    except Exception:
        return None


def normalize_row(row, idx):
    issue_key = _get(row, idx, "issue_key")
    if not issue_key:
        return None, "missing_issue_key"

    summary = _get(row, idx, "summary")
    description = _get(row, idx, "description")

    status_canon, status_group = M.map_status(_get(row, idx, "status_raw"))
    rt_code, rt_label, rt_raw = M.map_request_type(_get(row, idx, "request_type"))

    created = _parse_date(_get(row, idx, "created_at"))
    resolved = _parse_date(_get(row, idx, "resolved_at"))
    first_ip = _parse_date(_get(row, idx, "first_in_progress_at"))
    last_done = _parse_date(_get(row, idx, "last_done_at"))

    storage_gb = _to_gb(_get(row, idx, "storage_raw"))
    if storage_gb is None:
        storage_gb = _to_gb(_get(row, idx, "disk_size_raw"))

    internet = _get(row, idx, "internet_needed")
    internet_val = None
    if internet is not None:
        internet_val = M.fold(internet) in ("da", "yes", "true", "1")

    rec = {
        "issue_key": str(issue_key).strip(),
        "request_type_code": rt_code,
        "request_type_label": rt_label,
        "request_type_raw": rt_raw,
        "priority": M.map_priority(_get(row, idx, "priority")),
        "status": status_canon,
        "status_group": status_group,
        "assignee": _get(row, idx, "assignee"),
        "department": M.map_department(_get(row, idx, "department_raw")),
        "department_raw": _get(row, idx, "department_raw"),
        "environment": M.infer_environment(summary, description),
        "server_types": M.map_server_types(_get(row, idx, "server_type_raw")),
        "os": _get(row, idx, "os"),
        "internet_needed": internet_val,
        "ram_gb": _to_gb(_get(row, idx, "ram_raw")),
        "cpu_vcpu": _to_vcpu(_get(row, idx, "cpu_raw")),
        "storage_gb": storage_gb,
        "created_at": created,
        "resolved_at": resolved,
        "first_in_progress_at": first_ip,
        "last_done_at": last_done,
        "lead_time_hours": _hours_between(created, resolved),
        "cycle_time_hours": _hours_between(first_ip, last_done),
        "summary": summary,
        "description": description,
    }
    return rec, None
