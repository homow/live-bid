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
