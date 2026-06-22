# ITRM Architecture

## System diagram (textual)

```
┌──────────────────────────┐     HTTP /api/*    ┌────────────────────────────┐
│   Vite/React 18 frontend │  ────────────────► │   FastAPI backend (0.138)  │
│   Tailwind 4 · Recharts  │ ◄──────────────────│   Python 3.14              │
│   Sidebar / FilterBar    │                    │                            │
│   KPI cards · Heatmaps   │                    │   ingest/  (reader,        │
│   AMIR panel             │                    │     normalize, mappings,   │
└──────────────────────────┘                    │     pipeline)              │
                                                │   analytics/ (kpis,        │
                                                │     departments, filters)  │
                                                │   amir/ (intent router)    │
                                                │   storage/ (file_store)    │
                                                └─────────────┬──────────────┘
                                                              │
                                                  ┌───────────▼───────────┐
                                                  │  ./storage/           │
                                                  │   current/dataset.json│  ← active
                                                  │   archive/<id>/...    │  ← every upload
                                                  │   uploads.json        │  ← history
                                                  │   capacity.json       │  ← admin entries
                                                  │   cost_rates.json     │  ← FinOps
                                                  │   mappings.json       │  ← admin overrides
                                                  └───────────────────────┘

                   (Optional production target — Phase 2)
                                                  ┌───────────────────────┐
                                                  │  Postgres 16          │
                                                  │  database/schema.sql  │
                                                  │  identical model      │
                                                  └───────────────────────┘
```

## Key design decisions
1. **File storage by default** — single-binary install on Windows. Same
   logical model maps to Postgres; swap `storage/file_store.py` for a
   SQLAlchemy repository to scale out without touching analytics.
2. **Active-version upload pattern** — every upload is archived; current
   active dataset is a snapshot. Rollback is one click.
3. **Dynamic, data-driven request-type pages** — sidebar reads
   `/api/filters` and generates one nav entry per request-type code found
   in the data; no hardcoded type list.
4. **Cyrillic-safe folding** — full Russian → ASCII transliteration so
   mapping dictionaries collapse status `"Dоne"` (Cyrillic `о`), `"Готово"`,
   `"Финуправление"` vs `"Финансовое управление"`, etc.
5. **AMIR computes numbers in code, NL synthesis is optional** — the
   deterministic intent router always returns real metrics. The local
   Claude Code CLI synthesis is a Phase 2 toggle that *phrases* those
   numbers; it never sources them.
6. **No external network calls in MVP** — bank-safe, fully local.

## Folder layout
```
backend/
  main.py                       FastAPI app, routes
  ingest/
    reader.py                   xlrd / openpyxl / bs4 / csv autodetect
    mappings.py                 Cyrillic fold + status/dept/type dictionaries
    normalize.py                row → canonical record
    pipeline.py                 end-to-end ingest()
  analytics/
    filters.py                  shared filter logic + distinct values
    kpis.py                     executive / per-type / departments
  amir/
    amir.py                     intent router + data tools
  storage/
    file_store.py               active/archive + capacity / costs / mappings
  requirements.txt

src/
  main.tsx, App.tsx
  components/
    layout/    Sidebar, Topbar, FilterBar, AmirPanel
    charts/    KpiCard, Charts (Area, Bar, Pie, Heatmap, Sparkline)
  pages/
    Executive, RequestType, Departments, Upload, Settings, Capacity, Amir
  lib/         api client, filters store, format helpers, cn

docs/          PRD, KPI_CATALOG, DATA_DICTIONARY, ARCHITECTURE
data/samples/  Sample Jira export
storage/       Runtime data (gitignored)
```

## Endpoints
See `backend/main.py`. Key ones:

| Method | Path                              | Purpose                              |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/upload`                     | Upload Jira export (xls/xlsx/csv)   |
| GET    | `/api/uploads`                    | Upload history                       |
| POST   | `/api/uploads/{id}/activate`      | Activate a prior upload (rollback)   |
| GET    | `/api/filters`                    | Distinct filter values               |
| GET    | `/api/kpis/executive`             | Executive dashboard payload          |
| GET    | `/api/kpis/request-type/{code}`   | Per-type dashboard                   |
| GET    | `/api/kpis/departments`           | Department analytics + heatmap       |
| GET/PUT| `/api/capacity`                   | Capacity Registry                    |
| GET/PUT| `/api/cost-rates`                 | FinOps unit rates                    |
| POST   | `/api/amir/query`                 | AMIR copilot                         |
| GET    | `/api/export/{xlsx\|csv\|json}`   | Filtered export                      |
