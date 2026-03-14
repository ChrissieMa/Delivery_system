FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY vite.config.ts tsconfig.json drizzle.config.ts components.json ./

# Build the app
RUN pnpm run build

FROM node:22-alpine AS production

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist

# Copy public assets if needed
COPY client/public/ ./dist/public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
