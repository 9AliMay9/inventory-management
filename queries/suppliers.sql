-- name: ListSuppliers :many
SELECT id, name, contact_person, phone, email, address, created_at, updated_at
FROM suppliers
ORDER BY id DESC;

-- name: GetSupplierByID :one
SELECT id, name, contact_person, phone, email, address, created_at, updated_at
FROM suppliers
WHERE id = $1
LIMIT 1;

-- name: CreateSupplier :one
INSERT INTO suppliers (
    name,
    contact_person,
    phone,
    email,
    address
) VALUES (
    $1, $2, $3, $4, $5
)
RETURNING id, name, contact_person, phone, email, address, created_at, updated_at;