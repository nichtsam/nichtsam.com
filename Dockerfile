FROM node:24-alpine AS base

RUN npm i -g corepack@latest && corepack enable pnpm

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.ts tsconfig.json ./
COPY app ./app
COPY content ./content
COPY public ./public

CMD ["node", "--import", "remix/node-tsx", "server.ts"]
