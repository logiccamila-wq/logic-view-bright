# Dockerfile multi-stage para Next.js + Node 20
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Instalação de dependências (cache)
FROM base AS deps
COPY package*.json ./
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    npm cache clean --force

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || true

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "server.js"]
