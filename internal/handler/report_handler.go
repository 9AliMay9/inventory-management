package handler

import (
	"net/http"
	"strconv"
	"time"

	"inventory-management/internal/repository"
)

type ReportHandler struct {
	q *repository.Queries
}

func NewReportHandler(q *repository.Queries) *ReportHandler {
	return &ReportHandler{q: q}
}

func (h *ReportHandler) GetMonthlyReport(w http.ResponseWriter, r *http.Request) {
	year, err := strconv.Atoi(r.URL.Query().Get("year"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid year")
		return
	}

	month, err := strconv.Atoi(r.URL.Query().Get("month"))
	if err != nil || month < 1 || month > 12 {
		writeError(w, http.StatusBadRequest, "invalid month")
		return
	}

	start := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0)

	items, err := h.q.GetMonthlyReport(r.Context(),
		repository.GetMonthlyReportParams{
			CreatedAt:   start,
			CreatedAt_2: end,
		})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	if items == nil {
		items = []repository.GetMonthlyReportRow{}
	}

	writeJSON(w, http.StatusOK, items)
}
