FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY patches/ ./patches/

RUN npm install --legacy-peer-deps

COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/
COPY drizzle/ ./drizzle/
COPY vite.config.ts tsconfig.json drizzle.config.ts components.json ./

RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY patches/ ./patches/

RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/public ./dist/public

EXPOSE 3000

CMD ["node", "dist/index.js"]
