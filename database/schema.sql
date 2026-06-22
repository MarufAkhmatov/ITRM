-- ITRM Postgres schema (optional production target).
-- The MVP runs on file storage with the identical logical model
-- (backend/storage/file_store.py). Swap file_store for a SQLAlchemy
-- repository to use this without changing the analytics layer.

CREATE TABLE IF NOT EXISTS upload_history (
    id           BIGSERIAL PRIMARY KEY,
    upload_id    TEXT UNIQUE NOT NULL,
    filename     TEXT NOT NULL,
    file_format  TEXT,
    rows_valid   INTEGER,
    rows_quarantined INTEGER,
    is_active    BOOLEAN DEFAULT FALSE,
    uploaded_at  TIMESTAMPTZ DEFAULT now(),
    raw_bytes    BYTEA,
    report       JSONB
);

CREATE TABLE IF NOT EXISTS requests (
    id                    BIGSERIAL PRIMARY KEY,
    upload_id             BIGINT REFERENCES upload_history(id) ON DELETE CASCADE,
    issue_key             TEXT NOT NULL,
    request_type_code     TEXT,
    request_type_label    TEXT,
    request_type_raw      TEXT,
    priority              TEXT,
    status                TEXT,
    status_group          TEXT,
    assignee              TEXT,
    department            TEXT,
    department_raw        TEXT,
    environment           TEXT,
    server_types          TEXT[],
    os                    TEXT,
    internet_needed       BOOLEAN,
    ram_gb                NUMERIC,
    cpu_vcpu              NUMERIC,
    storage_gb            NUMERIC,
    created_at            TIMESTAMPTZ,
    resolved_at           TIMESTAMPTZ,
    first_in_progress_at  TIMESTAMPTZ,
    last_done_at          TIMESTAMPTZ,
    lead_time_hours       NUMERIC,
    cycle_time_hours      NUMERIC,
    summary               TEXT,
    description           TEXT,
    UNIQUE(upload_id, issue_key)
);

CREATE INDEX IF NOT EXISTS idx_requests_created     ON requests(created_at);
CREATE INDEX IF NOT EXISTS idx_requests_type        ON requests(request_type_code);
CREATE INDEX IF NOT EXISTS idx_requests_department  ON requests(department);
CREATE INDEX IF NOT EXISTS idx_requests_status      ON requests(status_group);
CREATE INDEX IF NOT EXISTS idx_requests_environment ON requests(environment);

CREATE TABLE IF NOT EXISTS capacity_registry (
    id             BIGSERIAL PRIMARY KEY,
    datacenter     TEXT,
    cluster        TEXT,
    hypervisor     TEXT,
    environment    TEXT,
    server_count   INTEGER,
    total_cpu      NUMERIC, used_cpu NUMERIC, free_cpu NUMERIC,
    total_ram      NUMERIC, used_ram NUMERIC, free_ram NUMERIC,
    total_storage  NUMERIC, used_storage NUMERIC, free_storage NUMERIC,
    as_of          DATE,
    updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cost_rates (
    id                       BIGSERIAL PRIMARY KEY,
    cpu_per_vcpu_month       NUMERIC,
    ram_per_gb_month         NUMERIC,
    storage_per_gb_month     NUMERIC,
    env_multiplier           JSONB,
    effective_from           DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS field_mappings (
    id          BIGSERIAL PRIMARY KEY,
    field_kind  TEXT,        -- status | priority | request_type | department | environment | server_type
    raw_value   TEXT,
    canonical   TEXT,
    extra       JSONB,
    UNIQUE(field_kind, raw_value)
);

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    full_name   TEXT,
    role        TEXT NOT NULL DEFAULT 'Viewer'
                CHECK (role IN ('Admin','ITResourceAdmin','ITDirector',
                                'InfrastructureEngineer','Analyst','Viewer')),
    created_at  TIMESTAMPTZ DEFAULT now()
);
