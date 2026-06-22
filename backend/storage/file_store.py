"""
File-based storage with the active-version pattern.

Layout (under STORAGE_ROOT):
  current/
    dataset.json         <- active normalized records
    report.json          <- ingestion report of active upload
  archive/
    <upload_id>/
      raw.<ext>          <- original uploaded bytes
      dataset.json
      report.json
  uploads.json           <- list of all uploads (history)
  capacity.json          <- manual capacity registry rows
  cost_rates.json        <- FinOps unit rates
  mappings.json          <- admin overrides for field/value mappings
"""
from __future__ import annotations
import json
import os
import time
from pathlib import Path
from typing import Any

STORAGE_ROOT = Path(os.environ.get("ITRM_STORAGE",
                    Path(__file__).resolve().parents[2] / "storage"))


def _ensure():
    (STORAGE_ROOT / "current").mkdir(parents=True, exist_ok=True)
    (STORAGE_ROOT / "archive").mkdir(parents=True, exist_ok=True)


def _read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def _write_json(path: Path, value: Any):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2,
                               default=str), encoding="utf-8")


def list_uploads():
    _ensure()
    return _read_json(STORAGE_ROOT / "uploads.json", [])


def get_active():
    _ensure()
    records = _read_json(STORAGE_ROOT / "current" / "dataset.json", [])
    report = _read_json(STORAGE_ROOT / "current" / "report.json", {})
    return records, report


def save_upload(filename: str, raw_bytes: bytes, ext: str,
                records, report, quarantine):
    _ensure()
    upload_id = f"u_{int(time.time()*1000)}"
    arc = STORAGE_ROOT / "archive" / upload_id
    arc.mkdir(parents=True, exist_ok=True)
    (arc / f"raw{ext}").write_bytes(raw_bytes)
    _write_json(arc / "dataset.json", records)
    _write_json(arc / "report.json", report)
    _write_json(arc / "quarantine.json", quarantine)

    _write_json(STORAGE_ROOT / "current" / "dataset.json", records)
    _write_json(STORAGE_ROOT / "current" / "report.json", report)

    history = list_uploads()
    for h in history:
        h["is_active"] = False
    history.append({
        "upload_id": upload_id,
        "filename": filename,
        "format": report.get("format"),
        "rows_valid": report.get("rows_valid"),
        "rows_quarantined": report.get("rows_quarantined"),
        "uploaded_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "is_active": True,
    })
    _write_json(STORAGE_ROOT / "uploads.json", history)
    return upload_id


def activate_upload(upload_id: str) -> bool:
    arc = STORAGE_ROOT / "archive" / upload_id
    if not arc.exists():
        return False
    ds = _read_json(arc / "dataset.json", None)
    rp = _read_json(arc / "report.json", None)
    if ds is None or rp is None:
        return False
    _write_json(STORAGE_ROOT / "current" / "dataset.json", ds)
    _write_json(STORAGE_ROOT / "current" / "report.json", rp)
    history = list_uploads()
    for h in history:
        h["is_active"] = (h["upload_id"] == upload_id)
    _write_json(STORAGE_ROOT / "uploads.json", history)
    return True


# --- capacity registry -----------------------------------------------------
def get_capacity():
    return _read_json(STORAGE_ROOT / "capacity.json", [])


def save_capacity(rows):
    _write_json(STORAGE_ROOT / "capacity.json", rows)


# --- cost rates ------------------------------------------------------------
DEFAULT_COST_RATES = {
    # USD per unit per month (illustrative — admin can override in UI)
    "cpu_per_vcpu_month": 8.0,
    "ram_per_gb_month": 4.0,
    "storage_per_gb_month": 0.10,
    "env_multiplier": {"PROD": 1.5, "PREPROD": 1.2, "UAT": 1.0,
                       "TEST": 0.8, "DEV": 0.6, "DR": 1.3,
                       "Unspecified": 1.0},
}


def get_cost_rates():
    rates = _read_json(STORAGE_ROOT / "cost_rates.json", None)
    return rates or DEFAULT_COST_RATES


def save_cost_rates(rates):
    _write_json(STORAGE_ROOT / "cost_rates.json", rates)


# --- mapping overrides -----------------------------------------------------
def get_mappings():
    return _read_json(STORAGE_ROOT / "mappings.json", {})


def save_mappings(mp):
    _write_json(STORAGE_ROOT / "mappings.json", mp)
