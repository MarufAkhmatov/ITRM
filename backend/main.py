"""ITRM FastAPI backend."""
from __future__ import annotations
import io

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from .ingest.pipeline import ingest_bytes
from .storage import file_store as store
from .analytics import kpis as K
from .analytics.filters import apply_filters, distinct_values
from .amir.amir import answer as amir_answer

app = FastAPI(title="ITRM API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=False,
    allow_methods=["*"], allow_headers=["*"],
)


def _filters(year, quarter, month, department, environment, request_type,
             status, server_type, priority):
    return {
        "year": year, "quarter": quarter, "month": month,
        "department": department, "environment": environment,
        "request_type": request_type, "status": status,
        "server_type": server_type, "priority": priority,
    }


def _active():
    rs, _ = store.get_active()
    return rs


@app.get("/api/health")
def health():
    rs, rp = store.get_active()
    return {"status": "ok", "records": len(rs),
            "active_upload": rp.get("filename") if rp else None}


# --- uploads --------------------------------------------------------------
@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Empty file")
    try:
        records, report, quarantine = ingest_bytes(raw, file.filename or "")
    except Exception as e:
        raise HTTPException(400, f"Ingestion failed: {e}")
    ext = "." + (file.filename or "file").rsplit(".", 1)[-1].lower() \
        if "." in (file.filename or "") else ".bin"
    upload_id = store.save_upload(file.filename or "upload", raw, ext,
                                  records, report, quarantine)
    return {"upload_id": upload_id, "report": report}


@app.get("/api/uploads")
def uploads():
    return store.list_uploads()


@app.post("/api/uploads/{upload_id}/activate")
def activate(upload_id: str):
    ok = store.activate_upload(upload_id)
    if not ok:
        raise HTTPException(404, "Upload not found")
    return {"ok": True}


# --- raw requests / filters ------------------------------------------------
@app.get("/api/filters")
def filters_info():
    return distinct_values(_active())


@app.get("/api/requests")
def requests(
    year: int | None = None, quarter: int | None = None, month: int | None = None,
    department: str | None = None, environment: str | None = None,
    request_type: str | None = None, status: str | None = None,
    server_type: str | None = None, priority: str | None = None,
    limit: int = 500, offset: int = 0,
):
    f = _filters(year, quarter, month, department, environment,
                 request_type, status, server_type, priority)
    rs = apply_filters(_active(), f)
    return {"total": len(rs), "rows": rs[offset: offset + limit]}


# --- KPIs ------------------------------------------------------------------
@app.get("/api/kpis/executive")
def kpi_executive(
    year: int | None = None, quarter: int | None = None, month: int | None = None,
    department: str | None = None, environment: str | None = None,
    request_type: str | None = None, status: str | None = None,
    server_type: str | None = None, priority: str | None = None,
):
    f = _filters(year, quarter, month, department, environment,
                 request_type, status, server_type, priority)
    return K.executive(_active(), f)


@app.get("/api/kpis/request-type/{code}")
def kpi_request_type(
    code: str,
    year: int | None = None, quarter: int | None = None, month: int | None = None,
    department: str | None = None, environment: str | None = None,
    status: str | None = None, server_type: str | None = None,
    priority: str | None = None,
):
    f = _filters(year, quarter, month, department, environment,
                 None, status, server_type, priority)
    return K.request_type_dashboard(_active(), code, f)


@app.get("/api/kpis/departments")
def kpi_departments(
    year: int | None = None, quarter: int | None = None, month: int | None = None,
    environment: str | None = None, request_type: str | None = None,
    status: str | None = None, server_type: str | None = None,
    priority: str | None = None,
):
    f = _filters(year, quarter, month, None, environment,
                 request_type, status, server_type, priority)
    return K.departments_analytics(_active(), f)


# --- capacity registry -----------------------------------------------------
@app.get("/api/capacity")
def get_capacity():
    return store.get_capacity()


@app.put("/api/capacity")
def put_capacity(rows: list):
    store.save_capacity(rows)
    return {"ok": True, "count": len(rows)}


# --- cost rates ------------------------------------------------------------
@app.get("/api/cost-rates")
def get_cost():
    return store.get_cost_rates()


@app.put("/api/cost-rates")
def put_cost(rates: dict):
    store.save_cost_rates(rates)
    return rates


# --- AMIR ------------------------------------------------------------------
@app.post("/api/amir/query")
def amir_query(payload: dict):
    q = (payload or {}).get("query", "")
    return amir_answer(_active(), q)


# Backwards-compatible alias for older /api/amin clients.
@app.post("/api/amin/query")
def amin_query_alias(payload: dict):
    return amir_query(payload)


# --- exports ---------------------------------------------------------------
@app.get("/api/export/{kind}")
def export(kind: str,
           year: int | None = None, quarter: int | None = None,
           month: int | None = None, department: str | None = None,
           environment: str | None = None, request_type: str | None = None,
           status: str | None = None, server_type: str | None = None,
           priority: str | None = None):
    f = _filters(year, quarter, month, department, environment,
                 request_type, status, server_type, priority)
    rs = apply_filters(_active(), f)
    if kind == "json":
        return rs
    if kind == "csv":
        import csv
        if not rs:
            return StreamingResponse(io.BytesIO(b""), media_type="text/csv")
        fields = list(rs[0].keys())
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for r in rs:
            row = {k: (";".join(v) if isinstance(v, list) else v)
                   for k, v in r.items()}
            w.writerow(row)
        return StreamingResponse(
            io.BytesIO(buf.getvalue().encode("utf-8-sig")),
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="itrm.csv"'})
    if kind == "xlsx":
        from openpyxl import Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = "ITRM"
        if rs:
            fields = list(rs[0].keys())
            ws.append(fields)
            for r in rs:
                ws.append([(";".join(v) if isinstance(v, list) else v)
                           for v in (r.get(k) for k in fields)])
        out = io.BytesIO()
        wb.save(out)
        out.seek(0)
        return StreamingResponse(
            out,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="itrm.xlsx"'})
    raise HTTPException(400, "Unknown export kind")
