package handler

import (
	"encoding/json"
	"net/http"

	"inventory-management/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

type loginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "bad request")
		return
	}

	token, err := h.svc.Login(r.Context(), req.Username, req.Password)
	if err != nil {
		if err.Error() == "invalid credentials" {
			writeError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"token": token,
	})
}
