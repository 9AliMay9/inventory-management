package db

import (
	"database/sql"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"

	"inventory-management/internal/config"
)

func NewDB(cfg *config.Config) (*sql.DB, error) {
	sslMode := cfg.DBSSLMode
	if sslMode == "" {
		sslMode = "disable"
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
		sslMode,
	)

	sqlDB, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		_ = sqlDB.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return sqlDB, nil
}
