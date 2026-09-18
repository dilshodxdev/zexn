# T-009 - Test topshirish + deterministik xato-ildizi tahlili (server)

**Status:** TODO
**Phase:** 3
**Depends:** T-008
**Assignee:** gpt
**Branch:** feat/server-analysis

## Goal

`POST /api/student/tests/:testId/attempts` - javoblar tekshiriladi, `KnowledgeGap` va `NextStep`
deterministik hisoblanadi (prerequisite graf + statistika), XP beriladi. Bu loyihaning yadrosi:
"xato ILDIZI" shu yerda topiladi. AI matn (`explanation`) `AiProvider` orqali - yiqilsa null.

## Ish zonasi

`apps/server/src/modules/student/**` (yangi: `analysis.service.ts`, `analysis.service.test.ts`,
`attempt.*`), `src/lib/ai/*` (faqat interfeys ishlatiladi, o'zgartirilmaydi).

## Read only

- `apps/server/AGENTS.md`, `modules/student/*` (T-008), `lib/ai/AiProvider.ts`, `lib/ai/index.ts`
- `packages/shared/src/student.ts` (`submitAttemptBodySchema`, `attemptResultSchema`, `nextStepSchema`)

## Algoritm (`analysis.service.ts`, sof funksiya - DB'siz, test qilinadi)

Kirish: `topicId`, savollar (`questionId, topicId, isCorrect`), prerequisite graf (`Map<topicId, prerequisiteIds[]>`),
o'quvchining har mavzu bo'yicha `mastery` (oxirgi score, yo'q bo'lsa null).

1. `score = correct / total * 100`. `score >= 70` -> gap yo'q, mavzu `done`.
2. `score < 70` -> gap bor. Ildiz qidirish: prerequisite'lar orasida `mastery` eng past bo'lgan
   (`< 70` yoki `null` - hech urinilmagan) mavzu = `rootTopicId`. `confidence`:
   prerequisite mastery `null` -> 0.5; `< 50` -> 0.9; `50..69` -> 0.7. Prerequisite'lar hammasi
   `>= 70` -> `rootTopicId = null`, `confidence = 0.6` (muammo mavzuning o'zida).
   Chuqurlik 1 (prerequisite'ning prerequisite'i qaralmaydi - MVP).
3. NextStep: `rootTopicId` bo'lsa - shu mavzu, birinchi materiali, `instruction`:
   "Avval <root> mavzusini takrorlang: <material>. Keyin <topic> testini qayta topshiring.";
   bo'lmasa - mavzuning o'zi va materiali. Eski `pending` NextStep'lar shu mavzu uchun `done`
   emas, `superseded`? YO'Q - MVP: shu `topicId` uchun eski pending'lar o'chiriladi, yangisi yoziladi.
4. XP: `correct * 10`, `score >= 70` bo'lsa +50 bonus. Streak: `lastActiveDate` kecha -> +1,
   bugun -> o'zgarmaydi, boshqa -> 1. `streakRecord = max`. Sana **Asia/Tashkent** bo'yicha kun.
5. `explanation`: `createAiProvider().explainRootCause({...})` - `try/catch`, 3s timeout, yiqilsa null.
   Javob kutilmaydi deb hisoblama: sinxron kutiladi, lekin timeout bilan.

Endpoint: bitta tranzaksiya: TestAttempt + Answer[] + KnowledgeGap + NextStep + StudentStats.
Javob `attemptResultSchema`. Yuborilgan `questionId` testga tegishli bo'lmasa 400 `VALIDATION_ERROR`;
barcha savolga javob bo'lmasa 400. Test faol emas -> 404.

## Kritik test (`analysis.service.test.ts`, vitest, DB'siz)

- score >= 70 -> gap yo'q.
- score < 70, prerequisite mastery 40 -> root = o'sha, confidence 0.9.
- prerequisite'lar hammasi >= 70 -> root null, confidence 0.6.
- prerequisite urinilmagan (null) -> root = o'sha, confidence 0.5.
- Ikki prerequisite: eng pasti tanlanadi.

## Out of scope

- Mentor chat (T-010), teacher ko'rinishi, adaptiv test, chuqurlik > 1.

## Done when

- [ ] `pnpm check` yashil; `pnpm --filter @zexn/server test` o'tadi (5 ta holat)
- [ ] curl: student seed bilan test topshirish (ataylab 2/5) -> gaps + nextSteps + xpEarned; qayta overview: mavzu `weak`, nextStep bor - Report'da
- [ ] Ikki marta topshirish: eski pending NextStep almashgan

## Report

## Questions

## Review findings
