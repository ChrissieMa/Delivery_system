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

COPY package.json ./
COPY patches/ ./patches/

# Keep devDependencies installed in the runtime image.
# The server bundle imports server/_core/vite.ts, which imports vite.config.ts at module load time;
# vite.config.ts depends on Vite plugins that are in devDependencies.
# Important: do NOT set NODE_ENV=production before this install, otherwise npm will omit devDependencies.
RUN npm install --legacy-peer-deps --include=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
