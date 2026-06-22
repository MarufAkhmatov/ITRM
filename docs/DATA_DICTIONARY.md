# ITRM Data Dictionary

## Canonical request record
After ETL, each Jira issue becomes one record:

| Field                  | Type      | Source                              | Notes |
|------------------------|-----------|-------------------------------------|-------|
| `issue_key`            | string    | Код                                 | Natural key (e.g. `ITRM-489`) |
| `request_type_code`    | enum      | Customer Request Type               | new_server, expand_server, dns_internal, dns_external, tech_account, app_install, server_delete, backup, other |
| `request_type_label`   | string    | derived                             | English display label |
| `request_type_raw`     | string    | Customer Request Type               | original Russian text |
| `priority`             | enum      | Приоритет                           | Blocker, High, Medium, Low, Lowest |
| `status`               | enum      | Статус                              | Done, Rejected, In Progress, To Do, Clarifying, Unknown |
| `status_group`         | enum      | derived                             | open, closed, rejected |
| `assignee`             | string    | Исполнитель                         | |
| `department`           | string    | Подразделение заказчика             | canonicalized (collapses 62 raw → 50) |
| `department_raw`       | string    | Подразделение заказчика             | original |
| `environment`          | enum      | inferred from summary + description | PROD, PREPROD, UAT, TEST, DEV, DR, Unspecified |
| `server_types`         | string[]  | Тип сервера                         | Database, Application, Web, Middleware, Integration, API, Proxy, Balancer, Container Platform |
| `os`                   | string    | Операционная система (OS)           | |
| `internet_needed`      | bool      | Нужно ли подключение к интернету?   | Да→true, Нет→false |
| `ram_gb`               | number    | Оперативная память (RAM)            | parsed from free text |
| `cpu_vcpu`             | number    | Процессор (CPU)                     | parsed from free text |
| `storage_gb`           | number    | Хранилище / Размер диска            | TB/GB/MB → GB |
| `created_at`           | iso8601   | Создано                             | Excel serial or text |
| `resolved_at`          | iso8601   | Дата решения                        | |
| `first_in_progress_at` | iso8601   | Первый переход в В работе           | |
| `last_done_at`         | iso8601   | Последний переход в Выполнено       | |
| `lead_time_hours`      | number    | derived                             | resolved − created |
| `cycle_time_hours`     | number    | derived                             | last_done − first_in_progress |
| `summary`              | string    | Тема                                | |
| `description`          | string    | Описание                            | |

## Capacity Registry record
| Field           | Type    | Notes |
|-----------------|---------|-------|
| datacenter      | string  | |
| cluster         | string  | |
| hypervisor      | string  | VMware ESXi, Hyper-V, KVM, etc. |
| environment     | enum    | PROD, PREPROD, UAT, TEST, DEV, DR |
| server_count    | number  | |
| total_cpu       | number  | vCPU |
| used_cpu        | number  | vCPU |
| free_cpu        | number  | vCPU |
| total_ram       | number  | GB |
| used_ram        | number  | GB |
| free_ram        | number  | GB |
| total_storage   | number  | GB |
| used_storage    | number  | GB |
| free_storage    | number  | GB |
| as_of           | date    | reporting period |

## Dictionary tables
Editable through admin UI (`Settings → Field Mappings`, Phase 2):
- `status_map` — raw → canonical status + group
- `priority_map` — raw → canonical priority
- `request_type_map` — raw → canonical code/label
- `department_synonyms` — substring → canonical name
- `server_type_canon` — raw token → canonical type
- `environment_rules` — keyword → environment
- `cost_rates` — unit-cost-per-resource + env multiplier
