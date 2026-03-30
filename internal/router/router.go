package router

import (
	"embed"
	"io/fs"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"

	"inventory-management/internal/handler"
	"inventory-management/internal/middleware"
)

func NewRouter(
	authHandler *handler.AuthHandler,
	supplierHandler *handler.SupplierHandler,
	materialHandler *handler.MaterialHandler,
	stockHandler *handler.StockHandler,
	alertHandler *handler.AlertHandler,
	alertFailureHandler *handler.AlertFailureHandler,
	stocktakingHandler *handler.StocktakingHandler,
	reportHandler *handler.ReportHandler,
	userHandler *handler.UserHandler,
	jwtManager *middleware.JWTManager,
	staticFiles embed.FS,
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

	r.Get("/api/stock/movements", stockHandler.ListMovements)
	r.Get("/api/alerts", alertHandler.ListAlerts)
	r.Get("/api/alert-failures", alertFailureHandler.ListAlertFailures)
	r.Get("/api/stocktaking", stocktakingHandler.ListStocktaking)
	r.Get("/api/stocktaking/{id}", stocktakingHandler.GetByID)
	r.Get("/api/stocktaking/{id}/items", stocktakingHandler.GetItems)
	r.Get("/api/reports/monthly", reportHandler.GetMonthlyReport)

	r.Group(func(protected chi.Router) {
		protected.Use(jwtManager.Middleware)
		protected.Post("/api/suppliers", supplierHandler.CreateSupplier)
		protected.Post("/api/materials", materialHandler.CreateMaterial)
		protected.Post("/api/stock/movements", stockHandler.CreateMovement)
		protected.Post("/api/alerts/{id}/resolve", alertHandler.ResolveAlert)
		protected.Post("/api/stocktaking", stocktakingHandler.CreateStocktaking)
		protected.Post("/api/stocktaking/{id}/items", stocktakingHandler.AddItem)
		protected.Post("/api/stocktaking/{id}/confirm", stocktakingHandler.Confirm)
	})

	r.Group(func(loggedIn chi.Router) {
		loggedIn.Use(jwtManager.Middleware)
		loggedIn.Get("/api/users", userHandler.ListUsers)
		loggedIn.Patch("/api/users/{id}/password", userHandler.UpdatePassword)
	})

	r.Group(func(adminOnly chi.Router) {
		adminOnly.Use(jwtManager.Middleware)
		adminOnly.Use(middleware.RequireRole("admin"))
		adminOnly.Post("/api/users", userHandler.CreateUser)
	})

	fsys, _ := fs.Sub(staticFiles, "web/dist")
	fileServer := http.FileServer(http.FS(fsys))
	r.Handle("/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		name := strings.TrimPrefix(r.URL.Path, "/")
		if name == "" {
			name = "index.html"
		}
		f, err := fsys.Open(name)
		if err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}
		r2 := r.Clone(r.Context())
		r2.URL = r.URL.ResolveReference(&url.URL{Path: "/"})
		fileServer.ServeHTTP(w, r2)
	}))

	return r
}
