package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"inventory-management/internal/middleware"
	"inventory-management/internal/repository"
	"inventory-management/internal/service"
)

type StockHandler struct {
	svc *service.StockService
}

type createMovementRequest struct {
	MaterialID   int64  `json:"material_id"`
	MovementType string `json:"movement_type"`
	Quantity     string `json:"quantity"`
	UnitPrice    string `json:"unit_price"`
	ReferenceNo  string `json:"reference_no"`
	Remark       string `json:"remark"`
}

func NewStockHandler(svc *service.StockService) *StockHandler {
	return &StockHandler{svc: svc}
}

func (h *StockHandler) CreateMovement(w http.ResponseWriter, r *http.Request) {
	operatorID, ok := middleware.UserIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createMovementRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	params := repository.CreateStockMovementParams{
		MaterialID:   req.MaterialID,
		MovementType: req.MovementType,
		Quantity:     req.Quantity,
		UnitPrice:    req.UnitPrice,
		ReferenceNo:  sql.NullString{String: req.ReferenceNo, Valid: req.ReferenceNo != ""},
		Remark:       sql.NullString{String: req.Remark, Valid: req.Remark != ""},
	}

	item, err := h.svc.CreateMovement(r.Context(), params, operatorID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidMovementType),
			errors.Is(err, service.ErrInvalidQuantity),
			errors.Is(err, service.ErrInsufficientStock),
			errors.Is(err, service.ErrExceedsMaxStock):
			writeError(w, http.StatusBadRequest, err.Error())
			return
		case errors.Is(err, service.ErrMaterialNotFound):
			writeError(w, http.StatusNotFound, err.Error())
			return
		default:
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	writeJSON(w, http.StatusCreated, item)
}

func (h *StockHandler) ListMovements(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListMovements(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if items == nil {
		items = []repository.StockMovement{}
	}

	writeJSON(w, http.StatusOK, items)
}
