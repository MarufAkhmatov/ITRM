# ITRM KPI Catalog

100+ enterprise KPIs spanning Executive, Capacity, Infrastructure, Resource
Utilization, Department Consumption, Cost, Forecast, AI / Governance.

Legend — Source: **J** = Jira normalized dataset, **C** = Capacity Registry,
**F** = FinOps rates, **D** = Derived. Viz: L=line, A=area, B=bar, P=pie,
K=KPI card, H=heatmap, T=table, G=gauge.

## A. Executive KPIs (MVP — live now)

| # | KPI | Purpose | Formula | Source | Viz | Drill-down | Alert |
|---|-----|---------|---------|--------|-----|-----------|-------|
| 1 | Total Requests | Demand volume | `count(requests)` | J | K+A | Year→Q→M→day; by type | >+30% MoM |
| 2 | Open Requests | Backlog pressure | `count where status_group=open` | J | K | by assignee, age | >50 |
| 3 | Closed Requests | Throughput | `count where status_group=closed` | J | K | by month | — |
| 4 | Fulfilled Requests | Successful delivery | `count where status=Done` | J | K | by type | — |
| 5 | Rejected Requests | Demand quality | `count where status_group=rejected` | J | K | by reason text | >15% |
| 6 | Fulfillment Rate | Service quality | `Fulfilled / Total × 100` | J | G | by month, dept | <80% |
| 7 | Rejection Rate | Filter efficiency | `Rejected / Total × 100` | J | G | by dept, type | >15% |
| 8 | Avg Lead Time | End-to-end speed | `mean(resolved−created)` | J | K+L | by type, priority | >5d |
| 9 | Avg Cycle Time | Active work speed | `mean(last_done−first_in_progress)` | J | K+L | by assignee | >2d |
| 10 | Total Allocated CPU | Committed compute | `Σ cpu_vcpu where status_group=closed` | J | K+A | by env, dept | — |
| 11 | Total Allocated RAM | Committed memory | `Σ ram_gb where status_group=closed` | J | K+A | by env, dept | — |
| 12 | Total Allocated Storage | Committed storage | `Σ storage_gb where status_group=closed` | J | K+A | by env, dept | — |
| 13 | Total Requested CPU | Demand signal | `Σ cpu_vcpu` | J | K | vs allocated | — |
| 14 | Total Requested RAM | Demand signal | `Σ ram_gb` | J | K | vs allocated | — |
| 15 | Total Requested Storage | Demand signal | `Σ storage_gb` | J | K | vs allocated | — |
| 16 | Resource Consumption Trend | Direction of demand | monthly sums for CPU/RAM/Storage/requests | J | A | day, week, dept | — |
| 17 | Top Departments by Requests | Demand concentration | rank dept by count | J | H-bar | dept | — |
| 18 | Top Departments by CPU | Compute consumers | rank dept by Σ cpu | J | H-bar | dept | — |
| 19 | Top Departments by RAM | Memory consumers | rank dept by Σ ram | J | H-bar | dept | — |
| 20 | Top Departments by Storage | Storage consumers | rank dept by Σ storage | J | H-bar | dept | — |
| 21 | Requests by Type | Mix | group by request_type | J | B | type | — |
| 22 | Requests by Environment | Env mix | group by env | J | P | env | — |
| 23 | Requests by Status | Pipeline | group by status | J | P | status | — |
| 24 | Requests by Priority | Urgency mix | group by priority | J | P | priority | — |

## B. Per-Request-Type KPIs (MVP — applied to each of 9 types)

| # | KPI | Formula | Viz |
|---|-----|---------|-----|
| 25 | Type Volume | `count where type=X` | K+A |
| 26 | Type Fulfillment Rate | `Done/Total within type` | G |
| 27 | Type Avg Resolution | `mean lead time within type` | K |
| 28 | Type Avg Cycle | `mean cycle time within type` | K |
| 29 | Type Allocated CPU/RAM/Storage | resource sums within type | K+L |
| 30 | Type Backlog | open within type | K |
| 31 | Type by Status | status mix within type | P |
| 32 | Type by Priority | priority mix within type | P |
| 33 | Type by Environment | env mix within type | P |
| 34 | Type Top Departments | dept ranking within type | H-bar |
| 35 | Type Monthly Trend | monthly count within type | A |

## C. Department Consumption KPIs (MVP)

| # | KPI | Formula | Viz |
|---|-----|---------|-----|
| 36 | Dept Request Count | rank | T+B |
| 37 | Dept CPU | Σ cpu_vcpu | T |
| 38 | Dept RAM | Σ ram_gb | T |
| 39 | Dept Storage | Σ storage_gb | T |
| 40 | Dept Top Environment | mode(env per dept) | T |
| 41 | Dept Top Request Type | mode(type per dept) | T |
| 42 | Dept × Month Heatmap | count by dept × month | H |
| 43 | Dept Growth Rate | last 3m vs prior 3m | L |
| 44 | Dept Resource Share | dept_total / org_total | P |
| 45 | Dept Avg Resolution | mean lead time per dept | K |
| 46 | Dept Rejection Rate | rej/total per dept | K |
| 47 | Dept Active Backlog | open per dept | K |

## D. Capacity KPIs (Phase 2 — schema & endpoint wired)

| # | KPI | Formula | Source |
|---|-----|---------|--------|
| 48 | Total Capacity CPU | Σ total_cpu by env | C |
| 49 | Total Capacity RAM | Σ total_ram by env | C |
| 50 | Total Capacity Storage | Σ total_storage by env | C |
| 51 | Used Capacity CPU | Σ used_cpu | C |
| 52 | Used Capacity RAM | Σ used_ram | C |
| 53 | Used Capacity Storage | Σ used_storage | C |
| 54 | Free Capacity CPU/RAM/Storage | Σ free_* | C |
| 55 | Capacity Utilization % CPU | used/total | C |
| 56 | Capacity Utilization % RAM | used/total | C |
| 57 | Capacity Utilization % Storage | used/total | C |
| 58 | Allocated vs Available CPU | Jira closed Σ cpu vs C.free_cpu | J+C |
| 59 | Allocated vs Available RAM | analogous | J+C |
| 60 | Allocated vs Available Storage | analogous | J+C |
| 61 | Growth Rate (monthly) | linreg slope from monthly Σ | D |
| 62 | Forecasted Exhaustion Date | free / daily_growth | D |
| 63 | Capacity Risk Score | f(util%, growth, days_to_exhaust) | D |
| 64 | Env Capacity Heatmap | env × resource utilization | C | H |
| 65 | Cluster Hot-spots | clusters >80% util | C |
| 66 | Hypervisor Headroom | per-hypervisor free_* | C |

## E. Forecast KPIs (Phase 2)

| # | KPI | Formula |
|---|-----|---------|
| 67 | Forecast Next Month — CPU | linear+seasonal on monthly Σ cpu |
| 68 | Forecast Next Quarter — CPU | 3-month rollup |
| 69 | Forecast Next Year — CPU | 12-month rollup |
| 70 | Forecast Next 3 Years — CPU | 36-month projection |
| 71-78 | Same for RAM, Storage (4 horizons × 2 resources) | — |
| 79 | Forecast Best Case | regression + 2σ |
| 80 | Forecast Worst Case | regression − 2σ |
| 81 | Forecast Confidence | residual std / mean |
| 82 | Forecast Accuracy (back-test) | MAPE on prior periods |

## F. FinOps / Cost KPIs (Phase 2)

| # | KPI | Formula |
|---|-----|---------|
| 83 | Total Allocation Cost / month | Σ (resource × unit_rate × env_mult) |
| 84 | CPU Cost | Σ cpu_vcpu × cpu_rate |
| 85 | RAM Cost | Σ ram_gb × ram_rate |
| 86 | Storage Cost | Σ storage_gb × storage_rate |
| 87 | Cost by Department | sum cost per dept |
| 88 | Cost by Environment | sum cost per env |
| 89 | Cost by Request Type | sum cost per type |
| 90 | Top Cost Drivers | sort cost desc |
| 91 | Budget vs Actual | Σ actual / budget |
| 92 | Budget Variance | actual − budget |
| 93 | Cost per Request | total_cost / count(requests) |
| 94 | Cost Forecast (1y) | extend allocation forecast × rate |
| 95 | Chargeback Total | cost billed to dept |
| 96 | Showback Total | cost shown (informational) |

## G. Governance & AI KPIs (Phase 3)

| # | KPI | Formula |
|---|-----|---------|
| 97 | Zombie Servers | requests closed >365d with no activity |
| 98 | Aging Resources | age(created) > N days |
| 99 | Low-utilization Resources | actual < 20% of allocated |
| 100| Reclaimable Capacity | Σ resources flagged unused |
| 101| Governance Violations | count of policy breaches |
| 102| AMIN Queries / day | usage metric |
| 103| AMIN Avg Response Time | latency |
| 104| AMIN Fallback Rate | fraction answered without LLM |
| 105| AMIN Top Intents | most-asked categories |
| 106| Data Coverage % | rows with non-null resource fields |
| 107| Dept Coverage % | rows with non-blank department |
| 108| Env Coverage % | rows with non-Unspecified env |
| 109| Mapping Drift | unmapped values per upload |
| 110| Upload Freshness | now − last_upload_at |

Each KPI maps to one of the endpoints in [API](./ARCHITECTURE.md). Every
card in the UI supports the standard interaction set: **popup expansion**,
**full-screen drill-down**, **trend view**, **export**. Alert thresholds are
configurable per KPI in `Settings → Alerts` (Phase 2).
