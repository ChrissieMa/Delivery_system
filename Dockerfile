FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY patches/ ./patches/

RUN npm install --legacy-peer-deps

COPY . .

RUN test -f client/index.html
RUN npm run build
RUN test -f dist/index.js
RUN test -f dist/public/index.html

FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY patches/ ./patches/

# Do not omit devDependencies here.
# The bundled server still imports Vite-related packages from server/_core/vite.ts,
# so the Railway container can fail at runtime if devDependencies are missing.
RUN npm install --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
