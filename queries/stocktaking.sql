-- name: CreateStocktaking :one
INSERT INTO stocktaking (
    period,
    status,
    operator_id,
    remark
) VALUES (
    $1, $2, $3, $4
)
RETURNING
  id,
  period,
  status,
  operator_id,
  remark,
  created_at,
  updated_at;

-- name: AddStocktakingItem :one
INSERT INTO stocktaking_items (
    stocktaking_id,
    material_id,
    book_quantity,
    actual_quantity
) VALUES (
    $1, $2, $3, $4
)
RETURNING
    id,
    stocktaking_id,
    material_id,
    book_quantity,
    actual_quantity,
    difference,
    created_at;

-- name: ListStocktaking :many
SELECT
    id,
    period,
    status,
    operator_id,
    remark,
    created_at,
    updated_at
FROM stocktaking
ORDER BY created_at DESC, id DESC;

-- name: GetStocktakingByID :one
SELECT
    id,
    period,
    status,
    operator_id,
    remark,
    created_at,
    updated_at
FROM stocktaking
WHERE id = $1
LIMIT 1;

-- name: ConfirmStocktaking :one
UPDATE stocktaking
SET
    status = 'confirmed',
    updated_at = NOW()
WHERE id = $1
    AND status = 'draft'
RETURNING
    id,
    period,
    status,
    operator_id,
    remark,
    created_at,
    updated_at;

-- name: ListStocktakingItems :many
SELECT
    id,
    stocktaking_id,
    material_id,
    book_quantity,
    actual_quantity,
    difference,
    created_at
FROM stocktaking_items
WHERE stocktaking_id = $1
ORDER BY id;