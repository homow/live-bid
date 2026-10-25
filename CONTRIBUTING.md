# 🤝 `CONTRIBUTING.md`

```md
# Contributing to Live Bid

Thanks for contributing to **Live Bid** — a real-time auction platform built by a small team. This document explains how we work: branch naming, commits, pull requests, and code
conventions.

> 📖 New to the project? Start with the [main README](./README.md) and [`README.server.md`](./README.server.md).

---

## 👥 Team

Live Bid is currently maintained by **two people**:

| Role | Scope |
| --- | --- |
| **Backend & Infrastructure** | `apps/`, `packages/`, `infra/`, database, deployment |
| **Frontend & Design** | `clients/web/`, Figma designs, UI/UX |

Code review is **not mandatory** — but a second pair of eyes is always welcome, especially for changes in `packages/` (shared contracts) since they affect both client and server.

---

## 🌿 Git Workflow

We follow a lightweight **GitHub Flow**:

```

main ──●────●────●────●────●──▶
\ /
●──●──● (feature branch, deleted after merge)

```

### Rules

1. **`main` is always deployable** — never commit directly to `main`.
2. **One branch per feature or bug** — no mixing concerns.
3. **Branch is deleted after merge** — keep the repo clean.
4. **Merge via merge commit** — we preserve branch history.

### Branch naming

```

<type>/<short-description>

```

| Type | When to use | Example |
| --- | --- | --- |
| `feat` | New feature | `feat/user-profile-page` |
| `fix` | Bug fix | `fix/login-redirect-loop` |
| `chore` | Tooling, deps, config | `chore/update-deps` |
| `docs` | Documentation only | `docs/gateway-readme` |
| `refactor` | Code restructure (no behavior change) | `refactor/auth-service` |
| `test` | Adding or fixing tests | `test/auth-login` |
| `hotfix` | Urgent production fix | `hotfix/token-expiry` |

**Rules:**
- Use **lowercase** and **hyphens** (`-`), not underscores
- Keep it **short** (max 4-5 words)
- Describe **what**, not **how** (`feat/wallet-page`, not `feat/implement-wallet-with-recharts`)

---

## 💬 Commit Messages

We use **Conventional Commits**:

```

<type>(<scope>): <short summary>

[optional body]

[optional footer]

```

### Examples

```

feat (auth): add refresh token rotation
fix (gateway): prevent duplicate cache keys
chore (deps): bump drizzle-orm to 0.45.2
docs (readme): update backend setup steps
refactor (core): extract repository helpers
test (auth): cover revoked refresh token flow

```

### Type reference

| Type | Purpose |
| --- | --- |
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config |
| `docs` | Documentation |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |
| `style` | Formatting only (no logic change) |
| `ci` | CI/CD changes |

### Scope (optional but recommended)

Use the area or app name:

`auth`, `gateway`, `core`, `web`, `contracts`, `services`, `db`, `infra`

### Rules

- **Subject in imperative mood** — "add feature", not "added feature" or "adds feature"
- **No capital letter** at the start of the subject
- **No period** at the end of the subject
- **Body** wrapped at 72 characters, explains *why*, not *what*
- **One logical change per commit** — if you're fixing a bug and adding a feature, make two commits

---

## 🔀 Pull Requests

### When to open a PR

- After your branch is ready (or **as a draft** if you want early feedback)
- **Never** merge without testing locally first

### PR checklist

Before opening a PR, verify:

- [ ] Branch is up to date with `main`
- [ ] ESLint passes (`npm run lint` in the affected workspace)
- [ ] Types compile (`npm run build:all` or the specific `build:*` script)
- [ ] Tests pass (if you added or changed any)
- [ ] Screenshots included for **UI changes** (client, or gateway GraphQL schema changes)
- [ ] No `.env`, secrets, or API keys committed
- [ ] Database migrations applied locally (if you added one)
- [ ] `schema.graphql` updated (if you changed resolvers)

### PR title

Follow the same format as commits:

```

feat (auth): add refresh token rotation
fix (web): correct login button alignment

```

### PR description

Include:

1. **What changed** — one or two sentences
2. **Why** — link to an issue if one exists
3. **How to test** — reproduction steps or manual test plan
4. **Screenshots** — for UI changes
5. **Breaking changes** — if any (DB, API, env)

### Merge strategy

- Use **merge commit** (not squash, not rebase) to preserve branch history
- Delete the branch after merging
- **Never force-push to `main`**

---

## 💻 Local Development

Full setup instructions live in the main READMEs:

| Doc | Covers |
| --- | --- |
| [`README.md`](./README.md) | Project overview, client setup |
| [`README.server.md`](./README.server.md) | Backend setup, env vars, database |
| [`apps/README.md`](./apps/README.md) | Service architecture overview |
| [`apps/gateway/README.md`](./apps/gateway/README.md) | GraphQL gateway internals |
| [`apps/auth/README.md`](./apps/auth/README.md) | Auth microservice internals |
| [`apps/core/README.md`](./apps/core/README.md) | Core microservice (WIP) |

### Quick start

```bash
# 1. Install
npm install

# 2. Start Postgres + Redis
docker compose -f infra/docker-compose.yaml up -d

# 3. Copy envs and fill in values
cp .env.example .env
cp apps/gateway/.env.example apps/gateway/.env
cp apps/auth/.env.example apps/auth/.env
cp apps/core/.env.example apps/core/.env

# 4. Create database + migrate
docker exec -it live-bid-postgres psql -U user -d postgres -c "CREATE DATABASE live_bid;"
npm run db:migrate-dev

# 5. Start everything
npm run dev
```

---

## 🎨 Code Conventions

### TypeScript

- **No `any` unless unavoidable** — prefer `unknown` + narrowing
- **Explicit return types** on public functions in services and resolvers
- **Interfaces for object shapes**, `type` for unions and aliases
- **Never use `// @ts-ignore`** without a comment explaining why

### Where code goes

| What                        | Where                                                                 |
|-----------------------------|-----------------------------------------------------------------------|
| Validation schemas (shared) | `packages/contracts/src/schemas/`                                     |
| Enums (shared)              | `packages/contracts/src/enums/`                                       |
| Database tables             | `packages/services/src/database/schema/`                              |
| Message patterns            | `packages/services/src/messages/`                                     |
| Service names & token names | `packages/services/src/names/`                                        |
| Request/response types      | `packages/services/src/types/`                                        |
| GraphQL resolvers           | `apps/gateway/src/graphql/resolvers/`                                 |
| Business logic              | `apps/<service>/src/modules/<domain>/`                                |
| React components            | `clients/web/src/Components/` or `clients/web/src/featuer/<Feature>/` |

**Golden rule:** anything the client needs lives in `packages/contracts/`. Anything backend-only lives in `packages/services/`. Apps **never import from other apps** — only from
`@live-bid/*` packages.

### Linting

ESLint is configured at the root and per-client. Run before committing:

```bash
# Root (backend + packages)
npx eslint . --ext .ts

# Client
cd clients/web && npm run lint
```

> 💡 If your editor supports ESLint + format-on-save, enable it. Saves review round-trips.

### Formatting

- **2 spaces** indentation (TypeScript, JSON)
- **Single quotes** for TS strings, **double quotes** in JSX attributes
- **Trailing commas** where valid
- **Semicolons** — yes (backend already uses them)

---

## 🧪 Testing

Tests are **recommended** but not strictly required for every PR. Prioritize testing:

- Token rotation and refresh logic (auth)
- Cache invalidation edge cases (gateway)
- Any DB transaction (repository layer)
- New GraphQL resolvers with non-trivial branching

### Running tests

```bash
# Client (Vitest)
cd clients/web && npx vitest

# Client browser tests (Playwright)
cd clients/web && npx playwright test

# Backend (when added — currently no test runner configured)
# Will use Jest via @nestjs/testing
```

> ⚠️ Backend currently has no test runner configured. If you start adding tests, add `jest` + `@nestjs/testing` to the root `package.json` and create `jest.config.ts`.

---

## 🗄️ Database Changes

If you add or change a table:

1. Edit the schema in `packages/services/src/database/schema/`
2. Generate a migration: `npm run db:generate`
3. Inspect the generated `.sql` in `migrations/` — **never blindly accept it**
4. Apply locally: `npm run db:migrate-dev`
5. Commit **both** the schema change and the migration file
6. Mention it in the PR description

> ⚠️ **Never delete existing migrations.** To undo, write a new migration.

---

## 🔐 Security

- **Never commit** `.env` files, secrets, or database dumps
- **Never log** tokens, passwords, or full request bodies containing them
- **Always hash** secrets before storing (see `apps/auth/src/lib/utils/crypto.ts`)
- **Validate everything** from the client — use `ZodPipe` in every resolver
- **Report security issues privately** to the maintainers, not via public issues

If you find a secret accidentally committed:

1. Rotate the secret immediately
2. Notify the other maintainer
3. Remove it from history (`git filter-repo` or BFG)

---

## 🐛 Reporting Bugs

Open an issue with:

- **Environment** — Node version, OS, browser (for client)
- **Steps to reproduce** — numbered, minimal
- **Expected behavior**
- **Actual behavior**
- **Logs / screenshots** — if available

Please check open and closed issues before opening a new one.

---

## 💡 Suggesting Features

Open an issue describing:

- **Problem** — what's missing or broken
- **Proposed solution** — if you have one
- **Alternatives** — other approaches you considered
- **Priority** — nice-to-have / needed for MVP / blocking

Major features (new microservice, new DB table in `core`, new shared package) should be discussed **before** writing code.

---

## 📦 What Not to Do

- ❌ Force-push to `main`
- ❌ Merge your own PR without local testing
- ❌ Commit `dist/`, `node_modules/`, `.env`, or `.next/`
- ❌ Add new dependencies without a reason in the PR description
- ❌ Change shared contracts (`packages/contracts/`) without informing the other maintainer
- ❌ Use `any` to bypass type errors
- ❌ Leave `console.log` in production code (use `PinoLogger`)
- ❌ Skip migrations and push schema directly to staging/prod (`db:push` is dev-only)

---

## ❓ Questions

- **Architecture / DB / auth** → ask the backend maintainer
- **UI / UX / Figma / client** → ask the frontend maintainer
- **Unclear ownership** → open a GitHub Discussion or PR comment; one of us will answer
