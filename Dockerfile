FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY patches/ ./patches/

RUN npm install --legacy-peer-deps

COPY . .

RUN test -f client/index.html
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY patches/ ./patches/

RUN npm install --omit=dev --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
