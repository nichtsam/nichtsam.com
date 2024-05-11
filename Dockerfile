FROM node:20-alpine as base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN corepack use pnpm@9
RUN corepack enable pnpm

FROM base as deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install

FROM deps as prod-deps

RUN pnpm prune --prod

FROM deps as build

COPY . .
RUN pnpm build

FROM base

ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

WORKDIR /app

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/server-utils.js /app/server-utils.js
COPY ./mdx ./mdx

CMD [ "pnpm","start" ]
