-- name: CreateStockMovement :one
INSERT INTO stock_movements (
    material_id,
    movement_type,
    quantity,
    unit_price,
    reference_no,
    remark,
    operator_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
)
RETURNING
  id,
  material_id,
  movement_type,
  quantity,
  unit_price,
  reference_no,
  remark,
  operator_id,
  created_at;

-- name: ListStockMovements :many
SELECT
    id,
    material_id,
    movement_type,
    quantity,
    unit_price,
    reference_no,
    remark,
    operator_id,
    created_at
FROM stock_movements
ORDER BY created_at DESC, id DESC;

-- name: GetMonthlyReport :many
SELECT
    material_id,
    movement_type,
    CAST(SUM(quantity) AS TEXT) AS total_quantity,
    CAST(SUM(quantity * unit_price) AS TEXT) AS total_amount
FROM stock_movements
WHERE created_at >= $1
    AND created_at < $2
GROUP BY material_id, movement_type
ORDER BY material_id, movement_type;