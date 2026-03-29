package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"inventory-management/internal/middleware"
	"inventory-management/internal/repository"
	"inventory-management/internal/service"
)

type StocktakingHandler struct {
	svc *service.StocktakingService
}

type createStocktakingRequest struct {
	Period string `json:"period"`
	Remark string `json:"remark"`
}

type addStocktakingItemRequest struct {
	MaterialID     int64  `json:"material_id"`
	BookQuantity   string `json:"book_quantity"`
	ActualQuantity string `json:"actual_quantity"`
}

func NewStocktakingHandler(svc *service.StocktakingService) *StocktakingHandler {
	return &StocktakingHandler{svc: svc}
}

func (h *StocktakingHandler) CreateStocktaking(w http.ResponseWriter, r *http.Request) {
	operatorID, ok := middleware.UserIDFromCtx(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createStocktakingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}
	if req.Period == "" {
		writeError(w, http.StatusBadRequest, "period is required")
		return
	}
	if len(req.Period) > 20 {
		writeError(w, http.StatusBadRequest, "period exceeds maximum length of 20")
		return
	}

	item, err := h.svc.CreateStocktaking(r.Context(), req.Period, req.Remark, operatorID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusCreated, toStocktakingResp(item))
}

func (h *StocktakingHandler) AddItem(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	var req addStocktakingItemRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}
	if req.MaterialID == 0 || req.BookQuantity == "" || req.ActualQuantity == "" {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.svc.AddItem(r.Context(), repository.AddStocktakingItemParams{
		StocktakingID:  id,
		MaterialID:     req.MaterialID,
		BookQuantity:   req.BookQuantity,
		ActualQuantity: req.ActualQuantity,
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrStocktakingNotFound):
			writeError(w, http.StatusNotFound, err.Error())
			return
		case errors.Is(err, service.ErrStocktakingAlreadyConfirmed):
			writeError(w, http.StatusConflict, err.Error())
			return
		default:
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	writeJSON(w, http.StatusCreated, toStocktakingItemResp(item))
}

func (h *StocktakingHandler) Confirm(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.svc.Confirm(r.Context(), id)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrStocktakingNotFound):
			writeError(w, http.StatusNotFound, err.Error())
			return
		case errors.Is(err, service.ErrStocktakingAlreadyConfirmed):
			writeError(w, http.StatusConflict, err.Error())
			return
		case errors.Is(err, service.ErrStocktakingEmpty):
			writeError(w, http.StatusBadRequest, err.Error())
			return
		default:
			writeError(w, http.StatusInternalServerError, "internal server error")
			return
		}
	}

	writeJSON(w, http.StatusOK, toStocktakingResp(item))
}

func (h *StocktakingHandler) ListStocktaking(w http.ResponseWriter, r *http.Request) {
	items, err := h.svc.ListStocktaking(r.Context())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	resp := make([]stocktakingResp, 0, len(items))
	for _, item := range items {
		resp = append(resp, toStocktakingResp(item))
	}

	writeJSON(w, http.StatusOK, resp)
}

func (h *StocktakingHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	item, err := h.svc.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, service.ErrStocktakingNotFound) {
			writeError(w, http.StatusNotFound, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, toStocktakingResp(item))
}

func (h *StocktakingHandler) GetItems(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	items, err := h.svc.ListItems(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	resp := make([]stocktakingItemResp, 0, len(items))
	for _, item := range items {
		resp = append(resp, toStocktakingItemResp(item))
	}
	writeJSON(w, http.StatusOK, resp)
}
