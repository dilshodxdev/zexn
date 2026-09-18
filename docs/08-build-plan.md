# 08 - Qurish rejasi va joriy holat

Holat belgilari: `[ ]` boshlanmagan, `[~]` jarayonda, `[x]` tayyor.

## Bosqich 1 - Skelet + hujjat skeleti `[~]` (REVIEW)

Task: [T-001-skeleton](tasks/T-001-skeleton.md). Egasi review qiladi.

Qabul mezonlari:

- [x] `pnpm install` xatosiz (pnpm 11, `allowBuilds`)
- [x] `pnpm build` (shared -> server -> client) xatosiz
- [x] `pnpm lint`, `pnpm format:check` toza
- [x] `docker compose up -d` Postgres; `prisma:migrate` birinchi migratsiya (`20260918054830_init`)
- [~] server `/health` `db: "ok"`, Vite proxy ishlaydi (curl); brauzer tekshiruvi egasida
- [ ] `docker compose -f docker-compose.prod.yml up --build` - tarmoq sabab sinalmadi, egasi qayta uradi
- [x] Hujjatlar: README, 01, 02, 04, 05, 08, tasks/_template, agent-log/*, AGENTS.md

## Bosqich 2 - Auth + tenant `[ ]`

Sherik (server) + egasi (client login ekrani). Task: T-002 (server), T-003 (client, keyin).

- `AuthStrategy` interfeysi (`verify(input) -> User`), JWT berish umumiy.
- Login + parol strategiyasi (bcrypt), birinchi kirishda parol almashtirish.
- Telegram deep-link strategiyasi: Telegraf bot `modules/auth/telegram/`, `/start <token>`.
- Access ~15 min, refresh ~30 kun (httpOnly cookie), `POST /auth/refresh`.
- `requireAuth`, `requireTenant`, `requireRole(...roles)`.
- Tenant-scoped Prisma extension (`tenantDb(centerId)`).
- `03-auth.md` yoziladi. `.env.example`: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `TELEGRAM_BOT_TOKEN`.

Qabul: login -> `/api/me` ishlaydi; boshqa markaz resursiga 404; tokenlar muddati; Telegram
bog'lash real bot bilan sinaladi.

## Bosqich 3 - Domen `[ ]`

- Schema: Group, Subject, Topic, TopicPrerequisite, Question, Test, TestAssignment,
  TestAttempt, Answer, KnowledgeGap, Material, NextStep.
- Seed: 1 fan, ~10 mavzu, graf, ~40 savol, materiallar.
- Test topshirish + deterministik tahlil (`analysis.service.ts`): mavzu bo'yicha xato foizi ->
  prerequisite'lar bo'yicha zaiflik -> gap + confidence -> 1 ta next step.

Qabul: seed'dagi test topshirilganda gap'lar kutilgan mavzularga chiqadi (unit test).

## Bosqich 4 - Frontend `[ ]`

- Student: test topshirish, bilim xaritasi, keyingi qadam.
- Teacher: guruh dashboard, test tayinlash.
- Admin: o'quvchi/o'qituvchi/guruh.
- `06-design-system.md`, `07-screens.md`.

Qabul: har ekranda loading/empty/error holatlari; UI o'zbekcha; mobil kenglikda buzilmaydi.

## Bosqich 5 - AI `[ ]`

- Real `AiProvider` (provayder egasi tanlaydi), env orqali tanlanadi, mock fallback.
- Ildiz sababi tushuntirishi + qadam matni.

Qabul: AI yiqilsa/timeout bo'lsa tizim mock matn bilan ishlayveradi.

## Bosqich 6 - Demo + deploy `[ ]`

- Real testga o'xshash seed, VPS Docker Compose, HTTPS, `DEPLOY.md`.

Qabul: tashqi domen orqali real o'quvchi test topshiradi, o'qituvchi dashboard'da ko'radi.
