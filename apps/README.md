# 📦 `apps/README.md`

Backend services overview for the Live Bid monorepo. This folder contains three NestJS applications forming a single system: one public **gateway** and two internal
**microservices** communicating over Redis.

> 📖 For full backend setup, environment, and database details, see [`README.server.md`](../README.server.md).
> 📖 For project overview and client, see the [main README](../README.md).

---

## 🧭 Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS (web)                        │
└────────────────────────────────┬────────────────────────────┘
                                 │ GraphQL (HTTP + WS)
                                 ▼
                      ┌─────────────────────┐
                      │      gateway        │  ← public, port 3001
                      │   (Apollo GraphQL)  │
                      └──────────┬──────────┘
                                 │ Redis transport
                 ┌───────────────┼───────────────┐
                 ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │      auth       │             │      core       │
        │  (users/tokens) │             │  (auctions)     │  ← not implemented yet
        └─────────────────┘             └─────────────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                      ┌─────────────────────┐
                      │  Postgres  +  Redis │
                      └─────────────────────┘
```

---

## 🧩 Services

| Service     | Type               | Entry file            | Responsibility                                   |
|-------------|--------------------|-----------------------|--------------------------------------------------|
| **gateway** | HTTP + GraphQL     | `gateway/src/main.ts` | Public API, auth guards, throttling, caching, WS |
| **auth**    | Redis microservice | `auth/src/main.ts`    | Registration, login, refresh tokens, user CRUD   |
| **core**    | Redis microservice | `core/src/main.ts`    | Auctions, wallet, chat — **skeleton only**       |

### Key differences

- **`gateway`** — only service with an HTTP server. Owns the public GraphQL API surface. Never talks to the DB directly; delegates to services via Redis.
- **`auth`** — no HTTP. Listens on Redis for auth-related message patterns. Owns the `users` and `refresh_tokens` tables.
- **`core`** — no HTTP. Placeholder for the auction domain. Currently only boots up and connects to Redis; no handlers.

---

## 🔗 Communication

Services never call each other directly. Gateway uses NestJS `ClientProxy` over **Redis transport**:

```ts
// gateway → auth
authClient.send(AUTH_PATTERNS.LOGIN, {userData, clientInfo})
authClient.emit(AUTH_PATTERNS.LOGOUT, {rawRefreshTokenId})
```

Message patterns and service names live in `packages/services`:

| File                                              | Purpose                                   |
|---------------------------------------------------|-------------------------------------------|
| `packages/services/src/messages/auth.messages.ts` | `AUTH_PATTERNS`                           |
| `packages/services/src/names/service.names.ts`    | `AUTH_SERVICE_NAME`, `CORE_SERVICE_NAME`  |
| `packages/services/src/names/token.names.ts`      | `ACCESS_TOKEN_NAME`, `REFRESH_TOKEN_NAME` |

> ⚠️ **Never hardcode message patterns or service names** in `apps/*`. Import from `@live-bid/services/messages` and `@live-bid/services/names`.

---

## 🧱 Shared Code

Both `gateway` and the microservices rely on two workspace packages:

| Package                 | Purpose                                                    |
|-------------------------|------------------------------------------------------------|
| **@live-bid/contracts** | Zod schemas, enums — shared with the web client            |
| **@live-bid/services**  | DB schema, cache module, message patterns, bootstrap utils |

### Path aliases

`tsconfig.json` exposes short imports for every app and package:

```ts
import {AUTH_PATTERNS} from "@live-bid/services/messages";     // → packages/services/src/messages
import {UserRoleEnum} from "@live-bid/contracts/enums";        // → packages/contracts/src/enums
import {AccessGuard} from "@app/gateway/common";               // → apps/gateway/src/common
import {TokenUtil} from "@app/auth/lib";                       // → apps/auth/src/lib
```

| Alias                 | Maps to                  |
|-----------------------|--------------------------|
| `@app/gateway/*`      | `apps/gateway/src/*`     |
| `@app/auth/*`         | `apps/auth/src/*`        |
| `@app/core/*`         | `apps/core/src/*`        |
| `@live-bid/contracts` | `packages/contracts/src` |
| `@live-bid/services`  | `packages/services/src`  |

> ⚠️ Apps must **not** import from each other's `src` directly (`@app/auth/*` inside gateway is forbidden). Cross-app imports go through the shared `@live-bid/*` packages.

---

## 📁 Folder Structure

```
apps/
├── gateway/                  # Public GraphQL API
│   └── src/
│       ├── main.ts           # HTTP bootstrap
│       ├── app.module.ts     # Guards, interceptors, filters applied globally
│       ├── common/           # Decorators, guards, interceptors, pipes, filters
│       ├── graphql/          # Apollo module + resolvers
│       └── lib/              # Configs (env, apollo, throttle) + utils
│
├── auth/                     # Auth microservice
│   └── src/
│       ├── main.ts           # Redis microservice bootstrap
│       ├── app.module.ts
│       ├── lib/              # Config, crypto utils
│       └── modules/
│           ├── auth/         # controller, service, repository, token util
│           └── user/         # controller, service, cache, repository
│
└── core/                     # (future) auctions, wallet, chat
    └── src/
        ├── main.ts
        └── app.module.ts
```

Each app has its own `tsconfig.app.json` referenced by `nest-cli.json` (NestJS monorepo mode).

---

## 🧭 NestJS Monorepo Config

`nest-cli.json` declares three NestJS projects:

```json
{
  "monorepo": true,
  "projects": {
    "gateway": {
      "root": "apps/gateway",
      "sourceRoot": "apps/gateway/src"
    },
    "auth": {
      "root": "apps/auth",
      "sourceRoot": "apps/auth/src"
    },
    "core": {
      "root": "apps/core",
      "sourceRoot": "apps/core/src"
    }
  }
}
```

Build and run individual apps:

```bash
nest build gateway           # or: npm run build:gateway
nest start gateway --watch   # or: npm run dev:gateway
```

---

## 📖 Per-Service Docs

| Service     | README                                          |
|-------------|-------------------------------------------------|
| **gateway** | [`apps/gateway/README.md`](./gateway/README.md) |
| **auth**    | [`apps/auth/README.md`](./auth/README.md)       |
| **core**    | [`apps/core/README.md`](./core/README.md)       |

---

## 🗺️ Adding a New Service

If you're adding a fourth microservice (e.g. `notifications`):

1. Create `apps/notifications/` with `src/main.ts` and `src/app.module.ts`
2. Add an entry to `nest-cli.json` under `projects`
3. Add path alias in root `tsconfig.json` (`@app/notifications/*`)
4. Register the service name in `packages/services/src/names/service.names.ts`
5. Add message patterns in `packages/services/src/messages/notifications.messages.ts`
6. Register the client in `apps/gateway/src/graphql/graphql.module.ts`
7. Add `dev:notifications` and `build:notifications` scripts in root `package.json`
8. Add the service to the `concurrently` commands (`dev:microservices`, `dev:all`)

---

## 🛡️ Conventions

- **No cross-app imports** — use `@live-bid/*` packages instead
- **No DB access from gateway** — always go through a service
- **No HTTP in microservices** — they only speak Redis transport
- **Message patterns in `packages/services/messages`** — never inline strings
- **Service names in `packages/services/names`** — never inline strings
- **Bootstrap logs** — use `thenBootstraps` / `microserviceBootstraps` from `@live-bid/services/bootstrap` for consistent colored output
