FROM node:24-alpine AS base

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends ca-certificates
npm i -g corepack@latest
corepack enable pnpm
corepack use pnpm@10
EOF

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# COPY patches /app/patches
RUN pnpm install

FROM deps AS prod-deps

RUN pnpm prune --prod

FROM deps AS build

COPY . .

RUN pnpm build

FROM base

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

WORKDIR /app

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/server-utils.js /app/server-utils.js
COPY ./content ./content

CMD [ "pnpm","start" ]
