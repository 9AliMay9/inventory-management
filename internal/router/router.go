package router

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"inventory-management/internal/handler"
	"inventory-management/internal/middleware"
)

func NewRouter(
	authHandler *handler.AuthHandler,
	supplierHandler *handler.SupplierHandler,
	materialHandler *handler.MaterialHandler,
	jwtManager *middleware.JWTManager,
) http.Handler {
	r := chi.NewRouter()

	r.Get("/api/v1/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Post("/api/v1/auth/login", authHandler.Login)

	r.Get("/api/v1/suppliers", supplierHandler.ListSuppliers)
	r.Get("/api/v1/suppliers/{id}", supplierHandler.GetSupplierByID)

	r.Get("/api/v1/materials", materialHandler.ListMaterials)
	r.Get("/api/v1/materials/{id}", materialHandler.GetMaterialByID)

	r.Group(func(protected chi.Router) {
		protected.Use(jwtManager.Middleware)
		protected.Post("/api/v1/suppliers", supplierHandler.CreateSupplier)
		protected.Post("/api/v1/materials", materialHandler.CreateMaterial)
	})

	return r
}
