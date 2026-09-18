# Build context: REPO ROOT.
#   docker build -f apps/client/Dockerfile --build-arg VITE_API_URL= .

# ---------- build ----------
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

# Manifest-first: kod o'zgarsa ham install cache'da qoladi
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/client/package.json apps/client/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @zexn/client...

COPY packages/shared packages/shared
COPY apps/client apps/client

# Bo'sh = /api (nginx proxy). Vite build vaqtida bundle ichiga kiradi.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @zexn/shared build && pnpm --filter @zexn/client build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/client/dist /usr/share/nginx/html
EXPOSE 80
