# T-002 - Auth: strategy pattern, login/parol, JWT, tenant middleware

**Status:** TODO
**Phase:** 2
**Assignee:** sherik
**Reviewer:** egasi (Claude yordamida)

## Goal

Foydalanuvchi login + parol bilan kiradi, access/refresh token oladi, himoyalangan endpointlar
`requireAuth` + `requireTenant` orqali `req.user` va `req.centerId` ni oladi. Telegram
strategiyasi keyingi task (T-004), lekin interfeys shu task'da tayyor bo'lsin.

## Read first

- `docs/README.md`, `AGENTS.md` (ayniqsa 6 va 9-bo'limlar)
- `docs/04-data-model.md`, `docs/05-api.md` (2-bosqich jadvali)
- Namuna: `apps/server/src/modules/health/`, `middleware/auth.ts`, `middleware/tenant.ts`, `types/express.d.ts`

## Requirements

1. `packages/shared/src/auth.ts`: `loginBodySchema`, `changePasswordBodySchema`,
   `selectCenterBodySchema`, `authResponseSchema` (`accessToken`, `user`, `memberships`),
   `meResponseSchema`. **Egasi bilan kelishib, alohida kichik PR.**
2. `modules/auth/strategies/AuthStrategy.ts`: `interface AuthStrategy` - `name` va
   `verify(input: unknown): Promise<User>`. `PasswordStrategy` (bcrypt; `passwordHash` null
   bo'lsa INVALID_CREDENTIALS).
3. `modules/auth/token.service.ts`: access JWT (~15 min, payload: `sub`, `isSuperAdmin`,
   `membership?: { centerId, role }`), refresh (~30 kun, httpOnly cookie, DB'da `RefreshToken`
   jadvali: `id, userId, tokenHash, expiresAt, revokedAt`).
4. Endpointlar (`05-api.md` 2-bosqich jadvali): login, refresh, logout, change-password,
   select-center, `GET /api/me`.
5. `middleware/auth.ts` -> real `requireAuth` (Bearer verify -> `req.user`), `TOKEN_EXPIRED`
   alohida kod. `middleware/tenant.ts` o'zgarmaydi (allaqachon JWT'dan oladi).
   `requireRole(...roles)` qo'shiladi.
6. `lib/prisma.ts`: tenant-scoped extension yoki `tenantDb(centerId)` helper - repository'lar
   faqat shu orqali tenant jadvallariga kiradi.
7. `config/env.ts`: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` majburiy (min 32 belgi).
   `.env.example` yangilanadi.
8. `mustChangePassword = true` bo'lsa login javobida flag; change-password'dan boshqa
   endpointlar `403 FORBIDDEN` (`meta.reason: "PASSWORD_CHANGE_REQUIRED"`).
9. Seed: dev parollar bcrypt bilan, faqat alohida `SEED_DEV_PASSWORDS=true` env bilan
   (`NODE_ENV` tekshiruvi yetarli emas, `AGENTS.md` 9-bo'lim).
10. `docs/03-auth.md` yoziladi (oqim, endpointlar, xavfsizlik).

Ruxsat etilgan yangi dependency: `bcrypt` (+ `@types/bcrypt`), `jsonwebtoken` (+ types),
`cookie-parser` (+ types). Boshqasi kerak bo'lsa `Questions` ga.

## Out of scope

- Telegram bot (T-004). SMS OTP. Client login ekrani (T-003, egasi).
- Rate limiting (keyin; joyi `app.ts` da izoh bilan belgilansin).

## Self-checks

- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm format:check`
- [ ] `prisma migrate dev --name auth` - migratsiya fayli bor
- [ ] curl: login -> me -> refresh -> logout -> me (401) ketma-ketligi
- [ ] Boshqa markazning membership'i bilan select-center -> 403
- [ ] `TOKEN_EXPIRED` sinaldi (access muddatini env orqali qisqartirib)
- [ ] Uzun chiziq yo'q

## Report

## Questions

## Review findings
