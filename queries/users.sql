-- name: GetUserByUsername :one
SELECT id, username, password_hash, role, is_active, created_at, updated_at
FROM users
WHERE username = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (
    username,
    password_hash,
    role,
    is_active
) VALUES (
    $1, $2, $3, $4
)
RETURNING id, username, password_hash, role, is_active, created_at, updated_at;

-- name: GetUserByID :one
SELECT id, username, password_hash, role, is_active, created_at, updated_at
FROM users
WHERE id = $1
LIMIT 1;

-- name: ListUsers :many
SELECT id, username, password_hash, role, is_active, created_at, updated_at
FROM users
ORDER BY id;

-- name: UpdateUserRole :one
UPDATE users
SET role = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, username, password_hash, role, is_active, created_at, updated_at;

-- name: UpdateUserPassword :one
UPDATE users
SET password_hash = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING id, username, password_hash, role, is_active, created_at, updated_at;