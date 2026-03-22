CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password_hash TEXT          NOT NULL,
    role        VARCHAR(20)     NOT NULL DEFAULT 'staff',
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_role CHECK (role IN ('admin', 'staff'))
);

CREATE TABLE suppliers (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    contact_person VARCHAR(100),
    phone       VARCHAR(30),
    email       VARCHAR(100),
    address     TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE materials (
    id          BIGSERIAL       PRIMARY KEY,
    code        VARCHAR(50)     NOT NULL UNIQUE,
    name        VARCHAR(100)    NOT NULL,
    category    VARCHAR(50),
    unit        VARCHAR(20)     NOT NULL,
    specification VARCHAR(100),
    supplier_id BIGINT          REFERENCES suppliers(id) ON DELETE SET NULL,
    quantity    NUMERIC(12,2)   NOT NULL DEFAULT 0,
    min_stock   NUMERIC(12,2)   NOT NULL DEFAULT 0,
    max_stock   NUMERIC(12,2),
    unit_price  NUMERIC(12,2)   NOT NULL DEFAULT 0,
    status      VARCHAR(20)     NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_material_status CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE stock_movements (
    id          BIGSERIAL       PRIMARY KEY,
    material_id BIGINT          NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    movement_type VARCHAR(20)   NOT NULL,
    quantity    NUMERIC(12,2)   NOT NULL,
    unit_price  NUMERIC(12,2)   NOT NULL DEFAULT 0,
    reference_no VARCHAR(100),
    remark      TEXT,
    operator_id BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT  chk_movement_type CHECK (movement_type IN ('IN', 'OUT', 'ADJUST'))
);

CREATE TABLE alerts (
    id          BIGSERIAL       PRIMARY KEY,
    material_id BIGINT          NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    alert_type  VARCHAR(20)     NOT NULL,
    message     TEXT            NOT NULL,
    is_resolved BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT chk_alert_type CHECK (alert_type IN ('LOW_STOCK', 'OVER_STOCK'))
);

CREATE TABLE stocktaking (
    id          BIGSERIAL       PRIMARY KEY,
    period      VARCHAR(20)     NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'draft',
    operator_id BIGINT          REFERENCES users(id) ON DELETE SET NULL,
    remark      TEXT,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_stocktaking_status CHECK (status IN ('draft', 'confirmed'))
);

CREATE TABLE stocktaking_items (
    id          BIGSERIAL       PRIMARY KEY,
    stocktaking_id BIGINT       NOT NULL REFERENCES stocktaking(id) ON DELETE CASCADE,
    material_id BIGINT          NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    book_quantity NUMERIC(12,2) NOT NULL,
    actual_quantity NUMERIC(12,2) NOT NULL,
    difference  NUMERIC(12,2)   GENERATED ALWAYS AS (actual_quantity - book_quantity) STORED,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_materials_supplier_id ON materials(supplier_id);
CREATE INDEX idx_materials_name ON materials(name);
CREATE INDEX idx_stock_movements_material ON stock_movements(material_id);
CREATE INDEX idx_stock_movements_created ON stock_movements(created_at);
CREATE INDEX idx_alerts_material_id ON alerts(material_id);
CREATE INDEX idx_alerts_is_resolved ON alerts(is_resolved);
CREATE INDEX idx_stocktaking_items_parent ON stocktaking_items(stocktaking_id);
CREATE INDEX idx_stocktaking_items_mat ON stocktaking_items(material_id);
