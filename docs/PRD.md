# ITRM — Product Requirements Document

## 1. Purpose
Give a commercial bank's leadership and IT Infrastructure team a single
analytical platform on top of the IT Resource Management Jira Service
Management project: what is being requested, by whom, how much capacity is
being allocated, what it costs, and what next-year demand looks like.

## 2. Users
| Role                 | Goals                                                    |
|----------------------|----------------------------------------------------------|
| IT Director / CIO    | Executive view, forecast, cost, governance               |
| IT Resource Admin    | Daily Jira upload, capacity registry, field mappings     |
| Infrastructure Eng.  | Per-request-type backlog, environment / server breakdown |
| Analyst              | Department analytics, drill-down, custom exports         |
| Viewer               | Read-only dashboards                                     |

## 3. Primary data source
Daily **Jira Service Management** export (manual upload). Supported formats:
binary `.xls` (OLE2), `.xlsx`, `.csv`, HTML-disguised `.xls`. The system
auto-detects format, normalizes, dedupes by issue key, snapshots the file as
an archived upload, and sets it active.

Real-data sample (`data/samples/ITRM_260621_2100.xls`):
- 451 rows · 19 columns (all Russian)
- 9 distinct Customer Request Types
- 50 canonical departments (after collapsing 62 raw spellings)
- Status field includes `"Dоne"` with a Cyrillic `о` — handled.

## 4. Secondary data source
Admin-entered **Infrastructure Capacity Registry**:
`Data Center | Cluster | Hypervisor | Environment | Server Count |
Total/Used/Free CPU | Total/Used/Free RAM | Total/Used/Free Storage`.
Purpose: compare *allocated* (Jira) against *actual available* capacity.

## 5. Scope
### MVP (released here)
- Daily upload / ETL with ingestion report and version history
- Executive Dashboard
- 9 auto-generated request-type pages
- Department Analytics (ranking, heatmap, top consumers)
- Global filter bar (Year/Quarter/Month, Dept, Env, Type, Status, Priority)
- Settings (cost rates, field-mapping primer)
- Exports (XLSX, CSV, JSON)
- AMIN copilot (deterministic intent router on real data)
- Dark / Light theme, 4K-friendly layout

### Phase 2
- Capacity Registry CRUD + capacity-vs-allocated comparison
- Forecasting (linear + seasonal, best/expected/worst, 1m/1q/1y/3y)
- FinOps engine (chargeback/showback, budget-vs-actual)
- Intelligent Alert Center (CPU/RAM/Storage thresholds, growth anomalies)
- AMIN LLM synthesis layer (local Claude Code CLI)
- PDF / PPT report exports

### Phase 3
- What-If Simulation Engine
- Infrastructure Digital Twin (DC / cluster / host / VM model)
- Resource Governance Center (zombie / aging / reclamation)
- CIO Command Center
- Project Resource Analytics
- Executive Report Generator (weekly / monthly / quarterly / annual)
- Full EDW dimensional model (Postgres → optional warehouse)

## 6. Non-functional
- **Security**: RBAC (Admin, IT Resource Admin, IT Director,
  Infrastructure Engineer, Analyst, Viewer). Local-only deployment by
  default; no external network egress in MVP.
- **Performance**: KPI endpoints respond in <300ms on the sample dataset;
  scale-out path is Postgres + materialized aggregates.
- **Availability**: file-storage MVP is single-node; production target is
  Docker Compose (`postgres + backend + frontend`).
- **Localization**: source data is Russian; UI labels are English; data
  values render as-is to keep traceability.

## 7. Out of scope (current release)
Direct Jira REST sync, SSO/LDAP, multi-tenant, mobile-native UI, ML-based
anomaly detection. All are upgrade paths, not regressions.
