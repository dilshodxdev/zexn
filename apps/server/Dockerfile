# Build context: REPO ROOT (docker-compose.prod.yml shunday beradi).
#   docker build -f apps/server/Dockerfile .

# ---------- base ----------
FROM node:22-alpine AS base
RUN corepack enable && apk add --no-cache openssl
WORKDIR /repo

# ---------- build ----------
FROM base AS build
# Avval faqat manifestlar: kod o'zgarsa ham install layer cache'dan olinadi
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --filter @zexn/server...

# Endi kod
COPY packages/shared packages/shared
COPY apps/server apps/server
RUN pnpm --filter @zexn/shared build \
 && pnpm --filter @zexn/server exec prisma generate \
 && pnpm --filter @zexn/server build

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter @zexn/server...

COPY --from=build /repo/packages/shared/dist packages/shared/dist
COPY --from=build /repo/apps/server/dist apps/server/dist
# migrate deploy va seed uchun schema + migrations kerak
COPY --from=build /repo/apps/server/prisma apps/server/prisma
# prisma generate natijasi (client + engine) node_modules ichida
COPY --from=build /repo/node_modules/.pnpm node_modules/.pnpm

WORKDIR /repo/apps/server
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
