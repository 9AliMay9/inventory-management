INSERT INTO users (username, password_hash, role, is_active)
VALUES
    ('admin', 'REPLACE_WITH_BCRYPT_HASH','admin', TRUE);
INSERT INTO suppliers (name, contact_person, phone, email, address)
VALUES
    ('华北供应商', '张三', '13800000001', 'north@example.com', '北京市朝阳区'),
    ('华东供应商', '李四', '13800000002', 'east@example.com', '上海市浦东新区');

INSERT INTO materials (
    code,
    name,
    category,
    unit,
    specification,
    supplier_id,
    quantity,
    min_stock,
    max_stock,
    unit_price,
    status
)
VALUES
    ('MAT-001', '螺丝', '五金', '个', 'M6', 1, 500.00, 100.00, 1000.00, 0.50, 'active'),
    ('MAT-002', '钢板', '原材料', '张', '2mm', 2, 120.00, 30.00, 300.00, 85.00, 'active'),
    ('MAT-003', '包装箱', '包装', '个', '中号', 1, 80.00, 20.00, 200.00, 6.80, 'active');
