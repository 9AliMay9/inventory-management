package handler

import (
	"database/sql"
	"time"

	"inventory-management/internal/repository"
)

func nullStr(s sql.NullString) *string {
	if !s.Valid {
		return nil
	}
	return &s.String
}

func nullI64(n sql.NullInt64) *int64 {
	if !n.Valid {
		return nil
	}
	return &n.Int64
}

func nullTime(t sql.NullTime) *time.Time {
	if !t.Valid {
		return nil
	}
	return &t.Time
}

type supplierResp struct {
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	ContactPerson *string   `json:"contact_person"`
	Phone         *string   `json:"phone"`
	Email         *string   `json:"email"`
	Address       *string   `json:"address"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toSupplierResp(s repository.Supplier) supplierResp {
	return supplierResp{
		ID:            s.ID,
		Name:          s.Name,
		ContactPerson: nullStr(s.ContactPerson),
		Phone:         nullStr(s.Phone),
		Email:         nullStr(s.Email),
		Address:       nullStr(s.Address),
		CreatedAt:     s.CreatedAt,
		UpdatedAt:     s.UpdatedAt,
	}
}

type materialResp struct {
	ID            int64     `json:"id"`
	Code          string    `json:"code"`
	Name          string    `json:"name"`
	Category      *string   `json:"category"`
	Unit          string    `json:"unit"`
	Specification *string   `json:"specification"`
	SupplierID    *int64    `json:"supplier_id"`
	Quantity      string    `json:"quantity"`
	MinStock      string    `json:"min_stock"`
	MaxStock      *string   `json:"max_stock"`
	UnitPrice     string    `json:"unit_price"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toMaterialResp(m repository.Material) materialResp {
	return materialResp{
		ID:            m.ID,
		Code:          m.Code,
		Name:          m.Name,
		Category:      nullStr(m.Category),
		Unit:          m.Unit,
		Specification: nullStr(m.Specification),
		SupplierID:    nullI64(m.SupplierID),
		Quantity:      m.Quantity,
		MinStock:      m.MinStock,
		MaxStock:      nullStr(m.MaxStock),
		UnitPrice:     m.UnitPrice,
		Status:        m.Status,
		CreatedAt:     m.CreatedAt,
		UpdatedAt:     m.UpdatedAt,
	}
}

type movementResp struct {
	ID           int64     `json:"id"`
	MaterialID   int64     `json:"material_id"`
	MovementType string    `json:"movement_type"`
	Quantity     string    `json:"quantity"`
	UnitPrice    string    `json:"unit_price"`
	ReferenceNo  *string   `json:"reference_no"`
	Remark       *string   `json:"remark"`
	OperatorID   *int64    `json:"operator_id"`
	CreatedAt    time.Time `json:"created_at"`
}

func toMovementResp(m repository.StockMovement) movementResp {
	return movementResp{
		ID:           m.ID,
		MaterialID:   m.MaterialID,
		MovementType: m.MovementType,
		Quantity:     m.Quantity,
		UnitPrice:    m.UnitPrice,
		ReferenceNo:  nullStr(m.ReferenceNo),
		Remark:       nullStr(m.Remark),
		OperatorID:   nullI64(m.OperatorID),
		CreatedAt:    m.CreatedAt,
	}
}

type alertResp struct {
	ID         int64      `json:"id"`
	MaterialID int64      `json:"material_id"`
	AlertType  string     `json:"alert_type"`
	Message    string     `json:"message"`
	IsResolved bool       `json:"is_resolved"`
	CreatedAt  time.Time  `json:"created_at"`
	ResolvedAt *time.Time `json:"resolved_at"`
}

func toAlertResp(a repository.Alert) alertResp {
	return alertResp{
		ID:         a.ID,
		MaterialID: a.MaterialID,
		AlertType:  a.AlertType,
		Message:    a.Message,
		IsResolved: a.IsResolved,
		CreatedAt:  a.CreatedAt,
		ResolvedAt: nullTime(a.ResolvedAt),
	}
}

type stocktakingResp struct {
	ID         int64     `json:"id"`
	Period     string    `json:"period"`
	Status     string    `json:"status"`
	OperatorID *int64    `json:"operator_id"`
	Remark     *string   `json:"remark"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func toStocktakingResp(s repository.Stocktaking) stocktakingResp {
	return stocktakingResp{
		ID:         s.ID,
		Period:     s.Period,
		Status:     s.Status,
		OperatorID: nullI64(s.OperatorID),
		Remark:     nullStr(s.Remark),
		CreatedAt:  s.CreatedAt,
		UpdatedAt:  s.UpdatedAt,
	}
}

type stocktakingItemResp struct {
	ID             int64     `json:"id"`
	StocktakingID  int64     `json:"stocktaking_id"`
	MaterialID     int64     `json:"material_id"`
	BookQuantity   string    `json:"book_quantity"`
	ActualQuantity string    `json:"actual_quantity"`
	Difference     *string   `json:"difference"`
	CreatedAt      time.Time `json:"created_at"`
}

func toStocktakingItemResp(i repository.StocktakingItem) stocktakingItemResp {
	return stocktakingItemResp{
		ID:             i.ID,
		StocktakingID:  i.StocktakingID,
		MaterialID:     i.MaterialID,
		BookQuantity:   i.BookQuantity,
		ActualQuantity: i.ActualQuantity,
		Difference:     nullStr(i.Difference),
		CreatedAt:      i.CreatedAt,
	}
}

type userResp struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func toUserResp(u repository.User) userResp {
	return userResp{
		ID:        u.ID,
		Username:  u.Username,
		Role:      u.Role,
		IsActive:  u.IsActive,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}
