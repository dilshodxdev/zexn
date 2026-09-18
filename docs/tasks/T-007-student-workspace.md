# T-007 - Student workspace (Stitch "workspace" ekrani, screenshot bo'yicha) + teacher/superadmin placeholder

**Status:** TODO
**Phase:** 4
**Depends:** T-005
**Assignee:** gemini
**Branch:** feat/client-student-workspace

## Goal

`/app` - o'quvchi zonasi **aynan** `docs/design/stitch/workspace.html` (egasi screenshot bilan
tasdiqlagan) kabi: yuqori nav, chap "Dars reja", o'rta "ZEXN Mentor" chat, o'ng "O'quvchi paneli".
Hozir faqat student qismi ishlaydi; teacher va super admin uchun faqat bo'lim nomlari yozilgan
placeholder sahifalar. Ma'lumot `packages/shared/src/student.ts` kontraktidan (server T-008..T-010
parallel; tayyor bo'lmasa typelar bilan yoz, Report'da "server bilan sinalmadi").

## Read only

- `apps/client/AGENTS.md`, `src/components/ui/index.ts`, `src/features/auth/*`, `src/lib/api.ts`, `src/routes.ts`, `src/App.tsx`
- `docs/design/stitch/workspace.html` - layout, spacing, ikonlar (klasslarni ko'chirma, tokenlarga o'gir)
- `packages/shared/src/student.ts`, `docs/05-api.md` (Student bo'limi)

## Contract

`studentOverviewSchema` (student.shortId/telegramUsername, course.topics[].lessonsDone/lessonsTotal,
stats.level/xp/levelXp/streakDays/streakRecord/achievementsEarned/achievementsTotal, rating[]),
`topicDetailSchema`, `testListItemSchema`, `testDetailSchema`, `submitAttemptBodySchema`,
`attemptResultSchema`, `mentorMessageSchema`, `sendMentorMessageBodySchema`,
`sendMentorMessageResponseSchema`, `nextStepDoneResponseSchema`. Endpointlar `docs/05-api.md`.

## Ekran tuzilmasi (screenshot, chapdan o'ngga)

**Header (56px):** logo + "ZEXN"; o'rtada pill-nav: Dars (faol, brand fon) | Vazifalar | Imtihon |
Intervyu + "ishlab chiqilyapti" chip | Battle | Profil; o'ngda: bildirishnoma (statik badge),
tema tugmasi (`ThemeToggle`, 9-talab), user chip (ism + "Online" + avatar).
Nav yo'llari: Dars -> `/app`, Vazifalar -> `/app/tasks` (placeholder), Imtihon -> `/app/tests`,
Battle -> `/app/battle` (placeholder), Profil -> `/app/profile` (placeholder). Intervyu havola emas.

**Chap panel "Dars reja" (Kurslar | Suhbatlar tab):** "AI Mentor - Proaktiv mentor suhbati" karta
(badge 1) -> o'rta panelni chatga o'tkazadi; kurs nomi ("Frontend - React"); mavzular ro'yxati:
har qatorda chevron + nom + `lessonsDone/lessonsTotal` chip; holat rangi: `current` brand-soft fon,
`done` ok, `weak` warn, `locked` muted. Pastda: kurs nomi + foiz + progress bar +
"`completedCount` / `totalCount` mavzu yakunlangan". Mavzu bosilsa `/app/topics/:id`.

**O'rta panel "ZEXN Mentor - 24/7 Mentor yordamchi":** Chat | Code tab (Code placeholder),
breadcrumb "Dars mazmuni / AI Mentor", "Tozalash" (faqat client'dagi ro'yxatni tozalaydi);
xabarlar (`mentorMessageSchema`, vaqt `formatDateTime` qisqa HH:mm); pastda input
"Proaktiv mentorga savol bering..." + yuborish (brand, dumaloq). Optimistic student xabari,
javob kelguncha input disabled + Spinner.

**O'ng panel "O'quvchi Paneli" (Umumiy | Dars | Vazifa | Davomat tab; faqat Umumiy ishlaydi):**
user karta (avatar, ism, Online, "ID: #<shortId>"); "XP DARAJASI" `xp/levelXp` + bar;
"TELEGRAM BOT" karta: `hasTelegram` -> "Ulangan" chip + username, aks holda "Ulash" tugmasi
(placeholder, T-011); 4 kichik karta: Streak (kun), Rekord (kun), Yutuqlar (`earned/total`),
Jami XP; "AI MENTOR" karta: `level` chip, `nextStep.instruction` matni, 3 ta chip = `weak` mavzular
(bo'lmasa keyingi 3 mavzu), "Proaktiv mentor suhbati >" -> chat; "REYTING": `rating[]` (o'rin,
avatar harfi, ism, XP; `isMe` ajratilgan).

**Mobil (360px):** header nav yashirin, pastda bottom-nav (Dars | Mentor | Panel | Imtihon, `pb-safe`);
uch panel tab'larga aylanadi.

## Files

- `src/features/student/student.api.ts`, `useStudent.ts`, `mentor.api.ts`, `useMentor.ts`
- `src/features/student/TopicList.tsx`, `MentorChat.tsx`, `StudentPanel.tsx`, `NextStepCard.tsx`, `TopicStatusBadge.tsx`, `RatingList.tsx`
- `src/screens/app/AppLayout.tsx` (header, bottom-nav), `WorkspaceScreen.tsx` (`/app`, 3 panel), `TopicScreen.tsx`,
  `TestsScreen.tsx`, `TestRunScreen.tsx`, `AttemptResultScreen.tsx`, `ChangePasswordScreen.tsx`,
  `PlaceholderScreen.tsx` (nom + "Tez kunda") - tasks/battle/profile uchun
- `src/screens/teacher/TeacherHomeScreen.tsx` (`/teacher`): faqat bo'lim nomlari ro'yxati: "Sinf ko'rinishi",
  "Test tayinlash", "O'quvchilar", "Hisobotlar" - har biri `Card` + "Tez kunda"
- `src/screens/superadmin/SuperAdminHomeScreen.tsx` (`/superadmin`): "Markazlar", "Litsenziyalar", "Foydalanuvchilar"
- `src/screens/app/AppHomeScreen.tsx` - o'chiriladi
- `src/features/auth/RequireAuth.tsx` - rol -> zona: STUDENT `/app`, TEACHER `/teacher`, CENTER_ADMIN `/admin`, isSuperAdmin `/superadmin`
- `src/components/ui/ThemeToggle.tsx` + `src/index.css` (9-talab)
- `src/routes.ts`, `src/App.tsx`, `src/locales/uz/student.json` + `i18n.ts`

## Requirements

1. Layout, spacing, radius, ranglar - screenshot'ga maksimal yaqin, lekin **faqat tokenlar**.
2. Har panel: loading (`Spinner`), error (`ErrorState` + qayta urinish), empty (`EmptyState`).
3. Test oqimi: `/app/tests` ro'yxat -> `/app/tests/:id` (bir savol bir ekran, "Keyingi", hammasi javoblanmasa yuborilmaydi)
   -> `AttemptResultScreen` (ball, gaps: ildiz mavzu + explanation, nextSteps) -> "Workspace'ga qaytish".
4. `NextStepCard` "Bajardim" -> `POST /next-steps/:id/done` -> overview invalidate.
5. Mentor: `GET` tarix, `POST` yuborish; 429 kelsa "Biroz kuting" xabari.
6. Reyting: `rating[]` qanday kelsa shunday (server top 5 + men).
7. Teacher / super admin sahifalari: hech qanday API chaqirmaydi, faqat nomlar. Admin (`/admin`) T-005 placeholder'i qoladi.
8. Barcha matn `student.json`; screenshot'dagi so'zlar aynan (Dars reja, Kurslar, Suhbatlar, O'quvchi Paneli, XP DARAJASI, ...).
9. Tema: dizayn qorong'i tokenlar bilan; `ThemeToggle` `data-theme="light"` ni `html` ga qo'yadi va
   `index.css` da `:root[data-theme="light"]` uchun tokenlar (screenshot'dagi och variant: bg `#f5f7f9`,
   surface `#ffffff`, surface-alt `#f0f2f4`, text `#111827`, text-muted `#64748b`, line `rgba(0,0,0,0.08)`,
   brand o'zgarmaydi). Tanlov `localStorage("zexn-theme")`. Default: dark.

## Out of scope

- Vazifalar/Battle/Profil mantiqi, Suhbatlar tab, Code tab, Dars/Vazifa/Davomat tab'lari, Telegram ulash (T-011), bildirishnomalar.

## Done when

- [ ] `pnpm check` yashil, build o'tadi
- [ ] Desktop: screenshot bilan yonma-yon taqqoslaganda tuzilma bir xil; 360px: tab'lar + bottom-nav (egasi ko'radi)
- [ ] `student/student` bilan kirib `/app`; `teacher/teacher` -> `/teacher` nomlar; `superadmin/superadmin` -> `/superadmin`
- [ ] Server (T-008+) bor bo'lsa: overview -> test -> natija -> next step done -> mentor xabar

## Report

## Questions

## Review findings
