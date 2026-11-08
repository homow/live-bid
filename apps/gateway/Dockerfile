# ---------- Stage 1: Production Dependencies ----------
FROM node:26-alpine AS deps
WORKDIR /app

COPY package-lock.json package.json ./

RUN npm ci --omit=dev

# ---------- Stage 2: builder ----------
FROM node:26-alpine AS builder
WORKDIR /app

COPY package-lock.json package.json ./

RUN npm ci

# Copy Gateway Resources
COPY apps/gateway ./apps/gateway
COPY apps/gateway/tsconfig.app.json ./apps/gateway/

# Copy Root Resources
COPY packages/contracts ./packages/contracts
COPY packages/services ./packages/services
COPY tsconfig.build.json tsconfig.json nest-cli.json ./

RUN npm run build:packages
RUN npm run build:gateway

# ---------- Stage 2: builder ----------
FROM node:26-alpine AS production
WORKDIR /app

# Set NodeJs Environment
ENV NODE_ENV=production

# Create User and Group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy Dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prodcution Files
COPY --from=builder /app/public ./
COPY --from=builder /app/migrations ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist

USER nestjs

EXPOSE 3001

CMD ["node", "apps/gateway/dist/main.js"]
