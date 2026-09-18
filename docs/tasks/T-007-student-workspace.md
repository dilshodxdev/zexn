# T-007 - Student workspace (Stitch "workspace" ekrani) + endpointlarga ulash

**Status:** TODO
**Phase:** 4
**Depends:** T-005
**Assignee:** gemini
**Branch:** feat/client-student-workspace

## Goal

`/app/*` - o'quvchi zonasi, Stitch `workspace.html` bo'yicha: chap - kurs mavzulari (bilim
xaritasi), o'rta - AI Mentor chat, o'ng - o'quvchi paneli (XP, streak, yutuqlar, reyting).
Hammasi `packages/shared/src/student.ts` kontraktiga ulanadi. Server (T-008..T-010, gpt) parallel
yoziladi: tayyor bo'lmasa schema typelari bilan yoz, `Report` da "server bilan sinalmadi".

## Read only

- `apps/client/AGENTS.md`, `src/components/ui/index.ts`, `src/features/auth/*` (T-005 dan), `src/lib/api.ts`
- `docs/design/stitch/workspace.html` (layout va spacing manbasi; klasslarni ko'chirma, tokenlarga o'gir)
- `packages/shared/src/student.ts` (kontrakt), `docs/05-api.md` (Student bo'limi)

## Contract

`studentOverviewSchema`, `topicDetailSchema`, `testListItemSchema`, `testDetailSchema`,
`submitAttemptBodySchema`, `attemptResultSchema`, `mentorMessageSchema`,
`sendMentorMessageBodySchema`, `sendMentorMessageResponseSchema`, `nextStepDoneResponseSchema`.
Endpointlar (`/api` ostida): `GET /student/overview`, `GET /student/topics/:topicId`,
`GET /student/tests`, `GET /student/tests/:testId`, `POST /student/tests/:testId/attempts`,
`POST /student/next-steps/:id/done`, `GET /student/mentor/messages?limit=50`, `POST /student/mentor/messages`.

## Files

- `src/features/student/student.api.ts`, `useStudent.ts` (overview, topic, tests, attempt mutation, next-step done)
- `src/features/student/mentor.api.ts`, `useMentor.ts` (messages query + send mutation, optimistic student xabari)
- `src/features/student/TopicList.tsx` (chap panel), `MentorChat.tsx` (o'rta), `StudentPanel.tsx` (o'ng: stats + rating),
  `NextStepCard.tsx`, `TopicStatusBadge.tsx`
- `src/screens/app/AppLayout.tsx` - header nav (Dars, Vazifalar, Imtihon, Intervyu*, Battle*, Profil), mobil: bottom-nav (`pb-safe`),
  3 panel desktop / tab'lar mobil (Dars | Mentor | Panel). `*` = "ishlab chiqilyapti" `Badge`, havola yo'q
- `src/screens/app/WorkspaceScreen.tsx` (`/app`), `TopicScreen.tsx` (`/app/topics/:topicId`),
  `TestsScreen.tsx` (`/app/tests`), `TestRunScreen.tsx` (`/app/tests/:testId`), `AttemptResultScreen.tsx` (natija, gaps, next steps),
  `ChangePasswordScreen.tsx` (`/app/change-password`, `changePasswordBodySchema`, `POST /auth/change-password`)
- `src/screens/app/AppHomeScreen.tsx` - o'chiriladi (placeholder edi)
- `src/routes.ts`, `src/App.tsx` - `app.*` yo'llari, `RequireAuth` role STUDENT (TEACHER ham ko'ra oladi, keyin)
- `src/locales/uz/student.json` + `i18n.ts`

## Requirements

1. Mavzu holatlari rang: `done` -> ok, `current` -> brand, `weak` -> warn, `locked` -> muted. Progress:
   `completedCount / totalCount` va foiz (Stitch: "1 / 20 mavzu yakunlangan", "5%").
2. `NextStepCard` overview'da eng tepada (Stitch'dagi "AI MENTOR" taklif joyi): `instruction`,
   material havolasi (yangi oyna), "Bajardim" -> `POST /next-steps/:id/done` -> overview invalidate.
3. Test: bir savol bir ekranda yoki ro'yxat (mobil uchun bir savol + "Keyingi"); barcha savolga
   javob bermasdan yuborib bo'lmaydi; yuborilgach `AttemptResultScreen`: ball, `gaps` (ildiz mavzu +
   `explanation`), `nextSteps`. Test ichida `beforeunload` ogohlantirish shart emas.
4. Mentor chat: xabarlar `GET` bilan yuklanadi, yuborishda optimistic `student` xabari, javob
   kelgach `mentor` qo'shiladi; yuborish paytida input `disabled` + `Spinner`. Tarix scroll pastda.
5. Reyting: top 5 + o'zi (`isMe` ajratilgan). Stats: XP bar (`xp / levelXp`), streak, rekord, yutuqlar.
6. Har panel loading / error / empty (`EmptyState`: "Hali test topshirilmagan").
7. Server yo'q bo'lsa ishlab ko'rish uchun `src/features/student/mock.ts` YOZILMAYDI - faqat
   typelar; UI holatlarini `/dev/ui` dagi kabi ko'rish shart emas.

## Out of scope

- Intervyu, Battle, Vazifalar (faqat nav'da "ishlab chiqilyapti"), Profil sahifasi, teacher ko'rinishi, Telegram bog'lash.

## Done when

- [ ] `pnpm check` yashil, build o'tadi
- [ ] 360px (tab'lar) va desktop (3 panel) - egasi ko'radi
- [ ] Server bor bo'lsa: seed student bilan login -> overview -> test topshirish -> natija -> next step done -> mentor xabar

## Report

## Questions

## Review findings
