# ============================================
# LKS Display Box - Invoice & Shipping System
# Multi-stage Docker build for Railway
# ============================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN pnpm install --frozen-lockfile

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY vite.config.ts tsconfig.json drizzle.config.ts components.json ./

# Build frontend and backend
RUN pnpm run build

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy public assets (logo etc.)
COPY client/public/ ./dist/public/

# Environment variables — set at runtime via Railway dashboard
# PORT is automatically set by Railway, do NOT hardcode
ENV NODE_ENV=production

# Expose port (Railway sets $PORT automatically)
EXPOSE ${PORT:-3000}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Start command
CMD ["node", "dist/index.js"]
