# T-003 - Stitch dizaynidan tokenlar + almashtiriladigan UI kit

**Status:** TODO
**Phase:** 4
**Assignee:** gemini
**Branch:** feat/client-ui-kit

## Goal

Google Stitch'da chizilgan dizayn loyihaga ikki qatlam sifatida kiradi: (1) semantik tokenlar
`index.css` `@theme` da, (2) UI kit `components/ui/`. Ekranlar faqat shu ikkisini ishlatadi,
shuning uchun dizayn keyin o'zgarsa faqat shu ikki qatlam almashadi. Bu task'da ekranlar
QURILMAYDI (faqat namuna `HomeScreen` tokenlarga o'tkaziladi va `/dev/ui` ko'rgazma sahifasi).

## Read only

- `apps/client/AGENTS.md`
- `apps/client/src/index.css`, `src/index.html`, `src/components/ui/*`, `src/screens/home/HomeScreen.tsx`,
  `src/routes.ts`, `src/App.tsx`, `src/locales/uz/common.json`
- `docs/design/stitch/*` - Stitch eksporti (0-qadamga qara)

## 0-qadam: Stitch eksporti

- Agar Antigravity'da Stitch MCP ulangan bo'lsa: loyihaning har ekranini HTML (Tailwind) sifatida
  `docs/design/stitch/<ekran-slug>.html` ga saqla, palitra/shriftni `docs/design/stitch/tokens.md` ga.
- Ulanmagan bo'lsa: egasi shu papkaga qo'ygan fayllarni ishlat.
- Papka bo'sh bo'lsa: `Status: BLOCKED`, `Questions` ga yoz, davom etma.

## Contract

Shared schema kerak emas. Token va komponent nomlari **quyida belgilangan, o'zgartirilmaydi**
(ekranlar shu nomlarga bog'lanadi):

Tokenlar (`@theme`, qiymatlar Stitch'dan):

- rang: `--color-brand`, `--color-brand-hover`, `--color-brand-soft`, `--color-bg`,
  `--color-surface`, `--color-surface-alt`, `--color-text`, `--color-text-muted`, `--color-line`,
  `--color-ok`, `--color-ok-soft`, `--color-warn`, `--color-warn-soft`, `--color-danger`,
  `--color-danger-soft`, `--color-info`, `--color-info-soft`
- radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-card`
- soya: `--shadow-card`, `--shadow-pop`
- shrift: `--font-sans`, `--font-display` (Stitch ishlatgan Google Font, `index.html` da `<link>`)

Komponentlar (`components/ui/`, props aynan shu):

- `Button` - `variant: "primary" | "secondary" | "ghost" | "danger"`, `size: "sm" | "md" | "lg"`,
  `loading?`, `disabled?`, `icon?`, `fullWidth?`; `<button>` ning qolgan props'lari o'tadi
- `Card` - `title?`, `subtitle?`, `actions?` (ReactNode), `padding?: "none" | "md"`
- `Input` - `label`, `error?`, `hint?`, `<input>` props; `id` avtomatik, label bog'langan
- `Select` - `label`, `options: { value, label }[]`, `error?`
- `Badge` - `tone: "neutral" | "brand" | "ok" | "warn" | "danger" | "info"`
- `Spinner` - `size?: "sm" | "md"`
- `EmptyState` - `title`, `description?`, `action?` (ReactNode), `icon?`
- `ErrorState` - `message`, `onRetry?`
- `PageHeader` - `title`, `subtitle?`, `actions?`
- `StatusDot` - mavjud, tokenga o'tkaziladi
- `components/ui/index.ts` - hammasini re-export

## Files

- `docs/design/stitch/*` - yangi (eksport)
- `apps/client/index.html` - shrift `<link>` (faqat Google Fonts)
- `apps/client/src/index.css` - `@theme` to'liq qayta yoziladi; `body` tokenlarda
- `apps/client/src/components/ui/*.tsx`, `index.ts` - yangi/qayta yoziladi
- `apps/client/src/screens/home/HomeScreen.tsx` - xom ranglar yo'q, faqat kit + tokenlar
- `apps/client/src/screens/dev/UiKitScreen.tsx` - har komponentning barcha variantlari bir sahifada
- `apps/client/src/routes.ts`, `src/App.tsx` - `dev.uiKit: "/dev/ui"` faqat `import.meta.env.DEV` da
- `apps/client/src/locales/uz/common.json` - `ui.*` kalitlari (Qayta urinish, Yuklanmoqda, Ma'lumot yo'q...)
- `docs/06-design-system.md` - **bu task uchun istisno ruxsat**: token jadvali (nom -> qiymat -> Stitch'da qayerdan),
  komponent ro'yxati va variantlar, spacing qoidasi

## Requirements

1. `screens/` va `features/` da xom rang yo'q (`bg-gray-*`, `text-blue-*`, hex). `pnpm check`
   `RAW_COLOR` bilan ushlaydi. `components/ui/` ichida ham faqat tokenlar (`bg-brand`, `text-muted`).
2. Stitch HTML'dagi klasslarni ko'chirma - undan **qiymat** ol (rang, radius, shrift, spacing),
   komponentga token orqali yoz.
3. Har komponent `className?` qabul qiladi va `cn()` bilan birlashtiradi.
4. Button `loading` holatida `Spinner` + `disabled`; `aria-busy`.
5. Input xato bo'lsa `aria-invalid` + `aria-describedby`; label `htmlFor`.
6. 360px kenglikda `/dev/ui` va `/` buzilmaydi.
7. Dark mode YO'Q. Animatsiya faqat `transition-colors`.
8. Ruxsat etilgan dependency: `lucide-react` (ikonlar). Boshqa UI kutubxona YO'Q.

## Out of scope

- Login, student, teacher, admin ekranlari (keyingi tasklar). Layout/navigatsiya (T-006).
- Tailwind konfiguratsiya fayli (v4, config yo'q). Dark mode. Storybook.

## Done when

- [ ] `pnpm check` yashil (Claude `HomeScreen` istisnosini `RAW_COLOR` dan olib tashlaydi, keyin ham yashil)
- [ ] `pnpm --filter @zexn/client build` o'tadi
- [ ] `/dev/ui` da barcha komponent variantlari ko'rinadi, `/` yangi kit bilan (egasi ko'radi)
- [ ] `docs/06-design-system.md` to'ldirilgan
- [ ] Report'da: Stitch qaysi ekranlar bor edi (ro'yxat) - `07-screens.md` uchun

## Report

## Questions

## Review findings
