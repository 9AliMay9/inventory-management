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

	r.Get("/api/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Post("/api/auth/login", authHandler.Login)

	r.Get("/api/suppliers", supplierHandler.ListSuppliers)
	r.Get("/api/suppliers/{id}", supplierHandler.GetSupplierByID)

	r.Get("/api/materials", materialHandler.ListMaterials)
	r.Get("/api/materials/{id}", materialHandler.GetMaterialByID)

	r.Group(func(protected chi.Router) {
		protected.Use(jwtManager.Middleware)
		protected.Post("/api/suppliers", supplierHandler.CreateSupplier)
		protected.Post("/api/materials", materialHandler.CreateMaterial)
	})

	return r
}
