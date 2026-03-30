package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"

	"inventory-management/internal/repository"
)

var (
	ErrInvalidMovementType = errors.New("invalid movement type")
	ErrInvalidQuantity     = errors.New("invalid quantity")
	ErrMaterialNotFound    = errors.New("material not found")
	ErrInsufficientStock   = errors.New("insufficient stock")
	ErrExceedsMaxStock     = errors.New("exceeds max stock")
)

type StockService struct {
	db *sql.DB
	q  *repository.Queries
}

func NewStockService(db *sql.DB, q *repository.Queries) *StockService {
	return &StockService{
		db: db,
		q:  q,
	}
}

func (s *StockService) CreateMovement(
	ctx context.Context,
	arg repository.CreateStockMovementParams,
	operatorID int64,
) (repository.StockMovement, error) {
	if arg.MovementType != "IN" && arg.MovementType != "OUT" && arg.MovementType != "ADJUST" {
		return repository.StockMovement{}, ErrInvalidMovementType
	}

	movQty, err := strconv.ParseFloat(arg.Quantity, 64)
	if err != nil || movQty <= 0 {
		return repository.StockMovement{}, ErrInvalidQuantity
	}

	material, err := s.q.GetMaterialByID(ctx, arg.MaterialID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return repository.StockMovement{}, ErrMaterialNotFound
		}
		return repository.StockMovement{}, err
	}

	currentQty, err := strconv.ParseFloat(material.Quantity, 64)
	if err != nil {
		return repository.StockMovement{}, fmt.Errorf("parse material quantity: %w", err)
	}

	var newQty float64
	switch arg.MovementType {
	case "IN":
		newQty = currentQty + movQty
	case "OUT":
		newQty = currentQty - movQty
	case "ADJUST":
		newQty = movQty
	}

	if arg.MovementType == "OUT" && newQty < 0 {
		return repository.StockMovement{}, ErrInsufficientStock
	}

	var maxStock float64
	var hasMaxStock bool
	if material.MaxStock.Valid {
		maxStock, err = strconv.ParseFloat(material.MaxStock.String, 64)
		if err != nil {
			return repository.StockMovement{}, fmt.Errorf("parse max stock: %w", err)
		}
		hasMaxStock = true
		if arg.MovementType == "IN" && newQty >= maxStock {
			return repository.StockMovement{}, ErrExceedsMaxStock
		}
	}

	arg.OperatorID = sql.NullInt64{
		Int64: operatorID,
		Valid: operatorID != 0,
	}

	newQtyStr := strconv.FormatFloat(newQty, 'f', 2, 64)

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return repository.StockMovement{}, err
	}

	qtx := repository.New(tx)

	movement, err := qtx.CreateStockMovement(ctx, arg)
	if err != nil {
		_ = tx.Rollback()
		return repository.StockMovement{}, err
	}

	if _, err = qtx.UpdateMaterialQuantity(ctx, repository.UpdateMaterialQuantityParams{
		ID:       arg.MaterialID,
		Quantity: newQtyStr,
	}); err != nil {
		_ = tx.Rollback()
		return repository.StockMovement{}, err
	}

	if err = tx.Commit(); err != nil {
		_ = tx.Rollback()
		return repository.StockMovement{}, err
	}

	tryCreateAlerts(ctx, s.q, material, newQty, hasMaxStock, maxStock)

	return movement, nil
}

func (s *StockService) FilterMovements(
	ctx context.Context,
	params repository.FilterMovementsParams,
) ([]repository.StockMovement, error) {
	return s.q.FilterMovements(ctx, params)
}

func tryCreateAlerts(
	ctx context.Context,
	q *repository.Queries,
	material repository.Material,
	newQty float64,
	hasMaxStock bool,
	maxStock float64,
) {
	minStock, err := strconv.ParseFloat(material.MinStock, 64)
	if err != nil {
		log.Printf("parse min stock failed for material %d: %v", material.ID, err)
	} else if newQty <= minStock {
		_, alertErr := q.CreateAlert(ctx, repository.CreateAlertParams{
			MaterialID: material.ID,
			AlertType:  "LOW_STOCK",
			Message:    fmt.Sprintf("material %s low stock: current %.2f, min %.2f", material.Code, newQty, minStock),
		})
		if alertErr != nil {
			log.Printf("create low_stock alert failed for material %d: %v", material.ID, alertErr)
			_, _ = q.CreateAlertFailure(ctx, repository.CreateAlertFailureParams{
				MaterialID: sql.NullInt64{Int64: material.ID, Valid: true},
				AlertType:  "LOW_STOCK",
				Error:      alertErr.Error(),
			})
		}
	}

	if hasMaxStock && newQty >= maxStock*0.8 {
		_, alertErr := q.CreateAlert(ctx, repository.CreateAlertParams{
			MaterialID: material.ID,
			AlertType:  "OVER_STOCK",
			Message:    fmt.Sprintf("material %s high stock warning: current %.2f, threshold %.2f, max %.2f", material.Code, newQty, maxStock*0.8, maxStock),
		})
		if alertErr != nil {
			log.Printf("create over stock alert failed for material %d: %v", material.ID, alertErr)
			_, _ = q.CreateAlertFailure(ctx, repository.CreateAlertFailureParams{
				MaterialID: sql.NullInt64{Int64: material.ID, Valid: true},
				AlertType:  "OVER_STOCK",
				Error:      alertErr.Error(),
			})
		}
	}
}
