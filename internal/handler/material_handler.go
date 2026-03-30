package handler

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"inventory-management/internal/repository"
)

type MaterialHandler struct {
	q *repository.Queries
}

type createMaterialRequest struct {
	Code          string `json:"code"`
	Name          string `json:"name"`
	Category      string `json:"category"`
	Unit          string `json:"unit"`
	Specification string `json:"specification"`
	SupplierID    int64  `json:"supplier_id"`
	Quantity      string `json:"quantity"`
	MinStock      string `json:"min_stock"`
	MaxStock      string `json:"max_stock"`
	UnitPrice     string `json:"unit_price"`
}

func NewMaterialHandler(q *repository.Queries) *MaterialHandler {
	return &MaterialHandler{q: q}
}

func (h *MaterialHandler) ListMaterials(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	name := query.Get("name")
	category := query.Get("category")
	supplierIDText := query.Get("supplier_id")

	params := repository.FilterMaterialsParams{
		Name:     sql.NullString{String: name, Valid: name != ""},
		Category: sql.NullString{String: category, Valid: category != ""},
	}

	if supplierIDText != "" {
		supplierID, err := strconv.ParseInt(supplierIDText, 10, 64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "bad request")
			return
		}
		params.SupplierID = sql.NullInt64{Int64: supplierID, Valid: true}
	}

	items, err := h.q.FilterMaterials(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	resp := make([]materialResp, 0, len(items))
	for _, item := range items {
		resp = append(resp, toMaterialResp(item))
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *MaterialHandler) GetMaterialByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.q.GetMaterialByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, toMaterialResp(item))
}

func (h *MaterialHandler) CreateMaterial(w http.ResponseWriter, r *http.Request) {
	var req createMaterialRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	if req.Code == "" || req.Name == "" || req.Unit == "" {
		writeError(w, http.StatusBadRequest, "code, name and unit are required")
		return
	}

	minStock, err := strconv.ParseFloat(req.MinStock, 64)
	if err != nil || minStock < 0 {
		writeError(w, http.StatusBadRequest, "min_stock must be a valid non-negative number")
		return
	}

	if _, err = strconv.ParseFloat(req.Quantity, 64); err != nil {
		writeError(w, http.StatusBadRequest, "quantity must be a valid number")
		return
	}

	if _, err = strconv.ParseFloat(req.UnitPrice, 64); err != nil {
		writeError(w, http.StatusBadRequest, "unit_price must be a valid number")
		return
	}

	if req.MaxStock != "" {
		maxStock, err := strconv.ParseFloat(req.MaxStock, 64)
		if err != nil || maxStock <= 0 {
			writeError(w, http.StatusBadRequest, "max_stock must be a valid positive number")
			return
		}
		if minStock >= maxStock {
			writeError(w, http.StatusBadRequest, "min_stock must be less than max_stock")
			return
		}
	}

	item, err := h.q.CreateMaterial(r.Context(), repository.CreateMaterialParams{
		Code:          req.Code,
		Name:          req.Name,
		Category:      sql.NullString{String: req.Category, Valid: req.Category != ""},
		Unit:          req.Unit,
		Specification: sql.NullString{String: req.Specification, Valid: req.Specification != ""},
		SupplierID:    sql.NullInt64{Int64: req.SupplierID, Valid: req.SupplierID != 0},
		Quantity:      req.Quantity,
		MinStock:      req.MinStock,
		MaxStock:      sql.NullString{String: req.MaxStock, Valid: req.MaxStock != ""},
		UnitPrice:     req.UnitPrice,
		Status:        "active",
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusCreated, toMaterialResp(item))
}
