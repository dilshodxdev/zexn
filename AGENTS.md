# AGENTS.md - AI agentlar uchun ish protokoli

Bu fayl **faqat** AI lar (va odamlar) qanday ishlashini belgilaydi. Loyiha konteksti
`docs/README.md` da. Papka qoidalari: `apps/server/AGENTS.md`, `apps/client/AGENTS.md`.

## 1. Kim kim

| Kim                       | Rol                        | Nima qiladi                                                                                                            |
| ------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Egasi                     | Mahsulot egasi, frontend   | Brieflarni tasdiqlaydi, ekranlarni ko'radi, yakuniy qaror.                                                             |
| Sherik                    | Backend                    | `apps/server`, `feat/server-*`. Codex bilan ishlaydi.                                                                  |
| Claude                    | **Orkestrator + reviewer** | Reja, brieflar (`docs/tasks/`), `packages/shared` (kontrakt), diff review, git (egasi nomidan). Ilova kodini yozmaydi. |
| Codex                     | **Server ijrochisi**       | `apps/server` ichida bitta brief. `apps/server/AGENTS.md` ni o'qiydi.                                                  |
| Gemini (Antigravity)      | **Client ijrochisi**       | `apps/client` ichida bitta brief. `apps/client/AGENTS.md` ni o'qiydi.                                                  |
| GPT (Codex/ChatGPT)       | **Admin ijrochisi**        | T-006: `apps/server/src/modules/admin` + `apps/client` admin papkalari. Ikkala `AGENTS.md` ni o'qiydi.                 |
| DeepSeek, Kimi, boshqalar | Mayda ijrochi              | Izolyatsiyalangan ish: seed ma'lumot, i18n, hujjat. `docs/agent-log/AGENT_RULES.md` beriladi.                          |

## 2. Kod yozishdan oldin o'qi (faqat shu, boshqa hech narsa)

1. Berilgan task fayli: `docs/tasks/T-XXX-<slug>.md`. Task berilmagan bo'lsa - so'ra.
2. Task'ning `Read only` ro'yxatidagi fayllar. **Repo bo'ylab kezma** - ro'yxatda yo'q faylni
   o'qish kerak bo'lsa, `Questions` ga yoz.
3. O'z papkangning `AGENTS.md` i (`apps/server` yoki `apps/client`).

`docs/README.md` faqat kontekst yetishmasa.

## 3. Token tejash - majburiy uslub

- Tushuntirma, tahlil yozma, variantlarni sanama. Chiqish = kod + task faylidagi `Report`
  (5-10 qator). Mentor rejimi faqat Claude va egasi o'rtasida.
- Bitta brief = bitta modul yoki bitta ekran, maksimum ~10 fayl. Kattaroq bo'lsa Claude bo'ladi.
- Namunadan nusxa ol (`modules/health/`, `features/health/`), yangi uslub o'ylab topma.
- Scope'dan tashqari refactor, "yaxshilash", nomlarni o'zgartirish YO'Q.
- Formatni qo'lda to'g'rilama: `pnpm format` qiladi.

## 4. Tekshiruv siyosati

- **`pnpm check`** (typecheck + lint + prettier + invariant grep) har brief oxirida majburiy.
  Qizil bo'lsa REVIEW ga o'tkazilmaydi. Natija `Report` ga bir qator.
- **Testlar faqat kritik joylarda** (vitest, server): (a) tenant scope - boshqa markaz
  ma'lumoti chiqmasligi; (b) JWT verify/refresh/expire; (c) gap tahlil algoritmi
  (`analysis.service`). Boshqa joyda test yozilmaydi, brief aytmasa.
- Endpoint qo'lda sinaladi (curl/REST client), buyruq va natija `Report` ga.

## 5. Qat'iy qoidalar

- Faqat `Requirements` va `Files` ro'yxatidagi ish. Boshqa fayl kerak bo'lsa `Questions`.
- **git commit/push/branch/merge QILMA** (Claude egasining ko'rsatmasi bilan qiladi).
- `docs/` ni tahrirlama. Istisno: o'z task faylingning `Status`, `Report`, `Questions`.
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `packages/shared` ga tegma (shared'ni Claude yozadi).
- Yangi dependency faqat brief ruxsat bersa.
- Sirlar faqat `.env`. `.env.example` yangilanadi.
- Uzun chiziq (U+2013, U+2014) hech qayerda; oddiy `-`. Istisno: i18n JSON'da "qiymat yo'q".
- Bypass/demo kod default o'chiq, alohida env bo'lmasa yo'q; `NODE_ENV !== "production"` yetarli emas.

## 6. Arxitektura invariantlari (`pnpm check` grep qiladi)

- Server: `routes -> controller -> service -> repository`. Prisma faqat `*.repository.ts`.
- Har POST/PUT/PATCH `validate({ body })`, schema faqat `@zexn/shared` dan.
- Xato: `throw new AppError(status, message, code, meta)`; format `{ error: { message, code, meta } }`.
- `centerId` faqat `req.centerId` (JWT). `process.env` faqat `config/env.ts`.
- `any` yo'q. `console.log` yo'q. UI matni faqat `locales/uz/*.json` + `t()`.
- Vaqt: DB UTC, UI `Asia/Tashkent` (`formatDateTime`).

## 7. Task aylanishi va review

`TODO -> IN_PROGRESS -> REVIEW -> DONE`, qo'shimcha `CHANGES_REQUESTED`, `BLOCKED`.
Bir ijrochida bir vaqtda bitta task.

1. Claude brief yozadi -> egasi tasdiqlaydi.
2. Ijrochi bajaradi -> `pnpm check` -> `Report` -> `Status: REVIEW`.
3. Claude **faqat `git diff`** ni o'qiydi, `Review findings` ga yozadi -> `DONE` yoki
   `CHANGES_REQUESTED` (aniq fayl:qator + nima qilish).
4. Egasi tasdiqlagach Claude commit qiladi.

## 8. Ish jurnali

Har ishdan keyin `docs/agent-log/<o'z-noming>.md` ga yozuv (eng tepaga, shablon
`docs/agent-log/_template.md`) + `docs/agent-log/README.md` jadvaliga bir qator. Faqat o'z
faylingga. Bu papka lokal (commit qilinmaydi); yo'q bo'lsa o'tkazib yubor, `Report` yetadi.

## 9. Branch tartibi

`main` integratsiya. `feat/client-*` egasi/Gemini, `feat/server-*` sherik/Codex,
`chore/shared-*` Claude. `packages/shared` o'zgarishi ikkala tomon kelishib, alohida kichik commit.
Conventional commits: `feat(server): ...`, `fix(client): ...`, `docs: ...`, `chore: ...`.

## 10. Muhit

Windows 11, PowerShell 5.1 (`&&` ishlamaydi), pnpm 11, Node >= 20.
`pnpm dev`, `pnpm check`, `docker compose up -d`,
`pnpm --filter @zexn/server prisma:migrate --name <nom>`, `pnpm --filter @zexn/server db:seed`.
