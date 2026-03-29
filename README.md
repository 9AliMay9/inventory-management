# Inventory Management System

A full-stack inventory management application — Go backend and React frontend shipped as a **single binary** via `go:embed`. No separate frontend deployment required.

![Login page](docs/images/login-theme-orange.png)

## Screenshots

### Dashboard
![Dashboard](docs/images/dashboard-page.png)

### Materials
![Materials page](docs/images/materials-page.png)

### Stock Movements
![Movements page](docs/images/movements-page.png)

## Tech Stack

**Backend**
- Go 1.26+ · [chi v5](https://github.com/go-chi/chi) · PostgreSQL (pgx/v5) · JWT (golang-jwt/v5) · godotenv · golang-migrate

**Frontend**
- React 19 · TypeScript 5.9 · Vite 8 · Tailwind CSS v4 · shadcn/ui · React Router v7 · Zustand v5 · react-i18next · Axios · lucide-react

## Key Features

- **Single binary deployment** — `pnpm build` + `go build`; the Go binary embeds and serves the entire React SPA
- **3 color themes** — Orange (default) / Mint Green / Asphalt Gray; persisted to `localStorage`, applied synchronously before React mounts (no flash)
- **Bilingual UI** — English / Chinese toggle, default English, persisted to `localStorage`
- **JWT auth + protected routes** — redirect to `/login` when unauthenticated
- **Role-based access** — Admin (full write access) / Staff (read-only)
- **Local-scroll data tables** — each page owns its scroll container; `<thead>` stays sticky inside
- **Full business coverage** — Dashboard · Suppliers · Materials · Stock Movements · Alerts · Stocktaking · Monthly Reports · User Management

## Project Structure

```
inventory-management/
├── cmd/server/main.go      # Entry point
├── internal/
│   ├── config/             # Env config loader
│   ├── db/                 # pgx connection pool
│   ├── handler/            # HTTP handlers + DTOs
│   ├── middleware/         # JWT auth
│   ├── repository/         # sqlc-generated query code
│   ├── router/             # chi router setup + SPA fallback
│   └── service/            # Business logic
├── queries/                # sqlc SQL source files
├── migrations/             # golang-migrate SQL files
├── api/api.http            # HTTP request samples
├── docs/images/            # README screenshots
├── embed.go                # go:embed all:web/dist
├── sqlc.yaml
├── Makefile
├── web/                    # Frontend source
│   ├── src/
│   │   ├── api/            # Axios client + request functions
│   │   ├── components/     # App shell + shadcn/ui components
│   │   ├── i18n/           # en / zh-CN translation files
│   │   ├── layouts/        # Route layout wrappers
│   │   ├── lib/            # Utility helpers
│   │   ├── pages/          # Route-level page components
│   │   ├── store/          # Zustand auth store
│   │   └── types/          # Shared TypeScript types
│   └── vite.config.ts
└── go.mod
```

## Quick Start

**Prerequisites:** Go 1.26+, Node.js 20+ / pnpm 9+, PostgreSQL 15+

```bash
# 1. Clone and configure
git clone https://github.com/your-username/inventory-management.git
cd inventory-management
cp .env.example .env        # set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, etc.

# 2. Run database migrations
make migrate-up

# 3. Build frontend
cd web && pnpm install && pnpm build && cd ..

# 4. Build and run
go build -o inventory-management .
./inventory-management      # serves on http://localhost:8080
```

## Development Mode

```bash
# Terminal 1 — backend (live reload optional with air)
go run ./cmd/server/main.go

# Terminal 2 — frontend dev server (proxies /api → :8080)
cd web && pnpm dev
```

## API Overview

| Group | Endpoints |
|-------|-----------|
| Health | `GET /api/healthz` |
| Auth | `POST /api/auth/login` |
| Suppliers | `GET /api/suppliers` · `GET /api/suppliers/{id}` · `POST /api/suppliers` |
| Materials | `GET /api/materials` · `GET /api/materials/{id}` · `POST /api/materials` |
| Movements | `GET /api/stock/movements` · `POST /api/stock/movements` |
| Alerts | `GET /api/alerts` · `POST /api/alerts/{id}/resolve` |
| Stocktaking | `GET/POST /api/stocktaking` · `GET /api/stocktaking/{id}` · `GET/POST /api/stocktaking/{id}/items` · `POST /api/stocktaking/{id}/confirm` |
| Reports | `GET /api/reports/monthly` |
| Users | `GET /api/users` · `PATCH /api/users/{id}/password` · `POST /api/users` *(Admin only)* |

## License

MIT
