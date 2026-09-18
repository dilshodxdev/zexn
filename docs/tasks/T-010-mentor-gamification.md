# T-010 - AI Mentor chat + next-step done + reyting (server)

**Status:** TODO
**Phase:** 5
**Depends:** T-009
**Assignee:** gpt
**Branch:** feat/server-mentor

## Goal

`GET/POST /api/student/mentor/messages` - o'quvchi AI mentor bilan yozishadi; mentor kontekstda
o'quvchining joriy `nextStep` va `weak` mavzularini biladi. `POST /api/student/next-steps/:id/done`.

## Ish zonasi

`apps/server/src/modules/student/**` (mentor.*), `src/lib/ai/AiProvider.ts` (+ `chat` metodi),
`src/lib/ai/MockAiProvider.ts`, `src/config/env.ts` (AI env, ixtiyoriy), `.env.example`.

## Read only

- `apps/server/AGENTS.md`, `modules/student/*`, `lib/ai/*`, `packages/shared/src/student.ts`

## Requirements

1. `AiProvider` ga `chat(input: { system: string; history: { role: "student" | "mentor"; text: string }[]; message: string }): Promise<string>`
   qo'shiladi. `MockAiProvider.chat` - deterministik: xabarda mavzu nomi bo'lsa shu mavzu materialini tavsiya
   qiladi, aks holda `nextStep.instruction` ni qaytaradi. Real provayder T-011 (egasi tanlaydi).
2. `POST mentor/messages` (`sendMentorMessageBodySchema`): student xabari saqlanadi -> system prompt
   (o'zbekcha: o'quvchi ismi, kurs, `weak` mavzular, joriy nextStep) + oxirgi 10 xabar -> `chat` ->
   mentor xabari saqlanadi -> `sendMentorMessageResponseSchema`. AI yiqilsa mentor javobi:
   "Hozir javob bera olmadim, keyingi qadamingiz: <instruction>" (saqlanadi, 200).
3. `GET mentor/messages?limit=50` - eng yangi N, xronologik tartibda qaytariladi.
4. `POST next-steps/:id/done` - faqat o'zining `pending` NextStep'i; `status=done`, `doneAt`; +20 XP.
5. Rate limit: bir o'quvchi daqiqasiga 10 mentor xabar (in-memory Map, `429`, kod `VALIDATION_ERROR`
   emas, `API_ERROR_CODES.RATE_LIMITED` - tayyor).

## Out of scope

- Real LLM provayder (T-011), streaming, chat tarixini o'chirish, yutuqlar mantiqi (achievements hozircha 0/5 statik).

## Done when

- [ ] `pnpm check` yashil
- [ ] curl: 2 xabar yuborish -> GET tarix 4 xabar; next-step done -> overview'da nextStep null yoki keyingisi
- [ ] AI yiqilganda (mock'da `throw` qilib sinab) fallback javob keladi

## Report

## Questions

## Review findings
