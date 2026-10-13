# LiveBid

NestJS monorepo (microservices): apps/gateway (GraphQL + guards/interceptors),
apps/auth, apps/core. Shared code in packages/contracts (zod schemas, enums)
and packages/services (drizzle, cache, pino, exceptions, shared types).

## Conventions
- Each module: controller / service / repository, barrel `index.ts` in every folder
- DB: Drizzle + PostgreSQL, migrations in /migrations (generated, don't hand-edit)
- Cache: Redis via packages/services/src/cache
- Validation: zod schemas live in packages/contracts

## Commands
- npm run start:dev <app>
- npx drizzle-kit generate / migrate
- docker compose -f infra/docker-compose.yaml up -d

## Don't touch
- migrations/meta, schema.graphql (auto-generated)

## Adding a new endpoint (follow in order)

1. packages/contracts/src/schemas/<domain>/  → zod schema + export in index.ts
2. packages/services/src/messages/           → success/error messages
3. packages/services/src/types/services-request/<domain>/   → request type
   packages/services/src/types/services-response/<domain>/  → response type
4. apps/gateway/src/graphql/resolvers/<domain>/<name>/
   → inputs/, outputs/, resolver method (use ZodPipe with the contracts schema)
5. apps/<microservice>/src/modules/<domain>/
   → controller (message pattern) → service → repository
6. Export everything through barrel index.ts files

Reference implementation: the `login` flow (follow its structure exactly)
