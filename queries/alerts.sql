-- name: CreateAlert :one
INSERT INTO alerts (
    material_id,
    alert_type,
    message
) VALUES (
    $1, $2, $3
)
RETURNING
  id,
  material_id,
  alert_type,
  message,
  is_resolved,
  created_at,
  resolved_at;

-- name: ListUnresolvedAlerts :many
SELECT
    id,
    material_id,
    alert_type,
    message,
    is_resolved,
    created_at,
    resolved_at
FROM alerts
WHERE is_resolved = FALSE
ORDER BY created_at DESC, id DESC;

-- name: ResolveAlert :one
UPDATE alerts
SET
    is_resolved = TRUE,
    resolved_at = NOW()
WHERE id = $1
RETURNING
    id,
    material_id,
    alert_type,
    message,
    is_resolved,
    created_at,
    resolved_at;