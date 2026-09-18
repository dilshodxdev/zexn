# AGENTS.md - AI agentlar uchun ish protokoli

Bu fayl **faqat** AI lar (va odamlar) qanday ishlashini belgilaydi. Loyiha konteksti bu yerda
emas: `docs/README.md` dan boshlang.

## 1. Kim kim

| Kim                                        | Rol                      | Nima qiladi                                                        |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------ |
| Egasi                                      | Frontend, mahsulot egasi | `apps/client`. **Yagona commit qiluvchi.** Brieflarni tasdiqlaydi. |
| Sherik                                     | Backend                  | `apps/server`, `feat/server-*` branch.                             |
| Claude                                     | Orkestrator + mentor     | Reja, brief (`docs/tasks/`), review, egasiga TS o'rgatish.         |
| Boshqa AI lar (DeepSeek, Kimi, Codex, ...) | Ijrochi                  | Bitta brief oladi, bajaradi, jurnalga yozadi.                      |

Ro'yxat ochiq: yangi AI qo'shilsa shu jadvalga qator qo'shiladi.

## 2. Kod yozishdan oldin o'qi (shu tartibda)

1. `docs/README.md` - nima qurayapmiz, qaysi faylni birinchi o'qish.
2. `AGENTS.md` - shu fayl.
3. `docs/agent-log/README.md` - kim nima qilgan (lokal, bo'lmasa o'tkazib yubor).
4. Berilgan task fayli: `docs/tasks/T-XXX-<slug>.md`.

Task berilmagan bo'lsa - **qaysi biri ekanini so'ra**, taxmin qilma.

## 3. Ish jurnali - majburiy

Har ishdan keyin:

- `docs/agent-log/<o'z-noming>.md` ga yozuv (eng tepaga), shablon: `docs/agent-log/_template.md`.
- `docs/agent-log/README.md` jadvaliga bir qator.
- O'z nomingni o'zing yoz (masalan `deepseek`, `kimi`, `codex`). **Faqat o'z faylingga yoz.**

Nega: hech bir AI commit qilmaydi. Commit qilinmagan diff'da git muallifni saqlamaydi -
jurnal bo'lmasa "buni kim, nega qildi" yo'qoladi.

## 4. Qat'iy qoidalar

- **Faqat berilgan ish.** Brief'da yo'q narsani qilma (scope creep yo'q). Kerak deb o'ylasang
  `## Questions` ga yoz.
- **commit / push / branch / merge qilma.** O'zgarish ishchi katalogda qoladi, egasi ko'rib
  commit qiladi.
- **`docs/` ni tahrirlama.** Istisno: o'z task faylingning `Status`, `Report`, `Questions`
  bo'limlari.
- **`AGENTS.md`, `CLAUDE.md` ga tegma.**
- **Yangi dependency faqat brief ruxsat bersa**, sababi bilan (`Report` da).
- **Sirlar faqat `.env` da.** Kodga, hujjatga, jurnalga token/parol yozilmaydi.
  `.env.example` doim yangilanadi.

## 5. Uzun chiziq taqiqlanadi

Em dash (U+2014) va en dash (U+2013) **hech qayerda** ishlatilmaydi: kod, izoh,
hujjat, commit xabari, chat. Oddiy `-` ishlatiladi.
Istisno: UI da "qiymat yo'q" belgisi (U+2014) - faqat i18n JSON ichida.

## 6. Arxitektura invariantlari

- Server: `routes -> controller -> service -> repository`. Biznes mantiq service'da, Prisma
  faqat repository'da, controller faqat req/res.
- Har endpoint `validate(schema)`. Schemalar **faqat** `packages/shared` da (client ham
  o'shani ishlatadi).
- Xato formati bitta: `{ "error": { "message", "code"?, "meta"? } }` (`AppError` + `errorHandler`).
- **`centerId` faqat JWT dan** (`req.centerId`, tenant middleware). Body/query/params dan
  hech qachon.
- Vaqt: DB'da UTC, UI'da `Asia/Tashkent`.
- TypeScript `strict: true`, `any` yo'q (kerak bo'lsa `unknown` + narrowing).
- UI matnlari o'zbekcha, i18n JSON ichida.

## 7. Branch tartibi

- `main` - integratsiya, to'g'ridan-to'g'ri commit yo'q.
- `feat/client-*` - egasi. `feat/server-*` - sherik.
- `packages/shared` o'zgarishi - **ikkalasi kelishib**, alohida kichik PR. Server endpoint
  qo'shsa avval shared'ga schema, keyin server, keyin client.
- Conventional commits: `feat(server): ...`, `fix(client): ...`, `docs: ...`, `chore: ...`.

## 8. Task aylanishi

`TODO -> IN_PROGRESS -> REVIEW -> DONE`. Qo'shimcha: `CHANGES_REQUESTED` (reviewer qaytardi),
`BLOCKED` (savol javobsiz).

Bir vaqtda faqat **bitta** task `IN_PROGRESS` yoki `REVIEW` bo'ladi (bir ijrochi uchun).

## 9. Xavfsizlik - bypass / demo kod

- Har qanday bypass (auth o'chirish, demo user, seed endpoint) **default o'chiq**.
- Alohida env (masalan `ENABLE_DEMO_LOGIN=true`) bo'lmasa umuman yo'q.
- `NODE_ENV !== "production"` tekshiruvi **yetarli emas**: o'rnatilmagan bo'lsa `true` beradi.

## 10. Muhit

- Windows 11, PowerShell 5.1 (`&&` ishlamaydi - `;` yoki alohida qatorlar), pnpm 11, Node >= 20.
- Asosiy buyruqlar (repo root'dan):
  - `pnpm install`
  - `pnpm dev` - shared watch + server + client
  - `pnpm build` / `pnpm typecheck` / `pnpm lint` / `pnpm format`
  - `docker compose up -d` - dev Postgres
  - `pnpm --filter @zexn/server prisma:migrate --name <nom>`
  - `pnpm --filter @zexn/server db:seed`
  - `pnpm --filter @zexn/client exec tsc -b`

## 11. Egasi haqida

Middle darajadagi full-stack, TypeScript'ni chuqurlashtirmoqda. Shuning uchun:

- Nima va **nega** qilganingni tushuntir.
- Yangi TS tushunchasi birinchi uchraganda qisqa izohla.
- "Sehrli" kod tashlama: o'quvchi o'zi qayta yoza oladigan darajada oddiy bo'lsin.
