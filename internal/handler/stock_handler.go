package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

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

	writeJSON(w, http.StatusCreated, toMovementResp(item))
}

func (h *StockHandler) ListMovements(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	materialIDText := query.Get("material_id")
	movementType := query.Get("movement_type")
	fromText := query.Get("from")
	toText := query.Get("to")

	params := repository.FilterMovementsParams{
		MovementType: sql.NullString{String: movementType, Valid: movementType != ""},
	}

	if materialIDText != "" {
		materialID, err := strconv.ParseInt(materialIDText, 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "bad request")
			return
		}
		params.MaterialID = sql.NullInt64{Int64: materialID, Valid: true}
	}

	if fromText != "" {
		fromTime, err := time.Parse("2006-01-02", fromText)
		if err != nil {
			writeError(w, http.StatusBadRequest, "bad request")
			return
		}
		params.CreatedFrom = sql.NullTime{Time: fromTime, Valid: true}
	}

	if toText != "" {
		toTime, err := time.Parse("2006-01-02", toText)
		if err != nil {
			writeError(w, http.StatusBadRequest, "bad request")
			return
		}
		params.CreatedTo = sql.NullTime{Time: toTime.AddDate(0, 0, 1), Valid: true}
	}

	items, err := h.svc.FilterMovements(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	resp := make([]movementResp, 0, len(items))
	for _, item := range items {
		resp = append(resp, toMovementResp(item))
	}

	writeJSON(w, http.StatusOK, resp)
}
