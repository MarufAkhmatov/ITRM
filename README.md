# ITRM — IT Resource Management

Enterprise analytics platform for a commercial bank's IT infrastructure demand.
Ingests the **daily Jira Service Management export**, normalizes the messy
real-world data (Russian status / departments, free-text resource fields, Excel
date serials, lookalike Cyrillic letters), and surfaces:

- **Executive Dashboard** — total / open / closed / rejected requests, allocated
  CPU / RAM / Storage, fulfillment & rejection rates, resolution time, monthly
  trend, environment / status / type breakdowns, top departments.
- **Per-Request-Type Dashboards** — auto-generated from the data; one page per
  Jira Customer Request Type with its own KPIs, status funnel, environment mix,
  monthly volume, drillable issue table.
- **Department Analytics** — consumption ranking by requests / CPU / RAM /
  Storage, dept × month heatmap, top consumers.
- **Upload & ETL** — drag-and-drop, auto-format detection (.xls binary / .xlsx
  / .csv / html-disguised xls), live ingestion report, versioned uploads,
  one-click rollback.
- **AMIN** — IT Resource Copilot. Natural-language questions ("top
  departments by RAM", "forecast CPU next year") routed to deterministic data
  tools that compute REAL numbers from the active dataset.
- **Filters** — Year, Quarter, Month, Department, Environment, Request Type,
  Status, Priority — URL-driven, applied to every page.
- **Dark / Light** mode, 4K-friendly layout, XLSX / CSV / JSON export.

> Built on the proven shape of the ITSM-SLA reference repo
> (`MarufAkhmatov/ITSM-SLA`): React 18 + Vite 6 + Tailwind 4 + shadcn-style
> primitives + Recharts + react-router 7 on the frontend, FastAPI + openpyxl /
> xlrd / bs4 + file-storage with active-version pattern on the backend.

---

## Quick start (Windows / PowerShell)

```powershell
# 1. Install
python -m pip install -r backend/requirements.txt
npm install

# 2. Run both processes (separate terminals)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8077
npm run dev          # http://localhost:5173

# 3. Upload the daily Jira export at /upload
#    (drag the .xls or .xlsx file, the rest is automatic)
```

The included sample `data/samples/ITRM_260621_2100.xls` (451 rows, real bank
export) is enough to populate every dashboard end-to-end.

## Architecture

```
frontend (Vite/React 18/TS/Tailwind 4)  ──┐
                                          │  /api/*   (FastAPI 0.138)
backend  (FastAPI · openpyxl/xlrd/bs4)  ──┤
                                          │
file storage (active-version)             │
  storage/current/                        │   ← active dataset & report
  storage/archive/<upload_id>/            │   ← every historical upload
  storage/{uploads,capacity,cost_rates,mappings}.json
```

Postgres / Docker is an optional production target (see `database/schema.sql`,
`docker-compose.yml`).

## ETL pipeline

`upload → detect format → read → auto-map columns → normalize → dedupe by
issue_key → derive lead/cycle times → snapshot → set active → return report`

Normalization handles real-world dirt the source file actually has:
- `"Dоne"` (Cyrillic `о`) → `Done`; `Готово` → `Done`; `Отклонено` → `Rejected`.
- 62 raw department spellings (61% blank) → 50 canonicals, blank → `Unassigned`.
- Free-text RAM/CPU/Storage (`"8 GB"`, `"1 ТБ"`) → numeric GB / vCPU.
- Dates as Excel serials *or* `"dd.mm.yyyy HH:MM"` text.
- Environment inferred from Summary + Description keywords
  (`prod / тест / preprod / dr / uat / dev`).

## Modules and roadmap

- **MVP (this release)** — Ingestion, Executive, 9 request-type pages,
  Departments, Filters, Upload, Settings, Exports, Theming, AMIN deterministic.
- **Phase 2** — Capacity Registry & comparison, FinOps cost engine,
  Forecasting (linear + seasonal, best/expected/worst), Intelligent Alerts,
  AMIN LLM synthesis via local Claude Code CLI.
- **Phase 3** — What-If Simulation, Infrastructure Digital Twin, Resource
  Governance (zombie / aging / reclamation), CIO Command Center, Project
  Analytics, Executive Report Generator, full EDW dimensional model.

## Docs

- [docs/PRD.md](docs/PRD.md) — Product requirements & scope
- [docs/KPI_CATALOG.md](docs/KPI_CATALOG.md) — 100+ enterprise KPIs
- [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md) — Canonical fields & mappings
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — System diagram & decisions

## API

See `backend/main.py`. Key endpoints:

| Method | Path                              | Purpose                              |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/upload`                     | Upload Jira export (xls/xlsx/csv)   |
| GET    | `/api/uploads`                    | List historical uploads              |
| POST   | `/api/uploads/{id}/activate`      | Activate a prior upload (rollback)   |
| GET    | `/api/filters`                    | Distinct filter values for the UI    |
| GET    | `/api/kpis/executive`             | Executive dashboard payload          |
| GET    | `/api/kpis/request-type/{code}`   | Per-type dashboard                   |
| GET    | `/api/kpis/departments`           | Department analytics + heatmap       |
| POST   | `/api/amin/query`                 | AMIN copilot NL query                |
| GET    | `/api/export/{xlsx\|csv\|json}`   | Filtered export                      |
