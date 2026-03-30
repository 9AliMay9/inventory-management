-- name: CreateAlertFailure :one
INSERT INTO alert_failures (material_id, alert_type, error)
VALUES($1, $2, $3)
RETURNING *;

-- name: ListAlertFailures :many
SELECT * FROM alert_failures ORDER BY created_at DESC;