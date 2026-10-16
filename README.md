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
