# 🧪 `apps/core/README.md`

The **core** microservice of Live Bid — a **skeleton** at the moment, reserved for the auction domain (auctions, bidding, wallet, chat). It already boots correctly and connects to
Redis, Postgres, and the cache layer, so implementing the domain is a matter of adding modules, not infrastructure.

> 📖 For overall backend architecture, see [`apps/README.md`](../README.md).
> 📖 For full backend setup and environment, see [`README.server.md`](../../README.server.md).
> 📖 For a fully-implemented microservice example, see [`apps/auth/README.md`](../auth/README.md).

---

## 🧭 Overview

```
gateway (GraphQL)
       │  Redis transport
       ▼
┌──────────────────────────────────────┐
│               core                   │
│                                      │
│  (no controllers yet)                │
│  (no services yet)                   │
│                                      │
│  AppModule                           │
│   ├── ConfigModule  ← apps/core/.env │
│   ├── LoggerModule  ← pino           │
│   ├── CacheModule   ← Redis          │
│   └── DrizzleModule ← Postgres       │
└──────────────────────────────────────┘
       │                      │
       ▼                      ▼
  PostgreSQL              Redis (cache)
```

**Status:** bootstraps successfully — but listens to no message patterns and exposes no handlers.

---

## 📁 Structure

```
apps/core/src/
├── main.ts          # Redis microservice bootstrap + DbExceptionFilter
└── app.module.ts    # Config, Logger, Cache, Drizzle (no domain modules)
```

That's the entire source. Two files. The service exists so that **infrastructure-level integration** (env, logger, cache, DB) is verified and stable before domain code is added.

---

## ⚙️ What's Already Wired

### `main.ts`

```ts
const REDS_HOST = process.env.REDS_HOST || "127.0.0.1";
const REDS_PORT = Number(process.env.REDS_PORT || 6379) || 6379;

await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.REDIS,
  options: {
    host: REDS_HOST,
    port: REDS_PORT,
    retryAttempts: 5,
    retryDelay: 1000,
    retryStrategy: () => 1000,
  },
});

app.useGlobalFilters(new DbExceptionFilter());
await app.listen();
```

- **Transport** — `Transport.REDIS`
- **Global filter** — `DbExceptionFilter` (converts Drizzle errors into RPC exceptions)
- **Bootstrap log** — via `microserviceBootstraps` (colored output, consistent with auth)

> ⚠️ Environment variable names are `REDS_HOST` / `REDS_PORT` here — **not** `REDIS_HOST` / `REDIS_PORT` like in `gateway` and `auth`. This is a typo carried into the code. Either
> rename them in `apps/core/.env` and `main.ts`, or keep them — but be aware of the inconsistency. `apps/core/.env.example` still uses `REDIS_HOST` / `REDIS_PORT`, so **the values
from `.env` are currently ignored** — only the fallback (`127.0.0.1:6379`) is used.

### `app.module.ts`

```ts

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, envFilePath: "apps/core/.env"}),
    LoggerModule.forRoot(process.env.NODE_ENV !== "production" ? loggerConfig : undefined),
    CacheModule,
    DrizzleModule.forRoot(drizzleSchemas),
  ],
})
export class AppModule {}
```

| Import          | Purpose                                                                         |
|-----------------|---------------------------------------------------------------------------------|
| `ConfigModule`  | Loads `apps/core/.env` globally                                                 |
| `LoggerModule`  | Pino logger — pretty in dev, JSON in prod                                       |
| `CacheModule`   | Redis client via `@live-bid/services/cache`                                     |
| `DrizzleModule` | Drizzle ORM instance with all schemas from `@live-bid/services/database/schema` |

**No domain modules are registered.** No `controllers`, no `providers`, no `exports`.

---

## 🗄️ Database

The `core` service already imports **all Drizzle schemas** via:

```ts
import * as drizzleSchemas from "@live-bid/services/database/schema";
```

Currently, the schemas folder contains only:

| Table            | Owner | Migration                                      |
|------------------|-------|------------------------------------------------|
| `users`          | auth  | `0000_sharp_shotgun`                           |
| `refresh_tokens` | auth  | `0001_faithful_anthem`, `0002_overrated_rhino` |

When you add auction / wallet / chat tables, they **also go into `packages/services/src/database/schema/`** — not into `apps/core`. Both `auth` and `core` share the same Drizzle
instance backed by the same schemas, so adding a table in one place makes it available to both.

**Migration pipeline** (from root `drizzle.config.ts`):

```
schema: './packages/services/src/database/schema/index.ts'
out:    './migrations'
```

New tables → `npm run db:sync` → new `.sql` file in `migrations/` → applied via `npm run db:migrate-dev`.

---

## 🧱 How to Add a Domain (Auction Example)

The `core` service is designed to mirror `auth`'s structure. To implement auctions:

### 1. Add the DB table

`packages/services/src/database/schema/auction.schema.ts`

```ts
import {baseDrizzleTable} from "./common";
import {boolean, index, pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const auction = pgTable("auctions", {
  ...baseDrizzleTable,
  owner_id: uuid("owner_id").notNull().references(() => user.id),
  title: varchar("title", {length: 200}).notNull(),
  ends_at: timestamp("ends_at", {withTimezone: true}).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
}, (table) => [
  index("auctions_owner_active").on(table.owner_id, table.is_active),
]);
```

Then `npm run db:sync`.

### 2. Add contract schemas

`packages/contracts/src/schemas/auction/create.schema.ts`

```ts
export const CreateAuctionSchema = z.object({
  title: z.string().min(3).max(200),
  ends_at: z.coerce.date(),
});
```

### 3. Add message patterns

`packages/services/src/messages/core.messages.ts`

```ts
export const CORE_PATTERNS = {
  CREATE_AUCTION: "core.create_auction",
  LIST_AUCTIONS: "core.list_auctions",
  PLACE_BID: "core.place_bid",
} as const;
```

### 4. Add request/response types

`packages/services/src/types/services-request/core/create-auction.request.ts`

`packages/services/src/types/services-response/core/auction.response.ts`

### 5. Add module in `apps/core`

```
apps/core/src/modules/auction/
├── auction.module.ts
├── auction.controller.ts        # @MessagePattern(CORE_PATTERNS.CREATE_AUCTION) etc.
├── auction.repository.ts
└── services/auction.service.ts
```

Register `AuctionModule` in `apps/core/src/app.module.ts`.

### 6. Add resolvers in gateway

`apps/gateway/src/graphql/resolvers/auction/`

Wire `CORE_SERVICE_NAME` client (already registered in `graphql.module.ts`) and add resolvers.

---

## 🔄 Communication Contract

The gateway already knows how to talk to `core`:

```ts
// apps/gateway/src/graphql/graphql.module.ts
{
  name: CORE_SERVICE_NAME,        // "CORE_SERVICE
  useFactory:(config) => ({
    transport: Transport.REDIS,
    options: {
      host: config.get("REDIS_HOST"),
      port: Number(config.get("REDIS_PORT") || 6973),
      retryAttempts: 5,
      retryDelay: 1000,
      retryStrategy: () => 1000,
    },
  }),
}
```

So as soon as `core` starts listening on `CORE_PATTERNS.*` (and both services share the same Redis), it becomes reachable. **No gateway changes needed for `core` to go live** —
just implement the handlers.

> ⚠️ Same typo as gateway: fallback port is `6973` (should be `6379`). Set `REDIS_PORT` explicitly in `apps/gateway/.env` to avoid mismatch.

---

## ⚠️ Known Issues / Cleanups

Before adding domain code, consider fixing:

| Issue                                          | Location                      | Fix                                                                                      |
|------------------------------------------------|-------------------------------|------------------------------------------------------------------------------------------|
| `REDS_HOST` / `REDS_PORT` typo                 | `apps/core/src/main.ts`       | Rename to `REDIS_HOST` / `REDIS_PORT` to match `.env.example`                            |
| `REDS_HOST` default ignores `.env`             | Same                          | Once renamed, values from `apps/core/.env` will load                                     |
| No `tsconfig.app.json` include of `packages/*` | `apps/core/tsconfig.app.json` | Inherited from root `tsconfig.json` — verify `@live-bid/*` paths resolve at compile time |
| Empty `AppModule` with no `controllers`        | `apps/core/src/app.module.ts` | Expected — will populate with modules                                                    |
| No health check for `core`                     | —                             | Consider a `@MessagePattern("core.health")` handler for gateway probes                   |

---

## 🗺️ Roadmap (Core)

### Phase 1 — Auctions (MVP)

- [ ] `auction` table + migration
- [ ] Create auction (`CORE_PATTERNS.CREATE_AUCTION`)
- [ ] List auctions (paginated, filter by status)
- [ ] Get single auction by id
- [ ] Update / cancel own auction
- [ ] Gateway resolvers for auctions

### Phase 2 — Bidding

- [ ] `bid` table + migration
- [ ] Place bid (`CORE_PATTERNS.PLACE_BID`) — validates auction active, minimum increment
- [ ] Bid history per auction
- [ ] Auto-close auctions when `ends_at` passes (cron or Redis TTL)
- [ ] GraphQL subscriptions for live bid updates (`graphql-redis-subscriptions`)

### Phase 3 — Wallet

- [ ] `wallet` table + migration
- [ ] `wallet_transactions` table (ledger-style)
- [ ] Deposit / withdraw
- [ ] Escrow for bids (hold funds during active auction)
- [ ] Payout to winner on auction close

### Phase 4 — Chat

- [ ] `chat_message` table
- [ ] Send message per auction (WebSocket via gateway)
- [ ] Message history
- [ ] Moderation tools

### Phase 5 — Admin

- [ ] Admin endpoints (list users, ban, force close auctions)
- [ ] Role-based access via `@Role({requiredRole: ADMIN, strict: true})`

---

## 🛡️ Conventions

- **Do not add business logic to `apps/core` yet** — get the infrastructure right first
- **Schemas go in `packages/services/database/schema/`** — never in `apps/core`
- **Message patterns go in `packages/services/messages/core.messages.ts`** — never inline
- **Request/response types go in `packages/services/types/`** — shared with gateway
- **Zod schemas go in `packages/contracts/schemas/`** — shared with client
- **Follow `apps/auth`'s module layout** — controller → service → repository → cache
- **Register `AuctionModule` (etc.) in `app.module.ts`** — nothing is auto-discovered
- **Use `DbExceptionFilter`** (already global) — don't duplicate DB error handling
- **Use `microserviceBootstraps`** for consistent colored startup logs

---

## 🧭 Where to Look for Reference

When implementing, mirror these files from `auth`:

| Concern          | Auth reference                                                         |
|------------------|------------------------------------------------------------------------|
| Module structure | `apps/auth/src/modules/auth/auth.module.ts`                            |
| Message handlers | `apps/auth/src/modules/auth/auth.controller.ts`                        |
| Business logic   | `apps/auth/src/modules/auth/services/auth.service.ts`                  |
| Drizzle queries  | `apps/auth/src/modules/auth/auth.repository.ts`                        |
| Cache-aside      | `apps/auth/src/modules/user/services/user-cache.service.ts`            |
| Exceptions       | `apps/auth/src/modules/auth/services/auth.service.ts` (`AppException`) |
| Transactions     | `apps/auth/src/modules/auth/auth.repository.ts` (`rotateToken`)        |

---

_See the [main README](../../README.md), [`README.server.md`](../../README.server.md), and [`apps/README.md`](../README.md) for the bigger picture._
