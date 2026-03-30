CREATE TABLE alert_failures (
    id          BIGSERIAL       PRIMARY KEY,
    material_id BIGINT          REFERENCES materials(id) ON DELETE SET NULL,
    alert_type  VARCHAR(20)     NOT NULL,
    error       TEXT            NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alert_failures_created ON alert_failures(created_at);