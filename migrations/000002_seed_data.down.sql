DELETE FROM stocktaking_items;
DELETE FROM stocktaking;
DELETE FROM alerts;
DELETE FROM stock_movements;
DELETE FROM materials WHERE code IN ('MAT-001', 'MAT-002', 'MAT-003');
DELETE FROM suppliers WHERE name IN ('华北供应商', '华东供应商');
DELETE FROM users WHERE username = 'admin';