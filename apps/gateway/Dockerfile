# ---------- Stage 1: Production Dependencies ----------
FROM node:26-alpine AS deps
WORKDIR /app

COPY ../../package-lock.json ../../package.json ./

RUN npm ci --omit=dev

# ---------- Stage 2: builder ----------
FROM node:26-alpine
WORKDIR /app

COPY ../../package-lock.json ../../package.json ./

RUN npm ci

COPY . .
RUN npm run build:gateway
