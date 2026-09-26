# Production Multi-Stage Dockerfile for Railway
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Clean installation of dependencies
RUN npm ci || npm install

# Copy source code
COPY . .

# Build Vite frontend & server bundle
RUN npm run build

# Production runner image (lean)
FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built artifacts and runtime dependencies
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/server.js"]
