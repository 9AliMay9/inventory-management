package handler

import (
	"inventory-management/internal/repository"
	"net/http"
)

type AlertFailureHandler struct {
	q *repository.Queries
}

func NewAlertFailureHandler(q *repository.Queries) *AlertFailureHandler {
	return &AlertFailureHandler{q: q}
}

func (h *AlertFailureHandler) ListAlertFailures(w http.ResponseWriter, r *http.Request) {
	items, err := h.q.ListAlertFailures(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	type failureResp struct {
		ID         int64  `json:"id"`
		MaterialID *int64 `json:"material_id"`
		AlertType  string `json:"alert_type"`
		Error      string `json:"error"`
		CreatedAt  string `json:"created_at"`
	}
	resp := make([]failureResp, 0, len(items))
	for _, item := range items {
		var mid *int64
		if item.MaterialID.Valid {
			v := item.MaterialID.Int64
			mid = &v
		}
		resp = append(resp, failureResp{
			ID:         item.ID,
			MaterialID: mid,
			AlertType:  item.AlertType,
			Error:      item.Error,
			CreatedAt:  item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}
	writeJSON(w, http.StatusOK, resp)
}
