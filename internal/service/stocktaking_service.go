package service

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"strconv"

	"inventory-management/internal/repository"
)

var (
	ErrStocktakingNotFound         = errors.New("stocktaking not found")
	ErrStocktakingAlreadyConfirmed = errors.New("stocktaking already confirmed")
	ErrStocktakingEmpty            = errors.New("stocktaking has no items")
)

type StocktakingService struct {
	db *sql.DB
	q  *repository.Queries
}

func NewStocktakingService(db *sql.DB, q *repository.Queries) *StocktakingService {
	return &StocktakingService{
		db: db,
		q:  q,
	}
}

func (s *StocktakingService) CreateStocktaking(
	ctx context.Context,
	period string,
	remark string,
	operatorID int64,
) (repository.Stocktaking, error) {
	return s.q.CreateStocktaking(ctx, repository.CreateStocktakingParams{
		Period: period,
		Status: "draft",
		OperatorID: sql.NullInt64{
			Int64: operatorID,
			Valid: operatorID != 0,
		},
		Remark: sql.NullString{
			String: remark,
			Valid:  remark != "",
		},
	})
}

func (s *StocktakingService) AddItem(
	ctx context.Context,
	arg repository.AddStocktakingItemParams,
) (repository.StocktakingItem, error) {
	stocktaking, err := s.q.GetStocktakingByID(ctx, arg.StocktakingID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return repository.StocktakingItem{}, ErrStocktakingNotFound
		}
		return repository.StocktakingItem{}, err
	}

	if stocktaking.Status != "draft" {
		return repository.StocktakingItem{}, ErrStocktakingAlreadyConfirmed
	}

	return s.q.AddStocktakingItem(ctx, arg)
}

func (s *StocktakingService) Confirm(
	ctx context.Context,
	id int64,
) (repository.Stocktaking, error) {
	stocktaking, err := s.q.GetStocktakingByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return repository.Stocktaking{}, ErrStocktakingNotFound
		}
		return repository.Stocktaking{}, err
	}

	if stocktaking.Status != "draft" {
		return repository.Stocktaking{}, ErrStocktakingAlreadyConfirmed
	}

	items, err := s.q.ListStocktakingItems(ctx, id)
	if err != nil {
		return repository.Stocktaking{}, err
	}
	if len(items) == 0 {
		return repository.Stocktaking{}, ErrStocktakingEmpty
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return repository.Stocktaking{}, err
	}

	qtx := repository.New(tx)

	confirmed, err := qtx.ConfirmStocktaking(ctx, id)
	if err != nil {
		_ = tx.Rollback()
		if errors.Is(err, sql.ErrNoRows) {
			return repository.Stocktaking{}, ErrStocktakingAlreadyConfirmed
		}
		return repository.Stocktaking{}, err
	}

	for _, item := range items {
		if _, err := qtx.UpdateMaterialQuantity(ctx, repository.UpdateMaterialQuantityParams{
			ID:       item.MaterialID,
			Quantity: item.ActualQuantity,
		}); err != nil {
			_ = tx.Rollback()
			return repository.Stocktaking{}, err
		}
	}

	if err := tx.Commit(); err != nil {
		_ = tx.Rollback()
		return repository.Stocktaking{}, err
	}

	for _, item := range items {
		newQty, err := strconv.ParseFloat(item.ActualQuantity, 64)
		if err != nil {
			log.Printf("parse actual quantity failed for material %d: %v", item.MaterialID, err)
			continue
		}

		material, err := s.q.GetMaterialByID(ctx, item.MaterialID)
		if err != nil {
			log.Printf("get material failed for alert check, material %d: %v", item.MaterialID, err)
			continue
		}

		var maxStock float64
		var hasMaxStock bool
		if material.MaxStock.Valid {
			if ms, parseErr := strconv.ParseFloat(material.MaxStock.String, 64); parseErr == nil {
				maxStock = ms
				hasMaxStock = true
			}
		}

		tryCreateAlerts(ctx, s.q, material, newQty, hasMaxStock, maxStock)
	}

	return confirmed, nil
}

func (s *StocktakingService) ListStocktaking(ctx context.Context) ([]repository.Stocktaking, error) {
	return s.q.ListStocktaking(ctx)
}

func (s *StocktakingService) GetByID(ctx context.Context, id int64) (repository.Stocktaking, error) {
	item, err := s.q.GetStocktakingByID(ctx, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return repository.Stocktaking{}, ErrStocktakingNotFound
		}
		return repository.Stocktaking{}, err
	}
	return item, nil
}

func (s *StocktakingService) ListItems(
	ctx context.Context,
	stocktakingID int64,
) ([]repository.StocktakingItem, error) {
	return s.q.ListStocktakingItems(ctx, stocktakingID)
}
