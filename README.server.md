# ⚙️ Server — Backend

Detailed documentation for the Live Bid backend: a **NestJS microservices** system with a GraphQL gateway, Redis-based transport, and PostgreSQL (via Drizzle ORM).

> 📖 For the project overview and client documentation, see the [main README](./README.md).

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [Services](#-services)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Database](#-database)
- [GraphQL API](#-graphql-api)
- [Authentication Flow](#-authentication-flow)
- [Inter-Service Communication](#-inter-service-communication)
- [Development Guidelines](#-development-guidelines)
- [Available Scripts](#-available-scripts)

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Gateway   │────▶│    Auth     │     │    Core     │
│  (GraphQL)  │     │  (Users,    │     │  (Auctions, │
│  :3001      │────▶│   Tokens)   │     │   Wallet)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────┴──────┐
                    │    Redis    │  (transport + cache + pub/sub)
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  PostgreSQL │  (via Drizzle ORM)
                    └─────────────┘
```

- **Gateway** exposes a public GraphQL API and communicates with internal services via **Redis transport** (`Transport.REDIS`).
- **Auth** and **Core** are pure microservices — no HTTP ports, no GraphQL. They listen on Redis channels for message patterns.
- **Redis** is used for three things: microservice transport, cache layer, and GraphQL subscriptions PubSub.
- **PostgreSQL** is the single source of truth, accessed through Drizzle ORM.

---

## 🧩 Services

| Service     | Mode               | Responsibility                                                  |
|-------------|--------------------|-----------------------------------------------------------------|
| **gateway** | HTTP + GraphQL     | Public API surface, guards, cache, throttling, WebSocket        |
| **auth**    | Redis microservice | Registration, login, JWT & refresh tokens, user CRUD            |
| **core**    | Redis microservice | Domain logic (auctions, wallet, chat) — **not yet implemented** |

> ⚠️ **Core service is currently a skeleton** (only `app.module.ts` + `main.ts`). Auction and wallet logic are planned for future releases.

---

## 📁 Project Structure

```
apps/
├── gateway/                  # GraphQL API (Apollo) + WebSocket
│   └── src/
│       ├── main.ts           # Bootstrap, CORS, helmet, cookies
│       ├── app.module.ts
│       ├── common/           # Decorators, guards, interceptors, filters, pipes
│       ├── graphql/
│       │   ├── graphql.module.ts
│       │   └── resolvers/
│       │       ├── auth/     # register, login, refresh, logout
│       │       └── health/
│       ├── lib/
│       │   ├── configs/      # env, apollo-driver, throttle, complexity
│       │   └── utils/        # get-req-res, normalize-client-info
│       └── types/
│
├── auth/                     # Authentication microservice
│   └── src/
│       ├── main.ts           # Redis microservice bootstrap
│       ├── app.module.ts
│       ├── lib/              # config, crypto utils
│       └── modules/
│           ├── auth/         # controller, service, repository, token util
│           └── user/         # controller, service, cache, repository
│
└── core/                     # (future) auctions, wallet, chat
    └── src/
        ├── main.ts
        └── app.module.ts

packages/
├── contracts/                # Shared between client & server
│   └── src/
│       ├── enums/            # UserRoleEnum, ...
│       ├── schemas/          # Zod schemas (auth, common)
│       └── messages/         # (reserved)
│
└── services/                 # Backend-only shared code
    └── src/
        ├── bootstrap/        # NestJS bootstrap helpers + colored logs
        ├── cache/            # Redis cache module & service
        ├── common/           # DB exception filter
        ├── database/         # Drizzle client, schema, seed
        ├── events/           # (reserved)
        ├── lib/              # logger config, exceptions, time utils
        ├── messages/         # Inter-service message patterns
        ├── names/            # Service & token name constants
        └── types/            # Request/response DTOs, gateway types

infra/docker-compose.yaml     # Postgres + Redis
migrations/                   # Drizzle-generated SQL migrations
```

### 📚 Shared Packages

| Package                 | Used By          | Purpose                                                      |
|-------------------------|------------------|--------------------------------------------------------------|
| **@live-bid/contracts** | Client + Server  | Single source of truth: Zod schemas, enums, shared types     |
| **@live-bid/services**  | Backend services | DB schema (Drizzle), cache, message patterns, internal types |

> **Rule of thumb:** Anything the client needs to know (validation rules, enums) lives in `contracts/`. Anything backend-only (DB schema, internal messaging) lives in `services/`.

---

## 📚 Tech Stack

### Core

| Tech                      | Version  | Description                  |
|---------------------------|----------|------------------------------|
| **@nestjs/core**          | ^11.0.1  | Backend framework            |
| **@nestjs/graphql**       | ^13.4.4  | GraphQL (code-first)         |
| **@apollo/server**        | ^5.5.1   | GraphQL server               |
| **graphql**               | ^16.14.2 | GraphQL runtime              |
| **@nestjs/microservices** | ^11.1.29 | Redis transport for services |

### Auth & Security

| Tech                         | Version | Description                     |
|------------------------------|---------|---------------------------------|
| **@nestjs/jwt**              | ^11.0.2 | JWT signing/verification        |
| **@nestjs/passport**         | ^11.0.5 | Passport strategy layer         |
| **passport-jwt**             | ^4.0.1  | JWT strategy                    |
| **bcrypt**                   | ^6.0.0  | Password hashing                |
| **helmet**                   | ^8.3.0  | HTTP security headers           |
| **cookie-parser**            | ^1.4.7  | Cookie parsing for tokens       |
| **@nestjs/throttler**        | ^6.5.0  | Rate limiting                   |
| **graphql-query-complexity** | ^2.0.0  | Prevent abusive GraphQL queries |

### Real-time

| Tech                            | Version  | Description                  |
|---------------------------------|----------|------------------------------|
| **@nestjs/websockets**          | ^11.1.29 | WebSocket layer (Socket.IO)  |
| **graphql-ws**                  | ^6.2.1   | GraphQL over WebSocket       |
| **graphql-redis-subscriptions** | ^2.7.0   | Redis-backed PubSub for subs |

### Database & Cache

| Tech            | Version  | Description               |
|-----------------|----------|---------------------------|
| **drizzle-orm** | ^0.45.2  | Type-safe ORM             |
| **pg**          | ^8.23.0  | PostgreSQL driver         |
| **ioredis**     | ^6.0.0   | Redis client              |
| **drizzle-kit** | ^0.31.10 | Migrations & studio (dev) |

### Validation & Observability

| Tech             | Version | Description                |
|------------------|---------|----------------------------|
| **zod**          | ^4.4.3  | Schema validation          |
| **nestjs-zod**   | ^5.5.0  | Zod integration for NestJS |
| **nestjs-pino**  | ^4.6.1  | Structured logging         |
| **pino-http**    | ^11.0.0 | HTTP request logging       |
| **pino-pretty**  | ^13.1.3 | Pretty logs (dev)          |
| **geoip-lite**   | ^2.0.3  | Client IP geolocation      |
| **ua-parser-js** | ^2.0.10 | Client device detection    |

### Tooling

| Tech             | Version   | Description              |
|------------------|-----------|--------------------------|
| **typescript**   | ^5.7.3    | Type safety              |
| **concurrently** | ^10.0.4   | Run services in parallel |
| **tsx**          | (via npx) | Run TS scripts           |

---

## ✅ Prerequisites

- **Node.js** `^20+`
- **npm** `^10+` (workspaces support)
- **Docker** & **Docker Compose** (for Postgres + Redis)
- **PostgreSQL 16** (via Docker)
- **Redis 7** (via Docker)

---

## 🔧 Environment Variables

Each service loads its own `.env` file from `apps/<service>/.env`. Copy the examples first:

```bash
cp .env.example .env                          # root (drizzle-kit)
cp apps/gateway/.env.example apps/gateway/.env
cp apps/auth/.env.example apps/auth/.env
cp apps/core/.env.example apps/core/.env
```

### Root (`.env`) — used by `drizzle-kit`

| Variable       | Example                                              | Description         |
|----------------|------------------------------------------------------|---------------------|
| `DATABASE_URL` | `postgresql://user:password@127.0.0.1:5432/live_bid` | Postgres connection |

### Gateway (`apps/gateway/.env`)

| Variable           | Default                 | Description                    |
|--------------------|-------------------------|--------------------------------|
| `PORT`             | `3001`                  | HTTP port                      |
| `HOST`             | `0.0.0.0`               | Bind address                   |
| `BASE_URL`         | `api`                   | Global path prefix             |
| `API_VERSION`      | `1`                     | URI versioning                 |
| `NODE_ENV`         | `development`           | Env mode                       |
| `FRONT_END_URL`    | `http://localhost:3000` | CORS origin                    |
| `APPLICATION_NAME` | `Live Bid`              | App name                       |
| `REDIS_HOST`       | `127.0.0.1`             | Redis host (transport + cache) |
| `REDIS_PORT`       | `6379`                  | Redis port                     |

### Auth (`apps/auth/.env`)

| Variable       | Default                                              | Description               |
|----------------|------------------------------------------------------|---------------------------|
| `NODE_ENV`     | `development`                                        | Env mode                  |
| `REDIS_HOST`   | `127.0.0.1`                                          | Redis host (transport)    |
| `REDIS_PORT`   | `6379`                                               | Redis port                |
| `JWT_EXPIRES`  | `7d`                                                 | Access token lifetime     |
| `JWT_SECRET`   | —                                                    | **Required**, 64-byte hex |
| `DATABASE_URL` | `postgresql://user:password@127.0.0.1:5432/live_bid` | Postgres connection       |

Generate a strong secret:

```bash
openssl rand -hex 64
# or
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Core (`apps/core/.env`)

Same as Auth minus JWT variables:

```env
NODE_ENV="development"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
DATABASE_URL="postgresql://user:password@127.0.0.1:5432/live_bid"
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure

```bash
docker compose -f infra/docker-compose.yaml up -d
```

This starts:

- **Postgres 16** on `localhost:5432` (db: `live_bid`, user: `user`, password: `password`)
- **Redis 7** on `localhost:6379`

### 3. Create the database

If you haven't already (or if you changed credentials), create the database:

```SQL
-- Connect: psql -h 127.0.0.1 -U user -d postgres
CREATE
DATABASE live_bid;
```

Or one-liner:

```bash
docker exec -it live-bid-postgres psql -U user -d postgres -c "CREATE DATABASE live_bid;"
```

### 4. Apply migrations

```bash
npm run db:migrate-dev
```

### 5. Start everything

```bash
npm run dev
```

This builds `packages/*` once, then runs all five processes in parallel: `contracts` (watch), `services` (watch), `gateway`, `auth`, `core`, and the web client.

**Output:**

```
✔ Gateway    → http://localhost:3001/api/v1/graphql
✔ WebSocket  → ws://localhost:3001/graphql
✔ Auth       → Redis microservice connected
✔ Core       → Redis microservice connected
```

### Run only backend

```bash
npm run dev:microservices    # gateway + auth + core + packages (no web)
```

### Run specific subsets

```bash
npm run dev:gateway-auth     # gateway + auth
npm run dev:gateway-core     # gateway + core
```

---

## 🗄️ Database

Schema lives in `packages/services/src/database/schema/`. Migrations are generated by **Drizzle Kit**.

### Common commands

```bash
# Generate a new migration from schema changes
npm run db:sync              # = db:generate + db:migrate-dev

# Or step-by-step
npm run db:generate          # generate SQL from schema
npm run db:migrate-dev       # apply pending migrations
npm run db:push              # push schema directly (dev-only, no migration file)
npm run db:studio            # open Drizzle Studio
npm run db:drop              # drop everything (dangerous)
```

### Base table convention

Every table inherits from `baseDrizzleTable` (in `packages/services/src/database/schema/common.ts`):

```ts
export const baseDrizzleTable = {
  id: uuid('id').primaryKey().$defaultFn(v7),                 // UUID v7
  created_at: timestamp("created_at", {withTimezone: true}).defaultNow(),
  updated_at: timestamp("updated_at", {withTimezone: true}).$onUpdateFn(() => new Date()),
};
```

### Example table

```ts
// packages/services/src/database/schema/user.schema.ts
export const user = pgTable("users", {
  ...baseDrizzleTable,
  password: varchar("password", {length: 255}).notNull(),
  email: varchar("email").notNull().unique(),
  username: varchar("username", {length: 255}).unique(),
  is_active: boolean("is_active").default(true).notNull(),
  display_name: varchar("display_name", {length: 60}).notNull(),
  role: userRoleEnum('role').notNull().default(UserRoleEnum.USER),
}, (table) => [
  index("users_is_active_role").on(table.is_active, table.role),
]);
```

---

## 🔌 GraphQL API

### Endpoint

```
http://localhost:3001/api/v1/graphql
```

> ⚠️ The `/api/v1` prefix is applied through `app.setGlobalPrefix("api")` + URI versioning. If you change `BASE_URL` or `API_VERSION` in `.env`, the path changes accordingly.

### Playground

- **Dev:** GraphiQL enabled at `/api/v1/graphql`
- **Prod:** disabled (`graphiql: false`, `introspection: false`)

### WebSocket (subscriptions)

```
ws://localhost:3001/graphql
```

Handled by `graphql-ws` via `GraphQLModule`. Subscriptions use `graphql-redis-subscriptions` — ready for live auction updates once `core` is implemented.

### Schema

The generated schema is written to `./schema.graphql` at the project root on each start. This file is consumed by:

- `graphql.config.yml` (editor tooling)
- The client (`clients/web`)

### Current schema (v0.1)

```graphql
type Query {
  health: String!
  healthCheck: HealthCheckOutput!
}

type Mutation {
  register(input: RegisterUserInput!): RegisterUserOutput!
  login(input: LoginUserInput!): LoginUserOutput!
  refresh: LoginUserOutput!
  logout: String!
}

enum UserRoleEnum {
  ADMIN
  OWNER
  USER
}
```

### Error format

All GraphQL errors are normalized by `formatError` in `apollo-driver.config.ts`:

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "UNAUTHORIZED",
        "statusCode": 401,
        "originalError": {}
      }
    }
  ]
}
```

The `RpcException` filter (`GraphqlExceptionFilter`) converts microservice errors into this shape.

---

## 🔐 Authentication Flow

Live Bid uses **access + refresh tokens**, both stored as **HTTP-only cookies**.

### Token model

| Token       | Location | Lifetime                              | Purpose                        |
|-------------|----------|---------------------------------------|--------------------------------|
| **Access**  | Cookie   | 15m (configurable)                    | Signed JWT, sent with requests |
| **Refresh** | Cookie   | 12h (default) / 7d (`remember: true`) | Opaque token, rotated on use   |

### Cookie attributes

From `apps/auth/src/modules/auth/utils/token.util.ts`:

```typescript
{
  httpOnly: true,
  sameSite: isProduction ? "strict" : "lax",
  secure: isProduction,
  path: "/",
  maxAge: <token-specific>,
}
```

### Flow

```
1. Client sends mutation `login(input)`
       ↓
2. Gateway validates input via ZodPipe (LoginUserSchema)
       ↓
3. Gateway forwards to Auth via Redis (AUTH_PATTERNS.LOGIN)
       ↓
4. Auth verifies credentials, generates:
       - accessToken  (JWT)
       - refreshToken (opaque: "<userId>:<random>")
       - stores SHA-256 hash of refreshToken in DB
       ↓
5. Auth returns: { user, accessToken, refreshToken, accessOptions, refreshOptions }
       ↓
6. Gateway sets both as HTTP-only cookies (using accessOptions/refreshOptions)
       ↓
7. Client receives `SafeUser` (no tokens in body)
```

### Guards on every request

Guards are applied **globally** in `apps/gateway/src/app.module.ts`, in this order:

1. `GraphqlThrottleGuard` — rate limiting (Redis-backed)
2. `AccessTokenGuard` — verifies access JWT from cookie
3. `RoleGuard` — checks user role against `@Roles()` decorator

Public endpoints opt-out via `@Public()` decorator.

### Refresh flow

The `refresh` mutation uses `RefreshGuard`, which:

1. Extracts `refreshToken` cookie
2. Calls Auth service to validate (`AUTH_PATTERNS.VALIDATE_REFRESH_TOKEN`)
3. Rotates the refresh token (revokes old, issues new)
4. Sets fresh cookies

### Logout flow

- Public endpoint (`@Public`)
- Uses `emit` (fire-and-forget) to revoke the refresh token in Auth
- Clears both cookies immediately
- Returns `"User logged out successfully."` without waiting for Auth

---

## 🔌 Inter-Service Communication

Microservices communicate via **NestJS `ClientProxy`** over **Redis transport**.

### Message patterns

Defined in `packages/services/src/messages/`:

```ts
// packages/services/src/messages/auth.messages.ts
export const AUTH_PATTERNS = {
  REGISTER: "auth.register",
  LOGIN: "auth.login",
  VALIDATE_REFRESH_TOKEN: "auth.vaildate_refresh_token",
  REFRESH: "auth.refresh",
  LOGOUT: "auth.logout",
} as const;
```

> ⚠️ `VALIDATE_REFRESH_TOKEN` has a typo (`vaildate`). It's the current contract — change it in both `messages/` and `auth.controller.ts` if you fix it.

### Service names

```ts
// packages/services/src/names/service.names.ts
export const CORE_SERVICE_NAME = "CORE_SERVICE";
export const AUTH_SERVICE_NAME = "AUTH_SERVICE";
```

### Token names (cookie keys)

```ts
// packages/services/src/names/token.names.ts
export const ACCESS_TOKEN_NAME = "accessToken";
export const REFRESH_TOKEN_NAME = "refreshToken";
```

### Request-response vs. event

| Pattern                                              | Use case                                    |
|------------------------------------------------------|---------------------------------------------|
| `client.send(pattern, data)` + `firstValueFrom(...)` | Request-response (login, register, refresh) |
| `client.emit(pattern, data)`                         | Fire-and-forget (logout — no blocking)      |

### Redis transport options

From `apps/gateway/src/graphql/graphql.module.ts`:

```typescript
{
  transport: Transport.REDIS,
  options: {
    host: config.get<string>("REDIS_HOST"),
    port: Number(config.get<string>("REDIS_PORT") || 6973),
    retryAttempts: 5,
    retryDelay: 1000,
    retryStrategy: () => 1000,
  },
}
```

> ⚠️ Fallback port is **6973** in gateway (likely a typo for 6379). Auth and Core default to **6379**. Make sure `REDIS_PORT` is set explicitly in `apps/gateway/.env` to avoid
> mismatched connections.

---

## 📖 Development Guidelines

A quick reference for where to place code when adding new features.

### Adding a new endpoint (GraphQL mutation/query)

| Concern                     | Location                                                               |
|-----------------------------|------------------------------------------------------------------------|
| **Zod schema** (validation) | `packages/contracts/src/schemas/<domain>/<action>.schema.ts`           |
| **Enum** (shared values)    | `packages/contracts/src/enums/<name>.enum.ts`                          |
| **DB table** (Drizzle)      | `packages/services/src/database/schema/<table>.schema.ts`              |
| **Message pattern**         | `packages/services/src/messages/<service>.messages.ts`                 |
| **Request/Response types**  | `packages/services/src/types/services-request/` & `services-response/` |
| **Resolver** (gateway)      | `apps/gateway/src/graphql/resolvers/<domain>/`                         |
| **Resolver Input/Output**   | `.../resolvers/<domain>/<domain>/inputs/` & `outputs/`                 |
| **Service logic**           | `apps/<service>/src/modules/<domain>/`                                 |

### Setup checklist for a new feature

1. **Contract** — define Zod schema + enum in `packages/contracts`
2. **DB** — define Drizzle table in `packages/services/src/database/schema/`
3. **Migration** — run `npm run db:sync`
4. **Message pattern** — add to `packages/services/src/messages/`
5. **Types** — request/response in `packages/services/src/types/`
6. **Service** — implement logic in the target microservice (`apps/auth` or `apps/core`)
7. **Gateway resolver** — expose via GraphQL in `apps/gateway/src/graphql/resolvers/`
8. **Client** — consume via Apollo in `clients/web`

### Example: The `login` flow, end to end

```
Client mutation login(input)
       ↓
gateway AuthResolver            ← ZodPipe(LoginUserSchema) validates input
       ↓ (authClient.send AUTH_PATTERNS.LOGIN)
auth AuthService                ← bcrypt compare + token generation
       ↓ (Drizzle)
PostgreSQL
       ↓
auth → { user, accessToken, refreshToken, accessOptions, refreshOptions }
       ↓
gateway → res.cookie(ACCESS_TOKEN_NAME, ...) + res.cookie(REFRESH_TOKEN_NAME, ...)
       ↓
client ← SafeUser
```

**Files involved:**

| Layer                 | File                                                      |
|-----------------------|-----------------------------------------------------------|
| Contract              | `contracts/schemas/auth/login.schema.ts`                  |
| GraphQL input         | `gateway/.../auth/inputs/login.input.ts`                  |
| GraphQL output        | `gateway/.../auth/outputs/login.output.ts`                |
| Resolver              | `gateway/.../auth/auth.resolver.ts`                       |
| Message pattern       | `services/messages/auth.messages.ts`                      |
| Service request type  | `services/types/services-request/auth/login.request.ts`   |
| Service response type | `services/types/services-response/auth/login.response.ts` |
| Service logic         | `auth/modules/auth/services/auth.service.ts`              |
| DB schema             | `services/database/schema/user.schema.ts`                 |

---

## 🧰 Available Scripts

### Development

| Script                      | Description                                       |
|-----------------------------|---------------------------------------------------|
| `npm run dev`               | Build packages + run all services and web         |
| `npm run dev:all`           | Same as `dev` but **without** rebuilding packages |
| `npm run dev:microservices` | gateway + auth + core + packages (no web)         |
| `npm run dev:gateway-auth`  | gateway + auth + packages                         |
| `npm run dev:gateway-core`  | gateway + core + packages                         |
| `npm run dev:gateway`       | only gateway                                      |
| `npm run dev:auth`          | only auth                                         |
| `npm run dev:core`          | only core                                         |
| `npm run dev:web`           | only web client                                   |
| `npm run dev:packages`      | watch contracts + services                        |

### Build

| Script                    | Description                 |
|---------------------------|-----------------------------|
| `npm run build:all`       | Build every app and package |
| `npm run build:packages`  | Build contracts + services  |
| `npm run build:contracts` | Build contracts only        |
| `npm run build:services`  | Build services only         |
| `npm run build:gateway`   | Build gateway only          |
| `npm run build:auth`      | Build auth only             |
| `npm run build:core`      | Build core only             |
| `npm run build:web`       | Build web client            |

### Database

| Script                    | Description                                 |
|---------------------------|---------------------------------------------|
| `npm run db:generate`     | Generate SQL migration from schema changes  |
| `npm run db:migrate-dev`  | Apply pending migrations                    |
| `npm run db:migrate-prod` | Run migrations via `seed/migrate.ts` (prod) |
| `npm run db:push`         | Push schema directly (dev, no migration)    |
| `npm run db:sync`         | `db:generate` + `db:migrate-dev`            |
| `npm run db:studio`       | Open Drizzle Studio                         |
| `npm run db:drop`         | Drop everything (dangerous)                 |

---

## 🛡️ Highlights

- **Zod-first contracts** — schemas shared between client & server via `@live-bid/contracts`
- **Global guards** — throttle, access token, role — applied at module level
- **Caching decorators** — `@Cacheable()` / `@CacheEvict()` for resolver-level caching
- **Redis PubSub** — ready for GraphQL subscriptions (auction updates)
- **HTTP-only cookie tokens** — no token leakage through client JavaScript
- **Client info tracking** — IP, device, geo, language via `@NormalizeClientInfo()` decorator
- **Structured logging** — `nestjs-pino` with pretty output in dev
- **Type-safe DB** — Drizzle ORM with inferred types
- **Colored bootstrap logs** — visual confirmation when each service starts

---

## 🗺️ Roadmap (Backend)

- [x] Auth microservice (register, login, refresh, logout)
- [x] Gateway GraphQL API + guards + throttling
- [x] Redis transport + cache module
- [x] Drizzle schema + migrations
- [ ] Core microservice — auctions (create, list, bid)
- [ ] Core microservice — wallet (balance, transactions)
- [ ] GraphQL subscriptions for live bidding
- [ ] Per-auction chat over WebSocket
- [ ] Admin endpoints (user management, moderation)

---

_See the [main README](./README.md) for project overview and client documentation._
