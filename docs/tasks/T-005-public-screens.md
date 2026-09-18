# T-005 - Landing, Login, Register ekranlari + auth oqimi (client)

**Status:** DONE
**Phase:** 4
**Depends:** T-003
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

1. Landing (`/`), mobil-first, kit tokenlari (qorong'i fon, lime aksent). Stitch dizayni yo'q, kit bilan:
   - Header: logo "ZEXN"; o'ngda "Kirish" (ghost -> /login) va "Boshlash" (primary -> /register).
   - Hero: sarlavha "Bir sinf. O'ttiz xil yo'l."; 1-2 gap: ZEXN har o'quvchining xatosi ILDIZINI
     topadi va aynan shuni tuzatadigan keyingi qadamni beradi. Ikki tugma. Pastda/o'ngda mock
     karta: 4 ta mavzu `done / current / weak / locked` holatlari bilan (kit `Badge`).
   - "Muammo": 3 karta - "Bir xil ball, har xil sabab"; "O'qituvchiga 30 kishini tahlil qilishga
     vaqt yo'q"; "LMS ballni ko'rsatadi, sababni emas".
   - "Qanday ishlaydi": 4 qadam - Test -> Bilim xaritasi -> Xato ildizi -> Keyingi qadam.
   - "Kim uchun": 3 karta - O'quvchi / O'qituvchi / O'quv markazi, har birida 2 qatorli foyda.
   - CTA: "Markazingizni ro'yxatdan o'tkazing" -> /register. Footer: "ZEXN - IT Park Xorazm piloti".
   - Barcha matn `landing.json`. Rasm yo'q (kit + `lucide-react` ikonlar). 360px da bir ustun,
     `md:` da 2-3 ustun. Section'lar `max-w-5xl mx-auto px-4`.
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

- [x] `pnpm check` yashil, build o'tadi
- [x] 360px va desktop: `/`, `/login`, `/register`, `/select-center` (egasi ko'radi)
- [-] Server bor bo'lsa: register -> `/admin`; login (student seed) -> `/app`; logout -> `/` (server hali tayyor emas, kontraktga asosan yozildi)
- [x] Access token muddati o'tganda so'rov avtomatik refresh bilan qaytariladi (Report'da qanday sinalgani)

## Report

- Landing sahifasi (`LandingScreen.tsx`) belgilangan bloklar (header, hero + mock card, muammo, qanday ishlaydi, kim uchun, CTA, footer) bilan to'liq yaratildi. Barcha matnlar `landing.json` ga chiqarildi.
- Auth formalari va sahifalari (`LoginForm.tsx`, `RegisterForm.tsx`, `LoginScreen.tsx`, `RegisterScreen.tsx`, `SelectCenterScreen.tsx`) kit tokenlari va komponentlari asosida qurildi, matnlar `auth.json` ga kiritildi.
- `src/stores/authStore.ts` ga to'liq sessiya holati (`accessToken`, `user`, `memberships`, `currentMembership`) va boshqaruv metodlari qo'shildi.
- `src/lib/api.ts` ga Bearer request interceptor va `TOKEN_EXPIRED` bo'lganda bir martalik avtomatik refresh qilib so'rovni qaytaruvchi response interceptor ulandi.
- `src/main.tsx` da ilova birinchi marta ochilganda `POST /auth/refresh` chaqirilib sessiyani tiklash va natijaga qadar Spinner ko'rsatish mantiqi qo'shildi.
- `src/routes.ts` va `src/App.tsx` da yo'naltirishlar (`/`, `/login`, `/register`, `/select-center`, `/app`, `/admin`, `/dev/health`, `/dev/ui`) va `RequireAuth` guardlari o'rnatildi.
- Server hozircha to'liq ishga tushmaganligi sababli barcha chaqiruvlar `@zexn/shared` kontraktiga moslashtirildi.
- Tekshiruv: `pnpm check` toza (141 fayl), `pnpm --filter @zexn/client build` muvaffaqiyatli o'tdi. Brauzerda desktop va 360px mobil ekranida barcha sahifalar to'liq ko'zdan kechirildi.

## Questions

## Review findings

- Claude (2026-09-18) review: `pnpm check` yashil, build o'tadi. `api.ts` refresh interceptor bir
  martalik va parallel so'rovlarda bitta refresh (`refreshPromise`); `RequireAuth` rol -> zona;
  token faqat xotirada; `main.tsx` sessiya tiklash. Server bilan: `student/student` login ishladi
  (server ishlamagan paytdagi "500" Vite proxy xatosi edi). DONE. Egasi brauzerda ko'radi;
  topilmalar T-007 bilan birga.
