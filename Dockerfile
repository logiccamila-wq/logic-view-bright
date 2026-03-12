# Multi-stage build for Vite + Express (Node 20)
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (including devDependencies for build)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build the Vite frontend
FROM deps AS builder
COPY . .
RUN npm run build

# Production image — only runtime dependencies + dist + server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server
COPY api ./api
EXPOSE 3000
CMD ["node", "server/index.js"]
