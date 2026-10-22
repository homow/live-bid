# 🔐 `apps/auth/README.md`

The authentication microservice of Live Bid. Handles user registration, login, JWT/refresh-token generation, token rotation, and user caching. Communicates **only** over Redis
transport — no HTTP, no GraphQL.

> 📖 For overall backend architecture, see [`apps/README.md`](../README.md).
> 📖 For full backend setup and environment, see [`README.server.md`](../../README.server.md).

---

## 🧭 Overview

```
gateway (GraphQL)
       │  Redis transport
       ▼
┌──────────────────────────────────────┐
│               auth                   │
│                                      │
│  AuthController  ──▶  AuthService    │
│                          │           │
│              ┌───────────┼──────────┐│
│              ▼           ▼          ▼│
│       AuthRepository  UserRepo  TokenUtil
│       (refresh_tokens) (users)  (JWT)│
└──────────────────────────────────────┘
       │                      │
       ▼                      ▼
  PostgreSQL              Redis (cache)
```

- **No HTTP server** — bootstraps as `Transport.REDIS` microservice
- **No GraphQL** — exposes handlers via `@MessagePattern`
- **Owns two tables** — `users` and `refresh_tokens`
- **Reads/writes user cache** — via `@live-bid/services/cache`

---

## 📁 Structure

```
apps/auth/src/
├── main.ts                     # Redis microservice bootstrap
├── app.module.ts               # ConfigModule, Logger, Drizzle, Cache, AuthModule
├── lib/
│   ├── config/env.ts           # Loads apps/auth/.env
│   └── utils/
│       ├── crypto.ts           # bcrypt hashing, SHA-256, random tokens
│       └── index.ts
└── modules/
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts   # @MessagePattern handlers
    │   ├── auth.repository.ts   # refresh_tokens queries
    │   ├── services/auth.service.ts
    │   └── utils/token.util.ts  # JWT + cookie options
    └── user/
        ├── user.module.ts
        ├── user.controller.ts   # (empty — placeholder)
        ├── user.repository.ts   # users queries
        └── services/
            ├── user.service.ts        # (empty — placeholder)
            └── user-cache.service.ts  # Redis cache-aside
```

---

## 🔌 Message Handlers

Every handler is registered in `AuthController` with `@MessagePattern`. Patterns come from `@live-bid/services/messages`:

| Pattern (`AUTH_PATTERNS`) | Handler                  | Response                                                |
|---------------------------|--------------------------|---------------------------------------------------------|
| `REGISTER`                | `register()`             | `RegisterResponseService` (safe user)                   |
| `LOGIN`                   | `login()`                | `LoginResponseService` (user + tokens + cookie options) |
| `VALIDATE_REFRESH_TOKEN`  | `validateRefreshToken()` | `RefreshTokenPayload` (token record + user)             |
| `REFRESH`                 | `refresh()`              | `LoginResponseService` (rotated tokens)                 |
| `LOGOUT`                  | `logout()`               | `void` (fire-and-forget)                                |

> ⚠️ `VALIDATE_REFRESH_TOKEN` has a typo (`vaildate`) in the pattern string. It's the current contract — fix in both `packages/services/src/messages/auth.messages.ts` and the
> controller if you ever correct it.

---

## 🔄 Auth Flows

### Register

```
Gateway sends REGISTER { email, password, display_name }
       ↓
AuthService.register()
       ↓
1. bcrypt hash password (12 rounds)
2. UserRepository.insertUser() → returns safe columns only
3. Log success
       ↓
Returns safe user (no password)
```

**Notes:**

- Password is hashed with `bcrypt` (12 salt rounds) — see `lib/utils/crypto.ts`
- Duplicate email triggers `checkDrizzleError` → converted to a clean `AppException`
- `USER_PUBLIC_COLUMNS` ensures `password` is never leaked

### Login

```
Gateway sends LOGIN { userData, clientInfo }
       ↓
AuthService.login()
       ↓
1. UserRepository.findOne({email | username}, safe=false)  ← includes password
2. compareSecret(password, user.password) via bcrypt
3. Generate tokens via TokenUtil.getTokens():
     - accessToken  → JWT (HS256, JWT_SECRET, JWT_EXPIRES)
     - refreshToken → "<userId>:<64-byte-hex-random>"
     - hashedRefreshToken → SHA-256 of full refresh token
4. AuthRepository.insertRefreshToken()  ← stores hash + client info + remember_me
5. UserCacheService.setCacheUserInfo(safeUser)  ← fire-and-forget (1h TTL)
6. Return { user, accessToken, refreshToken, accessOptions, refreshOptions }
```

### Refresh (rotation)

```
RefreshGuard in gateway → sends VALIDATE_REFRESH_TOKEN { userId, tokenHash }
       ↓
AuthService.validateRefresh()
       ↓
1. Try cache for user (UserCacheService.getCachedUserInfo)
2. AuthRepository.findRefreshRecord(tokenHash)       ← if user cached
   AuthRepository.findRefreshRecordWithUser(tokenHash) ← if not
3. If token.is_revoked === true:
     → revoke ALL user tokens (security measure)
     → throw REFRESH_TOKEN_REVOKED with meta.clearAuthCookies = true
4. Return { refreshRecord, user }

       ↓ (gateway then sends REFRESH)

AuthService.refresh()
       ↓
1. Generate new access + refresh tokens
2. AuthRepository.rotateToken() — transaction:
     - INSERT new token
     - UPDATE old token: is_revoked = true, replace_by_token_id = new.id
3. Return new tokens + cookie options
```

**Notes:**

- Refresh tokens are **opaque** (not JWTs) — server-side revocable
- Only the **SHA-256 hash** is stored (`token_hash` column) — the raw token never touches the DB
- `rotateToken()` is wrapped in a **Drizzle transaction** — either both operations succeed or neither

### Logout

```
Gateway sends LOGOUT { rawRefreshTokenId }  (fire-and-forget via emit)
       ↓
AuthService.logout()
       ↓
1. Hash the raw token (SHA-256)
2. AuthRepository.revokeToken(hash) — UPDATE is_revoked = true
       ↓
Returns void immediately (no response sent back)
```

**Notes:**

- Called via `authClient.emit(...)`, not `send(...)` — the gateway doesn't wait
- Cookies are cleared by the gateway **before** Auth even responds

---

## 🔑 Token Utilities

### `TokenUtil` (`modules/auth/utils/token.util.ts`)

| Method                             | Purpose                                                   |
|------------------------------------|-----------------------------------------------------------|
| `getTokens(payload, remember)`     | Generates access + refresh + hashed refresh + expiry date |
| `generateAccessToken(payload)`     | Signs JWT with `JWT_SECRET` and `JWT_EXPIRES`             |
| `getCookieOptions(type, remember)` | Cookie options for `access`, `refresh`, or `logout`       |
| `getRefreshDate(remember)`         | 12h (default) or 7d (`remember: true`)                    |
| `getAccessDate()`                  | Parses `JWT_EXPIRES` via `ms`                             |

### Access token payload

```ts
{
  sub: userId, 
  role:  UserRoleEnum,
  jti:  `${randomUUID()}${Date.now()}`,   // unique per token
  display_name:  string,
}
```

### Cookie options

| Token              | `httpOnly` | `secure`  | `sameSite`                    | `maxAge`                    |
|--------------------|------------|-----------|-------------------------------|-----------------------------|
| **access**         | ✅         | prod only | `lax` (dev) / `strict` (prod) | `JWT_EXPIRES` (default 15m) |
| **refresh**        | ✅         | prod only | `lax` (dev) / `strict` (prod) | 12h or 7d (`remember`)      |
| **logout** (clear) | ✅         | prod only | same                          | —                           |

> Cookie names come from `ACCESS_TOKEN_NAME` and `REFRESH_TOKEN_NAME` in `packages/services/src/names/token.names.ts`.

### Crypto (`lib/utils/crypto.ts`)

| Function                       | Algorithm                | Use                        |
|--------------------------------|--------------------------|----------------------------|
| `hashSecret(value, salt=12)`   | bcrypt                   | Password hashing           |
| `compareSecret(value, hashed)` | bcrypt                   | Password verification      |
| `generateRandomToken()`        | `crypto.randomBytes(64)` | Refresh token random part  |
| `hashSecretToken(value)`       | SHA-256                  | Refresh token storage (DB) |

---

## 🗄️ Repositories

### `UserRepository` (`modules/user/user.repository.ts`)

| Method                                        | Notes                                                                  |
|-----------------------------------------------|------------------------------------------------------------------------|
| `insertUser({password, email, display_name})` | Returns safe columns only                                              |
| `findOne({id \| email \| username}, safe)`    | `safe: true` → `SafeUser`; `safe: false` → full `User` (with password) |
| `buildUserQuery(where?)`                      | Base select builder (shared)                                           |

- `USER_PUBLIC_COLUMNS` exported for use in joins (e.g. `AuthRepository.findRefreshRecordWithUser`)
- All queries use `groupBy(user.id)` to make joins safe with `leftJoin`

### `AuthRepository` (`modules/auth/auth.repository.ts`)

| Method                                 | Purpose                                                              |
|----------------------------------------|----------------------------------------------------------------------|
| `insertRefreshToken(data)`             | New session row                                                      |
| `findRefreshRecord(tokenHash)`         | Token record only (fast path)                                        |
| `findRefreshRecordWithUser(tokenHash)` | Token + joined user (cache miss path)                                |
| `revokeAllUserTokens(userId)`          | Bulk revoke (on compromised token)                                   |
| `rotateToken(oldId, newData)`          | **Transaction**: insert new + revoke old + set `replace_by_token_id` |
| `revokeToken(tokenHash)`               | Single revoke (logout)                                               |

- `REFRESH_TOKEN_PUBLIC_COLUMNS` exported — used for typed joins
- Never selects or returns `client_info` outside the service layer

---

## ⚡ Caching (`UserCacheService`)

Cache-aside pattern over Redis, via `@live-bid/services/cache`.

| Method                   | Behavior                                                                             |
|--------------------------|--------------------------------------------------------------------------------------|
| `setCacheUserInfo(user)` | Fire-and-forget, **1h TTL**, errors logged only                                      |
| `getCachedUserInfo(id)`  | Returns `SafeUser \| null`                                                           |
| `getOrSetUserCache(id)`  | Cache-aside: Redis → miss → DB → cache → return; throws `NotFound` if DB also misses |

Key structure:

```
user:profile:<userId>
```

- Built with `RedisKey.build('user', ...RedisKey.getUserProfileKey(id))`
- **Cache failures never throw** — the auth flow degrades gracefully to DB

---

## 🧱 Module Wiring

### `AuthModule`

```ts
imports: [UserModule, JwtModule.register({})]
controllers: [AuthController]
providers: [AuthRepository, TokenUtil, AuthService]
```

- `JwtModule.register({})` — options are passed **per call** in `TokenUtil` (from `ConfigService`)
- Depends on `UserModule`, which exports `UserRepository`, `UserService`, `UserCacheService`

### `UserModule`

```ts
controllers: [UserController]                 // empty — placeholder
providers:   [UserRepository, UserService, UserCacheService]
exports:     [UserRepository, UserService, UserCacheService]
```

> 💡 `UserController` and `UserService` are currently empty. They exist as the home for future user-facing operations (profile update, account deletion, etc.). When you add
> handlers, follow the same `@MessagePattern` + `@Payload` pattern as `AuthController`.

---

## ⚠️ Error Conventions

All errors thrown from Auth follow the shared exception model in `@live-bid/services/lib`:

```ts
throw new AppException({
  statusCode: 401,
  code: 'REFRESH_TOKEN_EXPIRE',
  message: 'Invalid or expired refresh token',
});
```

The gateway's `GraphqlExceptionFilter` catches `RpcException` (which wraps these) and normalizes them into GraphQL errors.

| Case                    | Code                    | Extra                         |
|-------------------------|-------------------------|-------------------------------|
| Invalid credentials     | `Invalid Credentials`   | —                             |
| Missing user            | `NOT_FOUND`             | via `throwNotFoundEx('User')` |
| Expired/invalid refresh | `REFRESH_TOKEN_EXPIRE`  | —                             |
| Revoked refresh         | `REFRESH_TOKEN_REVOKED` | `meta.clearAuthCookies: true` |

---

## 🛡️ Conventions

- **Never store raw refresh tokens** — always `hashSecretToken()` first
- **Never return `password`** — use `USER_PUBLIC_COLUMNS` or destructure it out
- **All DB writes go through a repository** — services never touch `drizzle.db` directly
- **Cache is optional** — never let a cache failure break an auth flow
- **Message patterns from `@live-bid/services/messages`** — never inline strings
- **Token names from `@live-bid/services/names`** — never inline `"accessToken"`
- **Zod schemas from `@live-bid/contracts/schemas`** — the gateway validates; Auth trusts the payload

---

## 🗺️ Roadmap (Auth)

- [x] Register, login, refresh (rotation), logout
- [x] Client info tracking (IP, device, geo, language)
- [x] User cache (cache-aside, 1h TTL)
- [ ] `UserController` / `UserService` — profile update, avatar, account deletion
- [ ] Password reset flow (email token + TTL)
- [ ] Email verification on register
- [ ] Multi-device session management (list/revoke sessions per device)
- [ ] Rate limiting per user inside the service (defense in depth)
