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

