# ---------- Stage 1: Production Dependencies ----------
FROM node:26-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/gateway/tsconfig.app.json ./apps/gateway/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/services/package.json ./packages/services/

RUN npm ci --omit=dev

# ---------- Stage 2: Builder ----------
FROM node:26-alpine AS builder
WORKDIR /app

COPY package-lock.json package.json ./

RUN npm ci

# Copy Gateway Resources
COPY apps/gateway ./apps/gateway

# Copy Packages Resource
COPY packages/contracts ./packages/contracts
COPY packages/services ./packages/services

# Copy Root Resources
COPY public ./public
COPY migrations ./migrations
COPY tsconfig.build.json tsconfig.json nest-cli.json ./

RUN npm run build:packages
RUN npm run build:gateway

# ---------- Stage 3: Runner ----------
FROM node:26-alpine AS production
WORKDIR /app

# Set NodeJs Environment
ENV NODE_ENV=production

# Create User and Group
RUN addgroup -g 1001 -S gateway && \
    adduser -S gateway -u 1001 -G gateway

# Copy Dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=deps /app/packages/services/package.json ./packages/services/package.json

# Copy Prodcution Builder Files
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist
COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/services/dist ./packages/services/dist

# Root Resources
COPY --from=builder /app/public ./
COPY --from=builder /app/migrations ./

USER gateway

EXPOSE 3001

CMD ["node", "apps/gateway/dist/main.js"]
