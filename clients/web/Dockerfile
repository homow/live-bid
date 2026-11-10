# =================================
# Stage 1: Deps
# =================================
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY clients/web/package.json ./clients/web/package.json
COPY clients/web/package-lock.json ./clients/web/package-lock.json
COPY packages/contracts/package.json ./packages/contracts/
RUN npm ci --workspace=clients/web --include-workspace-root=false --omit=dev

# ===================================
# Stage 2: Builder
# ===================================
FROM node:24-alpine AS builder
WORKDIR /app

# Copy Root Resources
COPY package.json package-lock.json ./

# Copy Next.js Resources
COPY clients/web/package.json ./clients/web/package.json
COPY clients/web/package-lock.json ./clients/web/package-lock.json

# Copy Contracts Resources
COPY packages/contracts/package.json ./packages/contracts/package.json

RUN npm ci --workspace=clients/web --include-workspace-root=false

# Copy Source Codes
COPY clients/web clients/web/
COPY packages/contracts/ ./packages/contracts/

# Normalize permissions regardless of the host umask, so the
# non-root runtime user can always read whatever ends up in public.
RUN find public -type d -exec chmod 755 {} + \
    && find public -type f -exec chmod 644 {} +

RUN npm run build:web

# ===================================
# Stage 3: Finall
# ===================================
FROM node:24-alpine AS runner
WORKDIR /app

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache tini

RUN addgroup --system --gid 1001 web \
    && adduser --system --uid 1001 web

COPY --from=builder --chown=web:web \
    /app/clients/web/.next/standalone ./

COPY --from=builder --chown=web:web \
    /app/clients/web/.next/static ./clients/web/.next/static

COPY --from=builder --chown=web:web \
    /app/clients/web/public ./clients/web/public

USER web
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "clients/web/server.js"]
