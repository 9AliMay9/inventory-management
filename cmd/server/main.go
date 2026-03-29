package main

import (
	static "inventory-management"

	"log"
	"net/http"

	"github.com/joho/godotenv"

	"inventory-management/internal/config"
	"inventory-management/internal/db"
	"inventory-management/internal/handler"
	"inventory-management/internal/middleware"
	"inventory-management/internal/repository"
	"inventory-management/internal/router"
	"inventory-management/internal/service"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal(err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	sqlDB, err := db.NewDB(cfg)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		_ = sqlDB.Close()
	}()

	q := repository.New(sqlDB)
	jwtMgr := middleware.NewJWTManager(cfg.JWTSecret)
	authSvc := service.NewAuthService(q, cfg.JWTSecret)
	stockSvc := service.NewStockService(sqlDB, q)
	stocktakingSvc := service.NewStocktakingService(sqlDB, q)

	authHandler := handler.NewAuthHandler(authSvc)
	supplierHandler := handler.NewSupplierHandler(q)
	materialHandler := handler.NewMaterialHandler(q)
	stockHandler := handler.NewStockHandler(stockSvc)
	alertHandler := handler.NewAlertHandler(q)
	stocktakingHandler := handler.NewStocktakingHandler(stocktakingSvc)
	reportHandler := handler.NewReportHandler(q)
	userHandler := handler.NewUserHandler(q)

	r := router.NewRouter(
		authHandler,
		supplierHandler,
		materialHandler,
		stockHandler,
		alertHandler,
		stocktakingHandler,
		reportHandler,
		userHandler,
		jwtMgr,
		static.StaticFiles,
	)

	log.Printf("server started on: %s", cfg.ServerPort)

	if err := http.ListenAndServe(":"+cfg.ServerPort, r); err != nil {
		log.Fatal(err)
	}
}
