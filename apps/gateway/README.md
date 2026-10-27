# 🌐 `apps/gateway/README.md`

The public GraphQL gateway of Live Bid. Owns the API surface, enforces authentication, applies rate limiting and caching, and delegates all business logic to internal microservices
over Redis.

> 📖 For overall backend architecture, see [`apps/README.md`](../README.md).
> 📖 For full backend setup and environment, see [`README.server.md`](../../README.server.md).
> 📖 For auth service internals, see [`apps/auth/README.md`](../auth/README.md).

---

## 🧭 Overview

```
┌────────────────────────────────────────────────────────────┐
│                          Client                            │
└──────────────────────────────┬─────────────────────────────┘
                               │ HTTP + WebSocket (GraphQL)
                               ▼
┌────────────────────────────────────────────────────────────┐
│                        gateway                             │
│                                                            │
│  Global:  ThrottleGuard → AccessTokenGuard → RoleGuard    │
│           CacheableInterceptor, CacheEvictInterceptor     │
│           GraphqlExceptionFilter                          │
│                                                            │
│  Resolver  ──▶  ClientProxy (Redis)  ──▶  auth / core     │
└────────────────────────────────────────────────────────────┘
```

- **Only HTTP-exposed service** — `http://localhost:3001/api/v1/graphql`
- **No DB access** — all persistence goes through microservices
- **Global guards/interceptors/filters** applied at module level, opt-out via decorators
- **WebSocket** — `graphql-ws` enabled for subscriptions (ready for live bidding once `core` exists)

---

## 📁 Structure

```
apps/gateway/src/
├── main.ts                        # HTTP bootstrap, CORS, helmet, cookies
├── app.module.ts                  # Global guards/interceptors/filters
├── app.controller.ts              # Root + /health endpoints (version-neutral)
│
├── common/                        # Cross-cutting concerns
│   ├── decorators/
│   │   ├── public.decorator.ts           # @Public() — bypass guards
│   │   ├── role.decorator.ts             # @Role({requiredRole, strict})
│   │   ├── current-user.decorator.ts     # @CurrentUser() — inject user
│   │   ├── client-info.decorator.ts      # @NormalizeClientInfo()
│   │   ├── cacheable.decorator.ts        # @Cacheable({...})
│   │   └── cache-evict.decorator.ts      # @CacheEvict({...})
│   ├── guards/
│   │   ├── access.guard.ts               # verify access JWT
│   │   ├── role.guard.ts                 # check user role
│   │   ├── refresh.guard.ts              # verify refresh token (via auth)
│   │   └── graphql-throttle.guard.ts     # rate limiting (Redis-backed)
│   ├── interceptors/
│   │   ├── cacheable.interceptor.ts      # store result in Redis
│   │   └── cache-evict.interceptor.ts    # delete matching cache keys
│   ├── filters/
│   │   ├── gateway.filter.ts             # GatewayException (GraphQLError)
│   │   └── graphql-exception.filter.ts   # normalize RPC errors → GraphQL
│   ├── pipes/
│   │   └── zod.pipe.ts                   # validate input via Zod
│   ├── strategies/
│   │   └── access.strategy.ts            # Passport JWT strategy
│   └── index.ts                          # barrel
│
├── graphql/
│   ├── graphql.module.ts                 # Apollo + Redis ClientProxy
│   └── resolvers/
│       ├── auth/
│       │   └── auth/
│       │       ├── auth.resolver.ts      # login, register, refresh, logout
│       │       ├── decorators/           # @RegisterDecorators(), etc.
│       │       ├── inputs/               # @InputType classes
│       │       └── outputs/              # @ObjectType classes
│       └── health/
│           ├── health.resolver.ts
│           └── outputs/health-check.output.ts
│
├── lib/
│   ├── configs/
│   │   ├── env.ts                        # load apps/gateway/.env
│   │   ├── apollo-driver.config.ts       # schema, subscriptions, formatError
│   │   ├── throttle.config.ts            # rate-limit limits
│   │   └── complexity-custom.ts          # max query complexity
│   └── utils/
│       ├── get-req-res.graphql.ts        # extract req/res from GQL context
│       ├── normalize-client-info.ts      # IP/UA/geo/lang → clientInfo
│       └── outputs.ts
│
└── types/                                # GraphQL-specific types
```

---

## 🧩 Resolvers

Resolvers are **thin** — they validate input, call a microservice, and format the output. Business logic always lives in the target service.

| Resolver         | Queries / Mutations                        | Public?   | Notes                                          |
|------------------|--------------------------------------------|-----------|------------------------------------------------|
| `AuthResolver`   | `register`, `login`, `refresh`, `logout`   | Yes (all) | Sets/clears cookies; delegates to auth service |
| `HealthResolver` | `health`, `healthCheck`                    | Yes       | Basic liveness probes                          |
| `AppController`  | `GET /`, `GET /health` (HTTP, not GraphQL) | —         | Version-neutral, outside `/api/v1`             |

### Example: `login` in `AuthResolver`

```ts
@Decorators.LoginDecorators()
@Mutation(() => AuthOutputs.LoginUserOutput)
async login(
  @Args("input", {type: () => AuthInputs.LoginUserInput},
    new ZodPipe(ZodSchemas.LoginUserSchema)) input: LoginUserSchemaType,
@Context() context: GraphQLContext,
@NormalizeClientInfo() clientInfo: NormalizeClientInfoType
): Promise<SafeUser> {
  const result = await firstValueFrom<LoginResponseService>(
    this.authClient.send(AUTH_PATTERNS.LOGIN, {
      clientInfo,
      userData: input,
    })
  );

  const {res} = context;
  const {user, accessToken, refreshToken, accessOptions, refreshOptions} = result;

  res.cookie(ACCESS_TOKEN_NAME,  accessToken,  accessOptions);
  res.cookie(REFRESH_TOKEN_NAME, refreshToken, refreshOptions);

  return user;
}
```

**Pattern to follow for every new resolver:**

1. Decorate with the right guard combination (or `@Public()`)
2. Validate input with `new ZodPipe(Schema)`
3. `client.send(PATTERN, payload)` + `firstValueFrom(...)`
4. Transform response (e.g., set cookies, hide fields)
5. Return a GraphQL output type

---

## 🛡️ Global Guards

Guards are registered in `app.module.ts` and run **in this order** for every request:

```
1. GraphqlThrottleGuard   ← rate limit (per tracker: IP + user)
2. AccessTokenGuard       ← verify access JWT from cookie or Bearer header
3. RoleGuard              ← verify role meets requirement
```

Then **interceptors** run:

```
CacheableInterceptor      ← return cached result if key exists
CacheEvictInterceptor     ← after mutation, invalidate cache keys
```

### `AccessTokenGuard`

Extends `AuthGuard('jwt-access')`, calls Passport strategy `AccessStrategy`.

- **Extraction** — cookie `accessToken` first, then `Authorization: Bearer ...`
- **Opt-out** — `@Public({makePublicAccessGuard: true})` (default for `@Public()`)
- **On failure** — throws `AppException({statusCode: 401, code: "ACCESS_TOKEN_EXPIRED"})`

### `RoleGuard`

Checks the user's role against `@Role()` metadata.

- **Default** — `requiredRole: USER`, `strict: true`
- **Modes** — `strict: true` (exact match) or `strict: false` (user role ≥ required)
- **Opt-out** — `@Public({makePublicRoleGuard: true})` (default for `@Public()`)
- **On failure** — `403 ROLE_NOT_ALLOWED` with a message explaining the mode

Role hierarchy is defined in `@live-bid/services/lib` (`isRoleAccess`).

### `RefreshGuard`

Only applied explicitly via `@UseGuards(RefreshGuard)`. Used by the `refresh` mutation.

- **Extraction** — cookie `refreshToken` first, then `x-refresh-token` header
- **Validation** — sends `VALIDATE_REFRESH_TOKEN` to auth service
- **Attaches** — `req.refreshPayload = { refreshRecord, user }`
- **On failure** — `401 REFRESH_TOKEN_MISSING` or whatever auth throws

> ⚠️ `RefreshGuard` imports `hashSecretToken` from `@app/auth/lib`. This is a cross-app import — technically allowed in the NestJS monorepo, but ideally this helper should live in
> `@live-bid/services/lib` so gateway doesn't depend on auth's internals.

### `GraphqlThrottleGuard`

Extends `ThrottlerGuard`. Storage is Redis (shared across gateway instances).

Throttle config (`lib/configs/throttle.config.ts`):

| Env      | `ttl` | `limit` | `blockDuration` |
|----------|-------|---------|-----------------|
| **dev**  | 10 s  | 1000    | 1 min           |
| **prod** | 60 s  | 30      | 2 min           |

Error message: `"Too many requests. Try again X minutes later."`

---

## 🎨 Decorators

| Decorator                                | Purpose                     | Example                                      |
|------------------------------------------|-----------------------------|----------------------------------------------|
| `@Public()`                              | Bypass access + role guards | `@Public()` on `health`                      |
| `@Public({makePublicAccessGuard: true})` | Bypass only access guard    | —                                            |
| `@Role({requiredRole, strict})`          | Require minimum role        | `@Role({requiredRole: ADMIN, strict: true})` |
| `@CurrentUser()`                         | Inject authenticated user   | `@CurrentUser() user: UserAccess`            |
| `@NormalizeClientInfo()`                 | Normalize IP/UA/geo/lang    | `@NormalizeClientInfo() info`                |
| `@Cacheable({...})`                      | Store resolver result       | see [Caching](#-caching)                     |
| `@CacheEvict({...})`                     | Invalidate cache keys       | see [Caching](#-caching)                     |

### Composite decorators

Auth-specific combinations live in `graphql/resolvers/auth/auth/decorators/auth.decorator.ts`:

```ts
RegisterDecorators() = @Public()
LoginDecorators() = @Public()
RefreshDecorators() = @Public() + @UseGuards(RefreshGuard)
LogoutDecorators() = @Public()
```

This pattern keeps resolvers clean — one decorator conveys the entire guard setup for that operation.

### `@NormalizeClientInfo()`

Extracts and normalizes client metadata:

```ts
{
  ip:      string | null,     // x-forwarded-for / cf-connection-ip / req.ip / socket
    browser: string | null,     // via ua-parser-js
    os:      string | null,
    device:  "mobile" | "tablet" | "desktop" | ... (default: desktop),
  country: string | null,     // via geoip-lite
    city:    string | null,
    lang:    string | null,     // Accept-Language header
}
```

Also writes the raw version to `req.clientInfo` for downstream use.

---

## ⚡ Caching

Two decorators, two interceptors. Key building is delegated to `RedisKey.keyPrefix()` in `@live-bid/services/cache`.

### `@Cacheable({...})` — set cache

```ts
@Cacheable({ resource: "users", paramKey: "id", self: false, ttl: 60_000 })
@Query(() => UserOutput)
getUser(@Args("id") id: string) { ... }
```

| Option       | Description                                     |
|--------------|-------------------------------------------------|
| `resource`   | Resource prefix (`users`, `auctions`, ...)      |
| `paramKey`   | Path param name to include in key               |
| `self`       | Include current user id in key (per-user cache) |
| `query`      | Include query params in key                     |
| `extraKeys`  | Additional static segments                      |
| `pagination` | Include page/limit                              |
| `ttl`        | Milliseconds (defaults per `RedisKey`)          |

**Flow:**

1. Build key from decorator config + request
2. `cache.get(key)` → if hit, return cached value (skip resolver)
3. On miss → run resolver → `cache.set(key, data, ttl)`
4. Return data

### `@CacheEvict({...})` — invalidate cache

Three modes:

**Mode 1 — Exact key** (single resource eviction):

```ts
@CacheEvict({ resource: "users", paramKey: "id", self: false })
@Mutation(() => UserOutput)
updateUser(@Args("id") id: string) { ... }
```

**Mode 2 — Prefix wildcard** (bulk invalidation):

```ts
@CacheEvict({ prefix: "users" })          // delete all keys starting with users
// or
@CacheEvict({ resource: "users", force: true })             // *users*
@CacheEvict({ resource: "users", forcePagination: true })   // *users:list*
```

**Mode 3 — Find by param** (evict keys containing a specific path param):

```ts
@CacheEvict({
  resource: "auctions",
  findPrefix: { param: "id", paramKeyReplace: "auctionId", listOrSingle: "single" }
})
```

Interceptor runs **after** the resolver completes — only successful mutations trigger eviction.

### `RedisKey.keyPrefix()`

Builds keys like `app:<resource>:<extraKeys...>:<param>=<value>:<query>...:list`.

Use `RedisKey.getUserProfileKey(id)` for user-scoped keys (used by `auth` too).

---

## 🔌 Apollo Config

From `lib/configs/apollo-driver.config.ts`:

| Option           | Value                                                           | Notes                          |
|------------------|-----------------------------------------------------------------|--------------------------------|
| `autoSchemaFile` | `./schema.graphql`                                              | Written at root on every start |
| `sortSchema`     | `true`                                                          | Deterministic file order       |
| `graphiql`       | `!isProduction`                                                 | Enabled in dev only            |
| `playground`     | `false`                                                         | Deprecated — use GraphiQL      |
| `introspection`  | `!isProduction`                                                 | Enabled in dev only            |
| `subscriptions`  | `{"graphql-ws": true}`                                          | Ready for live bidding         |
| `formatError`    | normalizes `{message, code, reason, statusCode, originalError}` | —                              |

### Query complexity

`ComplexityCustom` plugin enforces `maxComplexity: 20`:

- `simpleEstimator({defaultComplexity: 1})` — every field counts as 1
- `IntrospectionQuery` is exempted
- Exceeding the limit returns `BAD_REQUEST`

> 💡 Raise `maxComplexity` when you add nested resolvers (e.g., `Auction.bids.user.profile`). Estimate: `depth × breadth ≤ max`.

### Error format

Every error passes through the `formatError` in `apollo-driver.config.ts` and the `GraphqlExceptionFilter`:

```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "Invalid Credentials",
        "statusCode": 401
      }
    }
  ]
}
```

`GraphqlExceptionFilter` also handles `meta.clearAuthCookies` — when auth throws `REFRESH_TOKEN_REVOKED`, the filter clears both cookies before returning.

---

## 🔄 Request Flow (full picture)

```
Client POST /api/v1/graphql { mutation login }
       ↓
1. cookieParser        — parse cookies
2. helmet              — security headers
3. CORS                — FRONT_END_URL only
       ↓
4. GraphqlThrottleGuard — rate limit (Redis)
5. AccessTokenGuard    — verifies access JWT (skipped: @Public)
6. RoleGuard           — verifies role (skipped: @Public)
       ↓
7. ZodPipe             — validates input via LoginUserSchema
8. @NormalizeClientInfo — builds clientInfo object
       ↓
9. AuthResolver.login  — sends AUTH_PATTERNS.LOGIN via Redis
       ↓
10. Auth microservice  — returns tokens + user
       ↓
11. Set cookies        — accessToken + refreshToken (httpOnly)
12. Return SafeUser    — client receives user (no tokens in body)
       ↓
13. CacheableInterceptor — set cache if @Cacheable present
14. CacheEvictInterceptor — evict if @CacheEvict present
       ↓
15. formatError/GraphqlExceptionFilter — normalize any errors
       ↓
Client ← GraphQL response
```

---

## 🧪 Example Requests

### Register

```graphql
mutation Register {
    register(input: {
        email: "user@example.com",
        password: "secret123",
        display_name: "John"
    }) {
        id
        email
        display_name
        role
    }
}
```

### Login

```graphql
mutation Login {
    login(input: {
        email: "user@example.com",
        password: "secret123",
        remember: true
    }) {
        id
        email
        display_name
        role
    }
}
```

Cookies (`accessToken`, `refreshToken`) are set automatically.

### Refresh

```graphql
mutation Refresh {
    refresh {
        id
        email
    }
}
```

Refresh token comes from cookie. `RefreshGuard` validates it with the auth service before the resolver runs.

### Logout

```graphql
mutation Logout
```

Returns `"User logged out successfully."` and clears both cookies.

---

## 🧱 App Controller (non-GraphQL)

`AppController` exposes two version-neutral HTTP endpoints (outside `/api/v1`):

| Method        | Path      | Response                                                 |
|---------------|-----------|----------------------------------------------------------|
| `GET /`       | `/`       | `{ok, ping: "pong", message: "Welcome to Live Bid API"}` |
| `GET /health` | `/health` | `{ok, ping: "pong", message: "Live Bid API is ok"}`      |

Useful for load balancers and uptime checks.

---

## 🛡️ Conventions

- **Resolvers are thin** — validate, delegate, format. Business logic in services.
- **Always validate input** with `new ZodPipe(Schema)` — never trust client data.
- **Mark public endpoints explicitly** — `@Public()`; never assume a default.
- **Use composite decorators** — `@LoginDecorators()`, `@RefreshDecorators()` — not raw `@Public()` + `@UseGuards()`.
- **Cache mutations out** — don't `@Cacheable()` mutations; use `@CacheEvict()` instead.
- **Message patterns and names from `@live-bid/services/*`** — never inline strings.
- **Emit on fire-and-forget** — `client.emit()` for logout-style operations, `client.send()` for request-response.
- **Never access DB directly** — no `DrizzleModule` in gateway.
- **Cross-app imports require care** — `RefreshGuard` imports `hashSecretToken` from `@app/auth/lib`. Prefer moving shared helpers to `@live-bid/services/lib`.

---

## 🗺️ Roadmap (Gateway)

- [x] Apollo GraphQL + code-first schema
- [x] Global guards: throttle, access token, role
- [x] Cache decorators: `@Cacheable`, `@CacheEvict`
- [x] Client info tracking (IP/UA/geo/lang)
- [x] Query complexity limit
- [x] Cookie-based auth flows
- [x] `graphql-ws` subscriptions enabled
- [ ] Auction resolvers (create, list, bid) — depends on `core`
- [ ] Subscription resolvers for live bidding
- [ ] `core` ClientProxy wiring for new patterns
- [ ] Per-user rate limits (in addition to IP-based)
- [ ] Persisted queries for production
