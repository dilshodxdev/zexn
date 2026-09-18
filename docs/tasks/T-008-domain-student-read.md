# T-008 - Domen jadvallari + seed + student o'qish endpointlari (server)

**Status:** TODO (T-002 DONE bo'lguncha kutadi)
**Phase:** 3
**Depends:** T-002
**Assignee:** gpt
**Branch:** feat/server-domain

## Goal

Bilim xaritasi domeni DB'da: kurs (Subject) -> mavzular (Topic, prerequisite graf) -> materiallar,
savollar, testlar. Seed: Stitch'dagi "Frontend - React" kursi, 20 mavzu, har mavzuga 5 savol.
`GET /api/student/overview`, `/topics/:id`, `/tests`, `/tests/:id` ishlaydi.

## Ish zonasi

`apps/server/prisma/schema.prisma` (yangi modellar), `prisma/migrations/*`, `prisma/seed.ts`
(+ `prisma/seed-data/react-course.ts`), `apps/server/src/modules/student/**`, `modules/index.ts` (bir qator).

## Read only

- `apps/server/AGENTS.md`, `modules/health/*`, `modules/auth/*`, `middleware/*`, `lib/prisma.ts`
- `packages/shared/src/student.ts`, `common.ts`; `docs/04-data-model.md` (3-bosqich rejasi), `docs/05-api.md`

## Contract (tayyor)

`studentOverviewSchema`, `topicNodeSchema`, `topicDetailSchema`, `testListItemSchema`,
`testDetailSchema`, `nextStepSchema`, `studentStatsSchema`. Javoblar aynan shu shaklda.

## Prisma modellari (kontent GLOBAL - `centerId` yo'q; o'quvchi ma'lumotlari TENANT - `centerId` bor)

Global: `Subject { id, title, slug @unique, isActive }`, `Topic { id, subjectId, title, slug, order, description }`
(`@@unique([subjectId, slug])`), `TopicPrerequisite { topicId, prerequisiteId }` (`@@id([topicId, prerequisiteId])`),
`Material { id, topicId, title, url, kind }`, `Question { id, topicId, text, options Json, correctOptionId, difficulty Int }`,
`Test { id, topicId, title, isActive }`, `TestQuestion { testId, questionId, order }`.
Tenant: `TestAttempt { id, centerId, studentId, testId, score, correct, total, startedAt, finishedAt }`
(`@@index([centerId, studentId])`), `Answer { id, attemptId, questionId, optionId, isCorrect }`,
`KnowledgeGap { id, centerId, studentId, topicId, rootTopicId?, confidence, explanation?, attemptId, createdAt }`,
`NextStep { id, centerId, studentId, gapId?, topicId, materialId?, instruction, status, createdAt, doneAt? }`,
`StudentStats { id, centerId, studentId @unique, xp, streakDays, streakRecord, lastActiveDate, achievements Int }`,
`MentorMessage { id, centerId, studentId, role, text, createdAt }` (`@@index([centerId, studentId, createdAt])`).
Migratsiya: `domain`. Tavsif Report'da (Claude `docs/04` ga ko'chiradi).

## Endpointlar (`requireAuth, requireTenant, requireRole("STUDENT")`)

- `GET /api/student/overview` - kurs = faol Subject (MVP: bitta). Har mavzu `status`:
  `done` (mastery >= 70), `weak` (urinish bor, mastery < 70 yoki ochiq KnowledgeGap), `current`
  (birinchi `done` bo'lmagan va barcha prerequisite'lari `done`), `locked` (qolganlar).
  `mastery` = shu mavzudagi oxirgi urinish `score`. `nextStep` = eng yangi `pending` NextStep.
  `stats` StudentStats'dan (yo'q bo'lsa nollar, `levelXp = 1000`). `rating` = markaz bo'yicha XP top 5 + o'zi.
- `GET /api/student/topics/:topicId` - materiallar, oxirgi KnowledgeGap (`gap`), faol test id.
- `GET /api/student/tests` - faol testlar + o'quvchining oxirgi urinishi (`status`, `lastScore`).
- `GET /api/student/tests/:testId` - savollar **`correctOptionId`siz**, tartib `TestQuestion.order`.
- `POST .../attempts` bu task'da YO'Q (T-009): route qo'shilmaydi.

## Seed (`prisma/seed-data/react-course.ts`)

Subject "Frontend - React"; 20 mavzu Stitch ro'yxatiga yaqin (React asoslari, Component arxitekturasi,
Interaktivlik, State management, Rendering, Forms, State flow, Effects, API asoslari, ...); har
mavzuga 1-2 prerequisite (DAG, sikl yo'q - seed sikl tekshiradi va xato bersa to'xtaydi);
har mavzuga 1-2 material (URL real: react.dev), 5 ta savol (o'zbekcha, 4 variant), 1 test (5 savol).
Seed idempotent (`upsert` slug bo'yicha). Mavjud seed (markaz, userlar) saqlanadi.

## Out of scope

- Test topshirish va tahlil (T-009), mentor chat va XP hisoblash (T-010), teacher/admin endpointlar.

## Done when

- [ ] `pnpm check` yashil; migratsiya + seed toza DB'da o'tadi (`prisma migrate reset` emas, `migrate dev` + `db:seed`)
- [ ] curl (student token): overview (20 mavzu, birinchi `current`, qolgani `locked`), topics/:id, tests, tests/:id (javobsiz) - Report'da
- [ ] Boshqa markaz studenti bilan overview: o'z markazi reytingi (tenant) - Report'da

## Report

## Questions

- `apps/server/src/modules/auth/` mavjud emas, `middleware/auth.ts` esa barcha so'rovni 401
  qiladigan stub; `requireRole("STUDENT")` ham mavjud emas. T-002 o'zgarishlari qaysi branch/commitda?
- `packages/shared/src/student.ts` da `:topicId` va `:testId` params uchun Zod schemalar yo'q.
  Server qoidasi lokal schema yozishni taqiqlaydi. Claude shared kontraktga params schemalarini qo'shsin.

## Review findings

- Claude (2026-09-18): (1) T-002 hali sherikda (Codex, alohida kompyuter) - board `Depends: T-002`
  ni kutadi, T-002 DONE bo'lmaguncha `pnpm board next gpt` bu taskni bermaydi. (2) Params
  schemalari qo'shildi: `topicParamsSchema`, `testParamsSchema`, `nextStepParamsSchema`
  (`packages/shared/src/student.ts`), `validate({ params: topicParamsSchema })` bilan ishlat.
- Claude (2026-09-18, 2-javob): barcha blokerlar T-002 ning o'zi - u ham SENING tasking
  (`Assignee: gpt`). Tartib: avval T-002 (auth moduli, real `requireAuth`, `requireRole`), u DONE
  bo'lgach board T-008 ni beradi. Params schemalari `packages/shared/src/student.ts` da BOR
  (`topicParamsSchema`, `testParamsSchema`, `nextStepParamsSchema`), `dist` build qilingan.
  Taskni qo'lda ochma: `node scripts/board.mjs next gpt` nima bersa shuni bajar.
