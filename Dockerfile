FROM node:18-alpine as base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN corepack enable

FROM base as dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

FROM dependencies as prod-dependencies

RUN pnpm prune --prod

FROM base as build

WORKDIR /app

COPY --from=dependencies /app/node_modules /app/node_modules
COPY . .

RUN pnpm build

FROM base

ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

WORKDIR /app

COPY --from=prod-dependencies /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
COPY --from=build /app/package.json /app/package.json

CMD [ "pnpm","start" ]