.PHONY: run migrate-up migrate-down sqlc

run:
	go run ./cmd/server/

migrate-up:
	migrate -path migrations/ -database "postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)" up

migrate-down:
	migrate -path migrations/ -database "postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)" down

sqlc:
	sqlc generate
