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

type SupplierHandler struct {
	q *repository.Queries
}

type createSupplierRequest struct {
	Name          string `json:"name"`
	ContactPerson string `json:"contact_person"`
	Phone         string `json:"phone"`
	Email         string `json:"email"`
	Address       string `json:"address"`
}

func NewSupplierHandler(q *repository.Queries) *SupplierHandler {
	return &SupplierHandler{q: q}
}

func (h *SupplierHandler) ListSuppliers(w http.ResponseWriter, r *http.Request) {
	items, err := h.q.ListSuppliers(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, items)
}

func (h *SupplierHandler) GetSupplierByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.q.GetSupplierByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *SupplierHandler) CreateSupplier(w http.ResponseWriter, r *http.Request) {
	var req createSupplierRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.q.CreateSupplier(r.Context(), repository.CreateSupplierParams{
		Name:          req.Name,
		ContactPerson: sql.NullString{String: req.ContactPerson, Valid: req.ContactPerson != ""},
		Phone:         sql.NullString{String: req.Phone, Valid: req.Phone != ""},
		Email:         sql.NullString{String: req.Email, Valid: req.Email != ""},
		Address:       sql.NullString{String: req.Address, Valid: req.Address != ""},
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusCreated, item)
}
