# T-005 - Landing, Login, Register ekranlari + auth oqimi (client)

**Status:** TODO (T-003 DONE bo'lgandan keyin; T-004 bilan parallel emas, ketma-ket)
**Phase:** 4
**Assignee:** gemini
**Branch:** feat/client-auth-screens

## Goal

Ochiq qism: `/` landing, `/login`, `/register` (markaz ro'yxatdan o'tadi). Kirgandan keyin
rolga qarab yo'naltirish: CENTER_ADMIN -> `/admin`, STUDENT/TEACHER -> `/app`. Access token
xotirada, refresh cookie'da; 401 `TOKEN_EXPIRED` bo'lsa client avtomatik `/auth/refresh` qilib
so'rovni qaytaradi.

## Read only

- `apps/client/AGENTS.md`, `apps/client/src/components/ui/index.ts` (kit API)
- `apps/client/src/lib/api.ts`, `src/stores/authStore.ts`, `src/routes.ts`, `src/App.tsx`, `src/lib/i18n.ts`
- `apps/client/src/features/health/*` (namuna)
- `packages/shared/src/auth.ts` (kontrakt), `docs/05-api.md` (2-bosqich jadvali)
- `docs/design/stitch/*` (landing/login dizayni bo'lsa; bo'lmasa kit tokenlari bilan sodda)

## Contract

`@zexn/shared`: `registerCenterBodySchema`, `loginBodySchema`, `authResponseSchema`,
`meResponseSchema`, `selectCenterBodySchema`, `API_ERROR_CODES`. Endpointlar:
`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`,
`POST /auth/select-center`, `GET /me` (hammasi `/api` ostida, `api` instance baseURL'da).

## Files

- `src/stores/authStore.ts` - `accessToken`, `user`, `memberships`, `currentMembership`, `setSession(AuthResponse)`, `clear()`
- `src/lib/api.ts` - request interceptor (Bearer), response interceptor: `TOKEN_EXPIRED` -> bir marta refresh -> retry; refresh ham yiqilsa `clear()` + `/login`
- `src/features/auth/auth.api.ts`, `useAuth.ts` (login/register/logout mutation, `useMe` query)
- `src/features/auth/RequireAuth.tsx` - guard: sessiya yo'q -> `/login` (`from` bilan); rol mos kelmasa -> o'z zonasiga
- `src/features/auth/LoginForm.tsx`, `RegisterForm.tsx` - kit `Input`/`Button`, xatolar `ApiError.meta.issues` dan maydonga
- `src/screens/landing/LandingScreen.tsx`, `src/screens/auth/LoginScreen.tsx`, `RegisterScreen.tsx`
- `src/screens/app/AppHomeScreen.tsx`, `src/screens/admin/AdminHomeScreen.tsx` - **faqat placeholder** ("Tez kunda"), T-006/T-007 to'ldiradi
- `src/screens/dev/HealthScreen.tsx` - hozirgi HomeScreen shu yerga ko'chadi (`/dev/health`)
- `src/routes.ts`, `src/App.tsx` - yo'llar: `home`, `login`, `register`, `app`, `admin`, `dev.health`, `dev.uiKit`
- `src/locales/uz/auth.json`, `landing.json` + `i18n.ts` ga ulash
- `src/main.tsx` - ilova ochilganda `POST /auth/refresh` bir marta (sessiyani tiklash), natijaga qadar `Spinner`

## Requirements

1. Landing mobil-first: hero (shior "Bir sinf. O'ttiz xil yo'l."), 3 ta afzallik, "Kirish" va
   "Markazni ro'yxatdan o'tkazish" tugmalari. Matn `landing.json` da.
2. Login: `login`, `password`; xato -> `INVALID_CREDENTIALS` uchun `auth.errors.invalidCredentials`.
   Muvaffaqiyat: `setSession`, `mustChangePassword` bo'lsa `/app/change-password` (placeholder yo'l, ekran T-007).
3. Register: `centerName`, `fullName`, `login`, `password`, `passwordConfirm` (faqat client);
   Zod (`registerCenterBodySchema`) bilan client'da ham tekshir, xabarlar o'zbekcha.
4. `currentMembership` `null` va memberships > 1 -> `/select-center` oddiy ro'yxat (kit `Card` + `Button`).
5. Logout: `POST /auth/logout` -> `clear()` -> `/`.
6. Token localStorage/sessionStorage'ga yozilmaydi.
7. Server hali tayyor bo'lmasa: schema typelariga qarab yoz, `Report` da "server bilan sinalmadi" deb yoz.
   Codex tayyor bo'lganda `pnpm dev` bilan qayta sinaladi.

## Out of scope

- Telegram login tugmasi (T-008), parol almashtirish ekrani (T-007), student workspace (T-006), admin (T-007).

## Done when

- [ ] `pnpm check` yashil, build o'tadi
- [ ] 360px va desktop: `/`, `/login`, `/register`, `/select-center` (egasi ko'radi)
- [ ] Server bor bo'lsa: register -> `/admin`; login (student seed) -> `/app`; logout -> `/`
- [ ] Access token muddati o'tganda so'rov avtomatik refresh bilan qaytariladi (Report'da qanday sinalgani)

## Report

## Questions

## Review findings
