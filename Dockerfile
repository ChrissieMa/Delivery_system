FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN pnpm install --no-frozen-lockfile

COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY vite.config.ts tsconfig.json drizzle.config.ts components.json ./

RUN pnpm run build

FROM node:22-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN pnpm install --no-frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY client/public/ ./dist/public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
