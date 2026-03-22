-- name: ListMaterials :many
SELECT
    id,
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
    status,
    created_at,
    updated_at
FROM materials
ORDER BY id DESC;

-- name: GetMaterialByID :one
SELECT
    id,
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
    status,
    created_at,
    updated_at
FROM materials
WHERE id = $1
LIMIT 1;

-- name: CreateMaterial :one
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
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING
  id,
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
  status,
  created_at,
  updated_at;

-- name: UpdateMaterialQuantity :one
UPDATE materials
SET
    quantity = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING
    id,
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
    status,
    created_at,
    updated_at;