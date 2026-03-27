# 库存管理系统

基于 Go 实现的库存管理后端系统，使用 Chi 路由、sqlc 类型安全查询、PostgreSQL 数据库与 golang-migrate 迁移管理。

---

## 技术栈

| 组件                                                          | 版本    |
| ----------------------------------------------------------- | ----- |
| Go                                                          | 1.26+ |
| PostgreSQL                                                  | 14+   |
| [Chi](https://github.com/go-chi/chi)                        | v5    |
| [sqlc](https://sqlc.dev)                                    | v1.30 |
| [golang-migrate](https://github.com/golang-migrate/migrate) | v4    |
| [golang-jwt](https://github.com/golang-jwt/jwt)             | v5    |

---

## 功能模块

- **认证**：JWT 登录，基于角色的访问控制（admin / staff）
- **供货商管理**：新增、查询供货商
- **物料管理**：新增、查询，支持按名称、分类、供货商复合过滤
- **出入库管理**：入库 / 出库 / 调整，库存联动，支持按物料、类型、日期范围过滤
- **预警系统**：低库存 / 高库存自动预警，支持手动解决
- **库存盘点**：创建盘点单、录入明细、确认盘点，确认后触发预警检查
- **月底结存**：按年月聚合出入库报表
- **用户管理**：创建用户、查询用户列表、修改角色、修改密码

---

## 快速启动

### 1. 环境依赖

- Go 1.22+
- PostgreSQL 14+
- [golang-migrate CLI](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate)
- [sqlc CLI](https://docs.sqlc.dev/en/latest/overview/install.html)（仅在修改查询时需要）

### 2. 配置

```bash
cp .env.example .env
```

编辑 `.env`，填写数据库连接信息和 JWT 密钥：

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=inventory
DB_SSLMODE=disable
JWT_SECRET=your_secret_key
SERVER_PORT=8080
```

### 3. 初始化数据库

```bash
# 创建数据库（在 psql 中执行）
CREATE DATABASE inventory;

# 运行迁移（含建表与种子数据）
make migrate-up
```

### 4. 启动服务

```bash
make run
```

服务默认监听 `http://localhost:8080`。

---

## 主要 API

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录获取 JWT | 无 |
| GET | `/api/suppliers` | 供货商列表 | 无 |
| GET | `/api/suppliers/{id}` | 供货商详情 | 无 |
| POST | `/api/suppliers` | 新增供货商 | 登录 |
| GET | `/api/materials` | 物料列表（支持过滤） | 无 |
| GET | `/api/materials/{id}` | 物料详情 | 无 |
| POST | `/api/materials` | 新增物料 | 登录 |
| GET | `/api/stock/movements` | 出入库记录（支持过滤） | 无 |
| POST | `/api/stock/movements` | 新增出入库记录 | 登录 |
| GET | `/api/alerts` | 未解决预警列表 | 无 |
| POST | `/api/alerts/{id}/resolve` | 解决预警 | 登录 |
| GET | `/api/stocktaking` | 盘点单列表 | 无 |
| GET | `/api/stocktaking/{id}` | 盘点单详情 | 无 |
| POST | `/api/stocktaking` | 创建盘点单 | 登录 |
| POST | `/api/stocktaking/{id}/items` | 录入盘点明细 | 登录 |
| POST | `/api/stocktaking/{id}/confirm` | 确认盘点 | 登录 |
| GET | `/api/reports/monthly` | 月底结存报表 | 无 |
| GET | `/api/users` | 用户列表 | 登录 |
| POST | `/api/users` | 创建用户 | admin |
| PATCH | `/api/users/{id}/role` | 修改用户角色 | admin |
| PATCH | `/api/users/{id}/password` | 修改密码（本人或 admin） | 登录 |

### 复合过滤示例

```
GET /api/materials?name=螺&category=五金&supplier_id=1
GET /api/stock/movements?material_id=1&movement_type=IN&from=2026-03-01&to=2026-03-31
```

---

## 项目结构

```
.
├── cmd/server/          # 程序入口
├── internal/
│   ├── config/          # 配置加载
│   ├── db/              # 数据库连接
│   ├── handler/         # HTTP 处理器与响应 DTO
│   ├── middleware/       # JWT 鉴权与 RBAC 中间件
│   ├── repository/      # sqlc 生成的数据访问层
│   ├── router/          # 路由注册
│   └── service/         # 业务逻辑层
├── migrations/          # 数据库迁移文件
├── queries/             # sqlc SQL 查询源文件
├── Makefile
├── sqlc.yaml
└── .env.example
```

---

## 开发说明

修改 `queries/` 下的 SQL 文件后，重新生成 repository 层：

```bash
make sqlc
```
