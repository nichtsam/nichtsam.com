FROM node:22-alpine AS base

RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends ca-certificates
corepack use pnpm@9
corepack enable pnpm
EOF

FROM base AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# COPY patches /app/patches
RUN pnpm install

FROM deps AS prod-deps

RUN pnpm prune --prod

FROM deps AS build

ARG COMMIT_SHA
ENV COMMIT_SHA $COMMIT_SHA

COPY . .

# Sentry monitoring
ARG SENTRY_ORG 
ARG SENTRY_PROJECT 
ENV SENTRY_ORG $SENTRY_ORG
ENV SENTRY_PROJECT $SENTRY_PROJECT
# Secured way to expose secret to the build 
# https://docs.docker.com/build/building/secrets/
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
  pnpm build

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
COPY --from=build /app/server-monitoring.js /app/server-monitoring.js
COPY ./content ./content

CMD [ "pnpm","start" ]
