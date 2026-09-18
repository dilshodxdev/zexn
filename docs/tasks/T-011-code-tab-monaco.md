# T-011 - Mentor chat "Code" tabi: VS Code muharriri (Monaco) + kodni mentorga yuborish

**Status:** TODO
**Phase:** 4
**Depends:** T-007
**Assignee:** gemini
**Branch:** feat/client-code-tab

## Goal

Stitch dizaynidagi o'rta panel `Chat | </> Code` tabining Code qismi: VS Code'ning muharriri
(Monaco) ichida o'quvchi kod yozadi (React kursi: JS/TS/JSX), "Mentorga yuborish" bosadi - kod
chat'ga ```-blok sifatida ketadi, mentor javobi chat'da chiqadi. Kod BAJARILMAYDI (sandbox yo'q).

## Read only

- `apps/client/AGENTS.md`, `src/features/student/MentorChat.tsx`, `useMentor.ts`, `mentor.api.ts`
- `src/components/ui/ThemeToggle.tsx` (tema holatini o'qish uchun), `src/index.css`
- `packages/shared/src/student.ts` (`sendMentorMessageBodySchema.text` max 8000 - kod uchun kengaytirildi)

## Contract

O'zgarish yo'q: kod `POST /student/mentor/messages` ga `text` sifatida, formati:
"`tsx\n<kod>\n`\n<ixtiyoriy savol>". Mentor javobi oddiy matn.

## Files

- `apps/client/package.json` - `@monaco-editor/react` (ruxsat; default CDN loader, brauzerda tarmoq kerak)
- `src/features/student/CodeEditor.tsx` - Monaco wrapper: `language` (tsx | javascript | typescript | html | css),
  `value/onChange`, tema: `data-theme="light"` -> `vs`, aks holda `vs-dark`; `options`: fontSize 13,
  minimap off, wordWrap on, automaticLayout
- `src/features/student/CodePanel.tsx` - toolbar (til `Select`, "Tozalash", "Mentorga yuborish" `Button`),
  editor, pastda savol `Input` (ixtiyoriy); yuborishda `useMentor().send(text)` va Chat tabiga o'tish
- `src/features/student/MentorChat.tsx` - Code tab `CodePanel` ni ko'rsatadi; xabar matnida ```-blok
  bo'lsa `<pre><code>` (monospace, `bg-surface-alt`, gorizontal skroll) sifatida render
- `src/features/student/codeDraft.ts` - kod `localStorage("zexn-code-draft")` da saqlanadi (sahifa yangilansa yo'qolmasin)
- `src/locales/uz/student.json` - `code.*` kalitlari

## Requirements

1. Monaco faqat Code tab ochilganda yuklanadi (`React.lazy` + `Suspense` `Spinner`) - Chat tabi og'irlashmasin.
2. Tema almashganda editor temasi ham almashadi (`MutationObserver` yoki ThemeToggle holati).
3. Bo'sh kod yuborilmaydi; yuborish paytida tugma `loading`; 429 -> "Biroz kuting".
4. Mobil (360px): editor balandligi `min-h-[40vh]`, toolbar `flex-wrap`, Code tab bottom-nav "Mentor" ichida ikkinchi tab.
5. Kod bloklari chat'da 20 qatordan uzun bo'lsa "Ko'proq" bilan yig'iladi.
6. Kod bajarilmaydi, "Run" tugmasi YO'Q.

## Out of scope

- Kod ijrosi, linting, autocomplete sozlamalari, fayl daraxti, Monaco'ni lokal bundle qilish (PWA offline'da Code tab ishlamaydi - qabul qilingan).

## Done when

- [ ] `pnpm check:client` yashil, build o'tadi
- [ ] Desktop va 360px: Code tab -> kod yozish -> yuborish -> chat'da kod bloki + mentor javobi (server bilan)
- [ ] Tema almashganda editor temasi almashadi

## Report

## Questions

## Review findings
