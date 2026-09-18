# T-002 - Auth: strategy pattern, login/parol, JWT, tenant middleware

**Status:** TODO
**Phase:** 2
**Assignee:** codex
**Branch:** feat/server-auth

## Goal

Login + parol bilan kirish, access/refresh token, `requireAuth` + `requireTenant` + `requireRole`
ishlaydi. Telegram strategiyasi keyingi task (T-004), lekin `AuthStrategy` interfeysi shu yerda.

## Read only

- `apps/server/AGENTS.md`
- `apps/server/src/modules/health/*` (namuna), `middleware/auth.ts`, `middleware/tenant.ts`,
  `types/express.d.ts`, `config/env.ts`, `lib/AppError.ts`, `lib/prisma.ts`
- `apps/server/prisma/schema.prisma`
- `packages/shared/src/auth.ts` (Claude qo'shadi, T-002 boshlanishidan oldin)
- `docs/05-api.md` (2-bosqich jadvali)

## Contract

`@zexn/shared`: `loginBodySchema`, `changePasswordBodySchema`, `selectCenterBodySchema`,
`authResponseSchema`, `meResponseSchema`, `API_ERROR_CODES.{UNAUTHORIZED, TOKEN_EXPIRED,
INVALID_CREDENTIALS, FORBIDDEN, TENANT_REQUIRED}`. Claude qo'shadi: `packages/shared/src/auth.ts`.

## Files

- `prisma/schema.prisma` - `RefreshToken` modeli (`id, userId, tokenHash, expiresAt, revokedAt, createdAt`) + migratsiya `auth`
- `src/modules/auth/strategies/AuthStrategy.ts` - interfeys: `name`, `verify(input: unknown): Promise<User>`
- `src/modules/auth/strategies/PasswordStrategy.ts` - bcrypt
- `src/modules/auth/token.service.ts` - access/refresh yaratish, tekshirish, refresh'ni DB'da saqlash (hash)
- `src/modules/auth/auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`
- `src/modules/me/me.routes.ts`, `me.controller.ts`, `me.service.ts`, `me.repository.ts`
- `src/modules/index.ts` - `/auth`, `/me` ulash
- `src/middleware/auth.ts` - real `requireAuth` + `requireRole(...roles)`
- `src/config/env.ts` - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` majburiy (min 32), `.env.example`
- `src/app.ts` - `cookie-parser`
- `prisma/seed.ts` - `SEED_DEV_PASSWORDS=true` bo'lsa dev parollar (bcrypt)
- `src/modules/auth/token.service.test.ts` - kritik test (verify, expire, revoked refresh)

## Requirements

1. `POST /api/auth/login` `{ login, password }` -> `{ accessToken, user, memberships, mustChangePassword }`
   - refresh httpOnly cookie (`Secure` prod'da, `SameSite=Lax`, path `/api/auth`).
     Noto'g'ri login/parol yoki `passwordHash` null -> 401 `INVALID_CREDENTIALS` (bir xil xabar).
     `Center.isActive=false` bo'lgan membership javobga kirmaydi.
2. Access JWT ~15 min: `{ sub, isSuperAdmin, membership?: { centerId, role } }`. Refresh ~30 kun,
   DB'da hash; `POST /api/auth/refresh` eski refresh'ni bekor qilib yangisini beradi (rotation).
3. `POST /api/auth/logout` - refresh bekor + cookie tozalash.
4. `POST /api/auth/select-center` `{ centerId }` -> shu user'ning faol membership'i bo'lsa yangi
   access (`membership` bilan); bo'lmasa 403 `FORBIDDEN`. (Bu yerda body'dagi `centerId`
   ruxsat etilgan yagona joy - u tenant emas, tanlov.)
5. `POST /api/auth/change-password` `{ currentPassword, newPassword }`; `mustChangePassword` -> false.
   `mustChangePassword=true` bo'lgan user boshqa himoyalangan endpointlarda 403 `FORBIDDEN`,
   `meta.reason = "PASSWORD_CHANGE_REQUIRED"`.
6. `GET /api/me` -> user + memberships + joriy membership.
7. `requireAuth`: Bearer yo'q/noto'g'ri -> 401 `UNAUTHORIZED`; muddati o'tgan -> 401 `TOKEN_EXPIRED`.
   `requireRole("TEACHER", "CENTER_ADMIN")` - super admin hamma joyga o'tadi.
8. Ruxsat etilgan dependency: `bcrypt` + `@types/bcrypt`, `jsonwebtoken` + `@types/jsonwebtoken`,
   `cookie-parser` + `@types/cookie-parser`.

## Out of scope

- Telegram (T-004), SMS, rate limit (joyi `app.ts` da `// TODO(rate-limit)` izoh), client (T-003).
- Tenant-scoped Prisma extension (T-005, domen jadvallari bilan birga).

## Done when

- [ ] `pnpm check` yashil
- [ ] curl: login -> me -> refresh -> me -> logout -> refresh (401) - buyruq va javoblar Report'da
- [ ] `TOKEN_EXPIRED` sinaldi (`JWT_ACCESS_TTL=5s` kabi env bilan yoki testda)
- [ ] `token.service.test.ts` o'tadi (`pnpm --filter @zexn/server test`)
- [ ] `docs/04` uchun `RefreshToken` tavsifi Report'da (Claude hujjatga ko'chiradi)

## Report

## Questions

## Review findings
