# 🎯 Live Bid

A real-time auction platform where users can create and join live auctions, manage their wallet, and build their profile. Chat functionality per auction is planned for future
releases.

> ⚠️ **Status:** Early development — features and architecture are still evolving.

---

## 📦 Monorepo Structure

```
live-bid/
├── apps/           # Backend microservices (auth, core, gateway)
├── clients/        # Frontend applications
│   └── web/        # Next.js web client
├── packages/       # Shared libraries (contracts, services)
├── infra/          # Docker & infrastructure
└── migrations/     # Database migrations
```

---

# 🖥️ Client — Web

The web client is a **Next.js 16** application using the App Router, **React 19**, **Tailwind CSS 4**, and **shadcn/ui** for components. It communicates with the backend via
**Apollo Client (GraphQL)**.

## 📁 Structure

```
clients/web/src/
├── app/            # Next.js App Router
│   ├── (dashboard)/   # Authenticated dashboard routes
│   └── (pages)/       # Public pages
├── Components/     # Layout, providers, UI kit
├── featuer/        # Feature modules (Auth, Dashboard, Home)
├── hooks/          # Shared hooks
├── lib/            # Apollo client, utils
└── mocks/          # Static mock data
```

## 🧩 Key Features

- **Auth** — Login / Register modal with GraphQL mutations
- **Dashboard** — Wallet, Favorites, Won Auctions, Settings
- **Home** — Hero, Live Auction cards, How-it-works, FAQ
- **UI Kit** — Storybook-documented components (`badge`, `button`, `card`, `dialog`, etc.)

## 📚 Tech Stack

| Tech                    | Version | Description                  |
|-------------------------|---------|------------------------------|
| **next**                | ^16.3.6 | React framework (App Router) |
| **react**               | 19.2.8  | UI library                   |
| **typescript**          | ^5      | Type safety                  |
| **tailwindcss**         | ^4      | Utility-first CSS            |
| **shadcn**              | ^4.21.0 | Component system             |
| **@base-ui/react**      | ^1.8.0  | Headless UI primitives       |
| **framer-motion**       | ^13.1.1 | Animations                   |
| **lucide-react**        | ^1.34.0 | Icon set                     |
| **recharts**            | ^3.8.0  | Charts                       |
| **sonner**              | ^2.0.8  | Toast notifications          |
| **date-fns**            | ^4.4.0  | Date utilities               |
| **@live-bid/contracts** | *       | Shared schemas & types       |

### 🛠️ Dev Tools

| Tech           | Version | Description        |
|----------------|---------|--------------------|
| **storybook**  | ^10.6.0 | Component workshop |
| **vitest**     | latest  | Unit testing       |
| **playwright** | latest  | Browser testing    |
| **eslint**     | ^9      | Linting            |

## 🚀 Getting Started

```bash
cd clients/web
npm install
npm run dev          # http://localhost:3000
npm run storybook    # http://localhost:6006
```

---

# ⚙️ Server — Backend

The backend is a **NestJS microservices** architecture composed of three independent services communicating over GraphQL, with Redis for caching/pub-sub and PostgreSQL as the
primary datastore.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Gateway   │────▶│    Auth     │     │    Core     │
│  (GraphQL)  │     │  (Users,    │     │  (Auctions, │
│             │────▶│   Tokens)   │     │   Wallet)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         ┌─────────┐              ┌──────────┐
         │  Redis  │              │ Postgres │
         │(cache,  │              │(Drizzle) │
         │pub/sub) │              └──────────┘
         └─────────┘
```

| Service     | Responsibility                                         |
|-------------|--------------------------------------------------------|
| **gateway** | Public GraphQL API, auth guards, cache, throttling, WS |
| **auth**    | User registration, login, JWT & refresh tokens, roles  |
| **core**    | Domain logic (auctions, wallet) — _currently minimal_  |

## 📁 Structure

```
apps/
├── gateway/        # Apollo GraphQL + guards, interceptors, WS
├── auth/           # Auth module, users, tokens
└── core/           # (future) auctions, wallet, chat

packages/
├── contracts/      # Shared Zod schemas, enums, GraphQL contracts
└── services/       # DB schema, cache, shared types, utilities
```

## 📚 Tech Stack

| Tech                            | Version  | Description                        |
|---------------------------------|----------|------------------------------------|
| **@nestjs/core**                | ^11.0.1  | Backend framework                  |
| **@nestjs/graphql**             | ^13.4.4  | GraphQL (code-first)               |
| **@apollo/server**              | ^5.5.1   | GraphQL server                     |
| **@nestjs/websockets**          | ^11.1.29 | Real-time (Socket.IO)              |
| **graphql-ws**                  | ^6.2.1   | GraphQL subscriptions over WS      |
| **graphql-redis-subscriptions** | ^2.7.0   | Redis-backed PubSub for subs       |
| **@nestjs/jwt**                 | ^11.0.2  | JWT authentication                 |
| **@nestjs/passport**            | ^11.0.5  | Passport strategy layer            |
| **bcrypt**                      | ^6.0.0   | Password hashing                   |
| **drizzle-orm**                 | ^0.45.2  | Type-safe ORM for PostgreSQL       |
| **pg**                          | ^8.23.0  | PostgreSQL driver                  |
| **ioredis**                     | ^6.0.0   | Redis client (cache + PubSub)      |
| **zod**                         | ^4.4.3   | Schema validation (via nestjs-zod) |
| **nestjs-zod**                  | ^5.5.0   | Zod integration for NestJS         |
| **@nestjs/throttler**           | ^6.5.0   | Rate limiting                      |
| **nestjs-pino**                 | ^4.6.1   | Structured logging                 |
| **helmet**                      | ^8.3.0   | HTTP security headers              |
| **geoip-lite**                  | ^2.0.3   | Client IP geolocation              |
| **ua-parser-js**                | ^2.0.10  | Client device detection            |

### 🛠️ Dev Tools

| Tech             | Version  | Description           |
|------------------|----------|-----------------------|
| **drizzle-kit**  | ^0.31.10 | Migrations & studio   |
| **concurrently** | ^10.0.4  | Run services together |
| **pino-pretty**  | ^13.1.3  | Pretty log output     |
| **typescript**   | ^5.7.3   | Type safety           |

## 🚀 Getting Started

### Prerequisites

- Node.js `^20+`
- PostgreSQL
- Redis

### Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Start infrastructure (Postgres + Redis)
docker compose -f infra/docker-compose.yaml up -d

# 3. Apply database migrations
npm run db:migrate-dev

# 4. Build shared packages & start everything
npm run dev
```

Gateway runs on its configured port (see `apps/gateway/src/lib/configs/env.ts`).

### Useful Scripts

```bash
# Development
npm run dev:microservices    # gateway + auth + core + packages
npm run dev:all              # above + web client

# Database
npm run db:generate          # generate migration from schema
npm run db:migrate-dev       # apply migrations
npm run db:push              # push schema directly (dev)
npm run db:studio            # open Drizzle Studio

# Build
npm run build:all            # build all apps & packages
```

## 🔐 Highlights

- **Zod-first contracts** — schemas shared between client & server via `@live-bid/contracts`
- **GraphQL complexity limits** — `graphql-query-complexity` prevents abusive queries
- **Redis PubSub** — enables GraphQL subscriptions for live auction updates
- **Cookie-based refresh tokens** with JWT access tokens
- **Client info tracking** (IP, device, geolocation) via custom decorators
- **Rate limiting** per-operation with `@nestjs/throttler`

---

## 🗺️ Roadmap

- [x] User auth (JWT + refresh tokens)
- [x] Wallet & dashboard UI
- [ ] Live auction creation & bidding (core service)
- [ ] Per-auction chat (WebSocket)
- [ ] Admin panel
