# T-001 - Monorepo skeleti + hujjat skeleti

**Status:** DONE
**Phase:** 1
**Assignee:** Claude
**Reviewer:** egasi

## Goal

Ikkala dasturchi (egasi: client, sherik: server) birinchi kundan parallel ishlay oladigan
skelet: pnpm monorepo, `packages/shared` kontrakt, ishlaydigan server namunasi (`health`),
client `/api/health` ni ko'rsatadi, Docker dev/prod, hujjat qatlami.

## Read first

- `docs/README.md`, `AGENTS.md`
- `docs/04-data-model.md`, `docs/05-api.md`, `docs/08-build-plan.md`

## Requirements

1. Root: pnpm workspaces, TS ^5.6 bitta versiya, ESLint flat + Prettier, `.gitignore`,
   `.dockerignore`, `.env.example`, `.env.production.example`.
2. `packages/shared`: zod-only, `dist/` build, `API_ERROR_CODES`, `apiErrorBodySchema`,
   `healthResponseSchema`, `roleSchema`, `paginationQuerySchema`.
3. `apps/server`: Express 4 ESM, `env.ts` (Zod), `AppError`, `errorHandler`, `validate`,
   `asyncHandler`, `prisma.ts`, `AiProvider` + mock, `auth`/`tenant` stub (default yopiq),
   `health` moduli, Prisma schema (Center, User, Membership) + `init` migratsiya + seed.
4. `apps/client`: React 19 + Vite + Tailwind v4 + Zustand + TanStack Query + Router + axios
   - i18next (uz); Vite proxy nginx qoidasi bilan bir xil; `HomeScreen` health holatini
     loading/error/success bilan ko'rsatadi.
5. Docker: dev compose (faqat Postgres), prod compose (postgres + migrate + server + client),
   ikki Dockerfile (manifest-first, cache mount), `deploy/nginx.conf`.
6. Hujjatlar: `AGENTS.md`, `docs/README.md`, `01`, `02`, `04`, `05`, `08`, `tasks/_template.md`,
   `agent-log/*` (lokal), `CLAUDE.md` + `.claude/rules/` (lokal).

## Out of scope

- Auth, JWT, Telegram (T-002). Domen jadvallari (3-bosqich). Dizayn tizimi (4-bosqich).
- Git init / commit (egasi qiladi).

## Self-checks

- [x] `pnpm install` - toza (pnpm 11.8, `allowBuilds`)
- [x] `pnpm --filter @zexn/shared build`, `pnpm --filter @zexn/server typecheck`, `pnpm --filter @zexn/client build`
- [x] `pnpm lint`, `pnpm --filter @zexn/client lint`, `pnpm format:check`
- [x] `docker compose up -d` + `prisma:migrate --name init` + `db:seed` (host port 5434, chunki 5432 band)
- [x] server `/health` `db: ok`; Vite proxy `/api/health`, `/api` ishlaydi (curl bilan); brauzerda ekran egasi ko'radi
- [ ] `docker-compose.prod.yml build` - Docker ichidan npm registry timeout (tarmoq), sinalmadi

## Report

Claude jurnali: `docs/agent-log/claude.md` (2026-09-18). Fayl ro'yxati o'sha yerda.

- Qaror: pnpm 11 `onlyBuiltDependencies` ni o'qimadi -> `allowBuilds` xaritasi.
- Qaror: `@types/node` client devDeps'ga qo'shildi (`tsconfig.node.json` `types: ["node"]` talab qiladi).
- Prod image'da seed ishlamaydi (`tsx` dev dependency) - 6-bosqichda hal qilinadi (seed'ni
  `dist` ga build qilish yoki alohida `seed` service).

## Questions

- Login formati (`login` ustuni): telefon raqammi yoki `markaz.ism` uslubimi? 2-bosqichda hal.
- Domen kontenti (Subject/Topic/Question) global yoki markazga bog'liqmi? 3-bosqichda hal
  (`04-data-model.md` da ikkala variant yozilgan).

## Review findings

(egasi to'ldiradi)

- 2026-09-18, egasi: ekran brauzerda ko'rindi. DONE. Ochiq qolgan: prod build tarmoq sabab
  sinalmagan (6-bosqichda, DEPLOY.md bilan birga).
