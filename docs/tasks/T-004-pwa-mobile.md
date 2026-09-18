# T-004 - PWA (o'rnatiladigan) + mobil-first asos

**Status:** TODO (T-003 DONE bo'lgandan keyin)
**Phase:** 4
**Assignee:** gemini
**Branch:** feat/client-pwa

## Goal

Ilova telefonga o'rnatiladi (Android Chrome "Install", iOS "Add to Home Screen"), app shell
offline ochiladi, ekranlar 360px da to'liq ishlaydi. Offline'da test topshirish YO'Q.

## Read only

- `apps/client/AGENTS.md`, `apps/client/index.html`, `apps/client/vite.config.ts`,
  `apps/client/src/index.css`, `apps/client/src/main.tsx`, `apps/client/src/App.tsx`
- `deploy/nginx.conf` (o'qish uchun; Claude yangilagan)

## Contract

Yo'q. Ikon manbasi: `--color-bg` fonida `--color-brand` rangli "Z" (SVG, `public/icon.svg`).

## Files

- `apps/client/package.json` - `vite-plugin-pwa` (devDependency, ruxsat)
- `apps/client/vite.config.ts` - `VitePWA({ registerType: "autoUpdate", manifest, workbox })`
- `apps/client/public/icon.svg`, `public/pwa-192.png`, `public/pwa-512.png`, `public/apple-touch-icon.png` (180)
- `apps/client/index.html` - `viewport-fit=cover`, `theme-color`, apple meta teglari
- `apps/client/src/index.css` - `env(safe-area-inset-*)` uchun `pt-safe`/`pb-safe` utility (`@utility`)
- `apps/client/src/components/ui/OfflineBanner.tsx` - `navigator.onLine` false bo'lsa yuqorida banner
- `apps/client/src/App.tsx` - `OfflineBanner` ulanadi
- `apps/client/src/locales/uz/common.json` - `pwa.offline`, `pwa.updateAvailable`, `pwa.reload`

## Requirements

1. Manifest: `name: "ZEXN"`, `short_name: "ZEXN"`, `start_url: "/"`, `display: "standalone"`,
   `background_color` = `--color-bg` qiymati, `theme_color` = `--color-bg`, `lang: "uz"`, ikonlar
   192/512 (`purpose: "any"`) + 512 `maskable`.
2. Workbox: precache faqat build chiqishi (`**/*.{js,css,html,svg,png,woff2}`);
   `navigateFallback: "/index.html"`, `navigateFallbackDenylist: [/^\/api\//]`.
   **`/api/` uchun runtime caching YO'Q** - hech qanday strategiya qo'shilmaydi.
3. Yangi versiya chiqsa `pwa.updateAvailable` toast + `pwa.reload` tugmasi (`useRegisterSW`).
4. `OfflineBanner`: `online`/`offline` eventlariga obuna; `role="status"`.
5. Safe-area: `body` `pb-safe`; keyingi tasklardagi bottom-nav `pb-safe` ishlatadi.
6. Dev'da SW o'chiq (`devOptions.enabled: false`) - hot reload buzilmasin.
7. `pnpm --filter @zexn/client build` chiqishida `sw.js`, `manifest.webmanifest`, `workbox-*.js` bor.

## Out of scope

- Push notification, background sync, offline test topshirish, iOS splash rasmlari.
- Bottom-nav komponenti (T-006 workspace bilan birga).

## Done when

- [ ] `pnpm check` yashil, build o'tadi
- [ ] `pnpm --filter @zexn/client preview` -> Chrome DevTools > Application: manifest xatosiz, SW faol,
      "Install" taklifi chiqadi (Report'da skrinshot yo'li yoki matn)
- [ ] Offline rejimda `/` ochiladi (app shell), banner ko'rinadi
- [ ] 360px: `/`, `/dev/ui` gorizontal skroll yo'q

## Report

## Questions

## Review findings
