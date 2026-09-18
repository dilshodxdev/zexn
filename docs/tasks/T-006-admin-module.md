# T-006 - Markaz admini: server moduli + admin ekranlari

**Status:** TODO (server qismi T-002 DONE bo'lgandan keyin; client qismi T-005 DONE bo'lgandan keyin)
**Phase:** 4
**Assignee:** gpt (Codex yoki ChatGPT, egasi belgilaydi)
**Branch:** feat/admin-module

## Goal

Markaz admini o'quvchi/o'qituvchi yaratadi (login + vaqtinchalik parol), guruh ochadi,
o'quvchilarni guruhga biriktiradi, ro'yxatlarni ko'radi. Hammasi o'z markazi ichida (tenant).

## Ish zonasi (faqat shu papkalar; boshqa joyga tegish - CHANGES_REQUESTED)

Server: `apps/server/src/modules/admin/**`, `apps/server/prisma/schema.prisma` (faqat `Group`,
`GroupMember` qo'shish) + migratsiya, `apps/server/src/modules/index.ts` (bir qator: `/admin`).
Client: `apps/client/src/features/admin/**`, `apps/client/src/screens/admin/**`,
`apps/client/src/locales/uz/admin.json`, `src/lib/i18n.ts` (bir qator), `src/routes.ts` (`admin.*` yo'llari),
`src/App.tsx` (admin route'lar).

## Read only

- `AGENTS.md`, `apps/server/AGENTS.md`, `apps/client/AGENTS.md`
- Server namuna: `apps/server/src/modules/health/*`, `modules/auth/*` (T-002 dan keyin), `middleware/*`
- Client namuna: `apps/client/src/features/auth/*`, `components/ui/index.ts`, `screens/auth/*`
- `packages/shared/src/admin.ts`, `common.ts` (kontrakt), `docs/05-api.md`, `docs/04-data-model.md`

## Contract (tayyor, `@zexn/shared`)

`createMemberBodySchema`, `updateMemberBodySchema`, `listMembersQuerySchema`, `memberItemSchema`,
`createGroupBodySchema`, `updateGroupBodySchema`, `groupStudentsBodySchema`, `groupItemSchema`,
`adminOverviewSchema`, `Paginated<T>`. Ro'yxat javobi `{ items, total, page, limit }`.

## Server: endpointlar (hammasi `requireAuth, requireTenant, requireRole("CENTER_ADMIN")`)

| Method | Path                                          | Body/Query                | Javob                   |
| ------ | --------------------------------------------- | ------------------------- | ----------------------- |
| GET    | `/api/admin/overview`                         | -                         | `adminOverviewSchema`   |
| GET    | `/api/admin/users`                            | `listMembersQuerySchema`  | `Paginated<MemberItem>` |
| POST   | `/api/admin/users`                            | `createMemberBodySchema`  | `MemberItem` (201)      |
| PATCH  | `/api/admin/users/:userId`                    | `updateMemberBodySchema`  | `MemberItem`            |
| GET    | `/api/admin/groups`                           | `paginationQuerySchema`   | `Paginated<GroupItem>`  |
| POST   | `/api/admin/groups`                           | `createGroupBodySchema`   | `GroupItem` (201)       |
| PATCH  | `/api/admin/groups/:groupId`                  | `updateGroupBodySchema`   | `GroupItem`             |
| POST   | `/api/admin/groups/:groupId/students`         | `groupStudentsBodySchema` | `GroupItem`             |
| DELETE | `/api/admin/groups/:groupId/students/:userId` | -                         | 204                     |

Qoidalar:

1. Prisma: `Group { id, centerId, name, teacherUserId?, isActive, createdAt, updatedAt }`
   (`@@index([centerId])`), `GroupMember { id, groupId, userId, createdAt }` (`@@unique([groupId, userId])`).
   Migratsiya nomi `admin-groups`. `docs/04` uchun tavsif Report'da.
2. Har repository so'rovida `where: { centerId }`. Boshqa markaz user/group -> 404.
3. User yaratish: `login` global unique - band bo'lsa 409 `VALIDATION_ERROR` (`path: "login"`).
   Mavjud login boshqa markazda bo'lsa ham 409 (akkaunt birlashtirish T-009).
   `mustChangePassword = true`. `groupId` berilsa STUDENT bo'lishi shart.
4. `teacherUserId` shu markazda TEACHER membership'i bo'lgan user bo'lishi shart, aks holda 400.
5. `PATCH users` `isActive=false` -> `Membership.isActive=false` (User o'chmaydi).
6. **Kritik test** (`admin.service.test.ts`): boshqa `centerId` bilan yaratilgan user/group
   ro'yxatda chiqmaydi va `:id` bilan 404 (tenant scope). vitest, DB'siz - repository mock.

## Client: ekranlar (`/admin/*`, `RequireAuth` role CENTER_ADMIN)

- `/admin` - overview: 3 ta raqam (kit `Card`) + tez havolalar.
- `/admin/users` - ro'yxat (jadval desktop / kartalar mobil), filter `role`, qidiruv, sahifalash;
  "Yangi" -> modal/sahifa forma (`createMemberBodySchema`); yaratilgandan keyin login + vaqtinchalik
  parol bir marta ko'rsatiladi ("nusxa olish" tugmasi).
- `/admin/groups` - ro'yxat, "Yangi guruh", guruh ichida o'quvchi qo'shish/olib tashlash (`Select` + ro'yxat).
- Layout: `screens/admin/AdminLayout.tsx` - mobil bottom-nav (`pb-safe`), desktop sidebar; chiqish tugmasi.
- Har ro'yxat: loading / empty (`EmptyState`) / error (`ErrorState`).

## Out of scope

- O'qituvchi/o'quvchi ekranlari, testlar, super admin, Telegram, import (CSV).

## Done when

- [ ] `pnpm check` yashil; `pnpm --filter @zexn/server test` (tenant testi) o'tadi
- [ ] curl: admin login -> users POST/GET/PATCH, groups POST/students POST/DELETE (Report'da)
- [ ] Boshqa markaz admini bilan `:id` -> 404 (curl bilan ko'rsatilgan)
- [ ] 360px va desktop: `/admin`, `/admin/users`, `/admin/groups` (egasi ko'radi)

## Report

## Questions

## Review findings
