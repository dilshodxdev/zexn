# ZEXN.ai

**Bir sinf. O'ttiz xil yo'l.** Har bir o'quvchining bilimidagi bo'shliqni (xato ildizini) skill darajasida aniqlab,
unga mos keyingi o'quv qadamini beradigan AI platforma. Birinchi pilot: IT Park Xorazm.

**One class. Thirty different paths.** An AI platform that finds the root cause of every student's knowledge gap at
skill level and gives them the right next learning step. First pilot: IT Park Khorezm.

[O'zbekcha](#ozbekcha) | [English](#english)

---

## O'zbekcha

### Nima qiladi

| Modul | Tavsif |
| --- | --- |
| Bilim xaritasi | 20 mavzuli React kursi, prerequisite graf, har mavzuda test. Test natijasidan deterministik tahlil zaif prerequisite'ni (xato ildizini) topadi. |
| Vazifalar | O'qituvchi vazifa beradi, o'quvchi topshiradi, o'qituvchi qabul qiladi yoki qaytaradi (0-100 ball). Kod topshiriqlari VS Code (Monaco) muharririda. |
| AI mentor chat | O'quvchi bilan tabiiy o'zbek tilida gaplashadigan mentor: hol-ahvol so'raydi, keyingi qadamni taklif qiladi, kod yuborilsa review qiladi. Kunning birinchi kirishida o'zi salomlashadi. |
| SDT - Student Digital Twin | Har o'quvchining raqamli egizagi: 12 skill bo'yicha mastery (0-100), ishonch darajasi, aniqlangan xato patternlar, keyingi qadam, progress tarixi. Har test, vazifa va intervyudan keyin yangilanadi. |
| AI intervyu | Soha tanlanadi (frontend, backend, mobile, fullstack, android, ios), 5 savol: 3 nazariy + 2 kod topshirig'i (Monaco). AI baholaydi, yakuniy xulosa beradi, natija SDT'ga yoziladi. |
| O'qituvchi paneli | Dashboard (chap sidebar), vazifalar boshqaruvi, sinf ko'rinishi (kim xavfda, eng ko'p uchraydigan zaif skill/pattern), har o'quvchining egizagi: **Vazifa yubor**, **Qayta tekshir**, **Izoh yubor**. |
| Sozlamalar | O'qituvchi/markaz admini o'z markazi uchun, super admin butun platforma uchun AI system prompt kiritadi va sinab ko'radi. |
| Ko'p markaz (tenant) | Har o'quv markazi izolyatsiyalangan: `centerId` har so'rovda JWT'dan olinadi. |

Closed loop: **topshiriq -> AI tahlil -> xato pattern -> skill ta'siri -> SDT yangilanadi -> keyingi qadam -> maqsadli vazifa -> yangi topshiriq -> SDT qayta yangilanadi.**

### Texnologiyalar

pnpm workspaces, Node >= 20, TypeScript strict.
Client: React 19, Vite, Tailwind v4, Zustand, TanStack Query v5, React Router v6, i18next, Monaco.
Server: Express 4, Prisma 6, PostgreSQL 16, Zod. AI: DeepSeek (OpenAI-mos REST) yoki tarmoqsiz mock.
`packages/shared`: server va client uchun umumiy Zod kontraktlar.

```
apps/client      React ilova (o'quvchi, o'qituvchi, admin, super admin)
apps/server      Express API (routes -> controller -> service -> repository, Prisma faqat repository'da)
packages/shared  Zod schemalar, typelar, xato kodlari, konstantalar (SDT formulasi, intervyu sohalari)
scripts/         pnpm check invariantlari, task board
```

### Ishga tushirish (dev)

Talablar: Node >= 20, pnpm >= 9, Docker Desktop (Postgres uchun) yoki lokal PostgreSQL 16.

```bash
pnpm install
cp .env.example .env              # PowerShell: Copy-Item .env.example .env
docker compose up -d              # faqat Postgres (port .env dagi POSTGRES_PORT)
pnpm --filter @zexn/server prisma:migrate --name init
pnpm --filter @zexn/server db:seed
pnpm dev                          # shared watch + server :4000 + client :5173
```

Tekshirish: http://localhost:4000/health va http://localhost:5173.

`.env` dagi muhim qiymatlar:

| O'zgaruvchi | Nima |
| --- | --- |
| `DATABASE_URL` | Postgres ulanishi. Kompyuterda 5432 band bo'lsa `POSTGRES_PORT` va URL'dagi portni o'zgartiring (masalan 5434). |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Kamida 32 belgi, bir-biridan farqli. |
| `SEED_DEV_PASSWORDS=true` | Seed demo hisoblarni parol bilan yaratadi. Production'da bo'lmasin. |
| `AI_PROVIDER` | `mock` (tarmoqsiz, deterministik) yoki `deepseek`. |
| `DEEPSEEK_API_KEY` | `AI_PROVIDER=deepseek` bo'lsa majburiy; bo'sh bo'lsa server ataylab ko'tarilmaydi. |
| `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, `AI_TIMEOUT_MS` | Default: `deepseek-chat`, `https://api.deepseek.com`, `20000`. |
| `VITE_*_FIXTURE` | Client fixture rejimlari (faqat server yo'q paytda UI ishlab chiqish uchun). Default `false`. |

`.env` faylini o'zgartirgach serverni qayta ishga tushiring - u faqat startda o'qiladi.

### Demo hisoblar (`SEED_DEV_PASSWORDS=true`)

| Login | Parol | Rol | Boshlang'ich sahifa |
| --- | --- | --- | --- |
| `student` | `student` | O'quvchi | `/app` - bilim xaritasi, mentor chat, vazifalar, testlar, AI intervyu |
| `teacher` | `teacher` | O'qituvchi | `/teacher` - dashboard, vazifalar, o'quvchilar (SDT), sozlamalar |
| `admin` | `admin` | Markaz admini | `/admin` |
| `superadmin` | `superadmin` | Super admin | `/superadmin` - platforma ko'rsatkichlari, AI system prompt |
| `newstudent` | `temp1234` | O'quvchi (parol almashtirish oqimi) | `/change-password` |

### Demo ssenariysi (closed loop, 5 daqiqa)

1. `teacher` bilan kiring -> **O'quvchilar** -> o'quvchi ustiga bosing: egizakda State immutability 42%, faol pattern, "ZEXN tavsiyasi".
2. `student` bilan "State ni immutable yangilash" vazifasini oching, kod yuboring:
   `const u = user; u.name = "Namur"; setUser(u);` -> topshiring. SDT: 42% -> 38%, `DIRECT_STATE_MUTATION` faol.
3. `teacher`: egizakda **Vazifa yubor** - faqat shu o'quvchiga maqsadli vazifa ketadi.
4. `student`: yangi vazifada `setUser({ ...user, name: "Namur" })` yozib topshiradi.
5. `teacher`: vazifani qabul qiladi (90 ball). SDT: 38% -> ~59%, pattern RESOLVED, timeline'da o'zgarish.
6. `student`: **AI Intervyu** -> soha tanlab 5 savolga javob beradi (2 tasi kodda), natija SDT'ga yoziladi.

### AI qatlami

- Barcha AI prompt'lari bitta joyda: `apps/server/src/lib/ai/context-builder.ts`. Uch qatlam: shaxs (platforma/markaz prompt'i, DB) -> ZEXN faktlari (kod) -> vaziyat (o'quvchi, intervyu, xato).
- Provayder `apps/server/src/lib/ai/index.ts` da tanlanadi: `MockAiProvider` (dev/test) yoki `DeepSeekAiProvider`.
- Mentor ohangi: super admin -> Sozlamalar (platforma), o'qituvchi -> Sozlamalar (markaz). Default matn `MENTOR_PERSONA`.

### Foydali buyruqlar

```bash
pnpm check                 # typecheck + lint + prettier + arxitektura invariantlari (har ish oxirida)
pnpm check:server          # faqat server zonasi
pnpm check:client          # faqat client zonasi
pnpm --filter @zexn/server test        # vitest (tenant, JWT, SDT, intervyu, AI provayder)
pnpm --filter @zexn/server prisma:studio
pnpm --filter @zexn/server db:seed     # idempotent
pnpm build
```

### Production (Docker)

```bash
cp .env.production.example .env.production   # qiymatlarni to'ldiring (JWT sirlari, Postgres paroli, AI kaliti)
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Stack: Postgres + server (migratsiya avtomatik) + client (nginx, `/api` -> server). `SEED_DEV_PASSWORDS` production'da bo'lmasin.

---

## English

### What it does

| Module | Description |
| --- | --- |
| Knowledge map | 20-topic React course with a prerequisite graph and a test per topic. Deterministic analysis of test results finds the weak prerequisite (root cause). |
| Assignments | Teachers create tasks, students submit, teachers accept or return (score 0-100). Code tasks use a VS Code (Monaco) editor. |
| AI mentor chat | A mentor that talks naturally in Uzbek: checks in, suggests the next step, reviews code when a code block is sent. Greets the student on the first visit of the day. |
| SDT - Student Digital Twin | A living model of each student: mastery (0-100) across 12 skills, confidence, detected error patterns, next step, progress history. Updated after every test, assignment and interview. |
| AI interview | Pick a track (frontend, backend, mobile, fullstack, android, ios), 5 questions: 3 theory + 2 coding tasks (Monaco). AI grades, summarises, and feeds the result into the SDT. |
| Teacher panel | Dashboard with left sidebar, assignment management, class view (who is at risk, most common weak skill/pattern), each student's twin with actions: **Send task**, **Re-test**, **Send note**. |
| Settings | Teachers/center admins set an AI system prompt for their center; the super admin sets a platform-wide one. Both can be tested live. |
| Multi-tenant | Every learning center is isolated: `centerId` comes from the JWT on every request. |

Closed loop: **submission -> AI analysis -> error pattern -> skill impact -> SDT update -> next step -> targeted task -> new submission -> SDT updated again.**

### Stack

pnpm workspaces, Node >= 20, TypeScript strict.
Client: React 19, Vite, Tailwind v4, Zustand, TanStack Query v5, React Router v6, i18next, Monaco.
Server: Express 4, Prisma 6, PostgreSQL 16, Zod. AI: DeepSeek (OpenAI-compatible REST) or an offline mock.
`packages/shared`: Zod contracts shared by server and client.

```
apps/client      React app (student, teacher, admin, super admin)
apps/server      Express API (routes -> controller -> service -> repository; Prisma only in repositories)
packages/shared  Zod schemas, types, error codes, constants (SDT formula, interview tracks)
scripts/         pnpm check invariants, task board
```

### Getting started (dev)

Requirements: Node >= 20, pnpm >= 9, Docker Desktop (for Postgres) or a local PostgreSQL 16.

```bash
pnpm install
cp .env.example .env              # PowerShell: Copy-Item .env.example .env
docker compose up -d              # Postgres only (port from POSTGRES_PORT in .env)
pnpm --filter @zexn/server prisma:migrate --name init
pnpm --filter @zexn/server db:seed
pnpm dev                          # shared watch + server :4000 + client :5173
```

Verify: http://localhost:4000/health and http://localhost:5173.

Key `.env` values:

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | Postgres connection. If 5432 is taken on your machine, change `POSTGRES_PORT` and the port in the URL (e.g. 5434). |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | At least 32 characters, different from each other. |
| `SEED_DEV_PASSWORDS=true` | Seed creates demo accounts with passwords. Never set in production. |
| `AI_PROVIDER` | `mock` (offline, deterministic) or `deepseek`. |
| `DEEPSEEK_API_KEY` | Required when `AI_PROVIDER=deepseek`; the server refuses to start without it. |
| `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, `AI_TIMEOUT_MS` | Defaults: `deepseek-chat`, `https://api.deepseek.com`, `20000`. |
| `VITE_*_FIXTURE` | Client fixture modes (UI development without a server). Default `false`. |

Restart the server after editing `.env` - it is read only at startup.

### Demo accounts (`SEED_DEV_PASSWORDS=true`)

| Login | Password | Role | Landing page |
| --- | --- | --- | --- |
| `student` | `student` | Student | `/app` - knowledge map, mentor chat, tasks, tests, AI interview |
| `teacher` | `teacher` | Teacher | `/teacher` - dashboard, tasks, students (SDT), settings |
| `admin` | `admin` | Center admin | `/admin` |
| `superadmin` | `superadmin` | Super admin | `/superadmin` - platform stats, AI system prompt |
| `newstudent` | `temp1234` | Student (forced password change) | `/change-password` |

### Demo script (closed loop, 5 minutes)

1. Log in as `teacher` -> **Students** -> open a student: the twin shows State immutability 42%, an active pattern and the "ZEXN recommendation".
2. As `student`, open the "State ni immutable yangilash" task and submit
   `const u = user; u.name = "Namur"; setUser(u);`. SDT: 42% -> 38%, `DIRECT_STATE_MUTATION` becomes active.
3. As `teacher`, click **Send task** in the twin - a targeted task goes to this student only.
4. As `student`, submit `setUser({ ...user, name: "Namur" })` for the new task.
5. As `teacher`, accept it (score 90). SDT: 38% -> ~59%, pattern RESOLVED, the timeline shows the change.
6. As `student`, open **AI Interview**, pick a track and answer 5 questions (2 in the code editor); the result is written to the SDT.

### AI layer

- All prompts live in one place: `apps/server/src/lib/ai/context-builder.ts`. Three layers: persona (platform/center prompt from DB) -> ZEXN facts (code) -> situation (student, interview, error).
- The provider is chosen in `apps/server/src/lib/ai/index.ts`: `MockAiProvider` (dev/test) or `DeepSeekAiProvider`.
- Mentor tone: super admin -> Settings (platform), teacher -> Settings (center). Default text is `MENTOR_PERSONA`.

### Useful commands

```bash
pnpm check                 # typecheck + lint + prettier + architecture invariants (run before every commit)
pnpm check:server          # server zone only
pnpm check:client          # client zone only
pnpm --filter @zexn/server test        # vitest (tenant, JWT, SDT, interview, AI provider)
pnpm --filter @zexn/server prisma:studio
pnpm --filter @zexn/server db:seed     # idempotent
pnpm build
```

### Production (Docker)

```bash
cp .env.production.example .env.production   # fill in JWT secrets, Postgres password, AI key
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Stack: Postgres + server (migrations run automatically) + client (nginx, `/api` -> server). Never set `SEED_DEV_PASSWORDS` in production.

### License

Private. All rights reserved.
