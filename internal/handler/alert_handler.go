package handler

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"inventory-management/internal/repository"
)

type AlertHandler struct {
	q *repository.Queries
}

func NewAlertHandler(q *repository.Queries) *AlertHandler {
	return &AlertHandler{q: q}
}

func (h *AlertHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	items, err := h.q.ListUnresolvedAlerts(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	resp := make([]alertResp, 0, len(items))
	for _, item := range items {
		resp = append(resp, toAlertResp(item))
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *AlertHandler) ResolveAlert(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.q.ResolveAlert(r.Context(), id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeError(w, http.StatusNotFound, "not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, toAlertResp(item))
}
