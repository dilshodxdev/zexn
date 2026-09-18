# apps/client - client ijrochisi (Gemini / Antigravity) uchun qoidalar

Umumiy protokol: `../../AGENTS.md` (2, 3, 4, 5-bo'limlar majburiy). Bu fayl faqat client'ga xos.

## Tuzilma (`features/health/` + `screens/home/` dan nusxa ol)

```
src/features/<nom>/
  <nom>.api.ts     axios (`@/lib/api`) chaqiruvlar; javob shared schema bilan parse
  use<Nom>.ts      TanStack Query hook'lar; queryKey'lar `<nom>Keys` obyektida
  <Komponent>.tsx  feature'ga xos komponentlar
src/screens/<nom>/<Nom>Screen.tsx   route'ga bog'langan sahifa; faqat hook'larni yig'adi
src/components/ui/                  umumiy UI (Button, Card, Input, ...)
src/routes.ts                       barcha yo'llar; komponentda qattiq "/path" yozilmaydi
src/locales/uz/<nom>.json           UI matnlari; komponentda `t("nom.kalit")`
src/stores/<nom>Store.ts            Zustand - faqat client state (sessiya, UI)
```

## Qoidalar

1. Server state faqat TanStack Query. `useEffect + useState` bilan fetch qilma.
2. Client state (sessiya, tanlangan markaz, modal) - Zustand. Server ma'lumotini store'ga ko'chirma.
3. Har ekran/ro'yxat **uch holat**: loading, error (`ApiError.message` + qayta urinish), empty.
   Success'da ma'lumot bo'sh bo'lsa "empty" holati alohida.
4. Typelar `@zexn/shared` dan. Javobni `xSchema.parse(data)` bilan tekshir (`health.api.ts` kabi).
   Shared'da schema yo'q bo'lsa `Questions` ga - o'zing yozma.
5. UI matni faqat `locales/uz/*.json`. JSX ichida o'zbekcha matn YO'Q (`pnpm check` ushlaydi).
   Yangi JSON fayl `src/lib/i18n.ts` `resources.uz` ga qo'shiladi.
6. Import alias `@/` (`@/lib/api`, `@/components/ui/Card`).
7. Tailwind: `index.css` dagi tokenlar (`brand-*`, `ok`, `warn`, `danger`). Inline style yo'q,
   yangi rang qo'shma (`06-design-system.md` bo'lganda Claude qo'shadi).
8. Sana/vaqt faqat `formatDateTime` (`@/lib/utils`) orqali.
9. Auth: token `useAuthStore`, `@/lib/api` interceptor qo'shadi. Komponentda token bilan ishlama.
10. Yangi kutubxona (UI kit, form lib, ikon) faqat brief ruxsat bersa.
11. Mobil kenglik (360px) da buzilmasin: `max-w-*`, `flex-wrap`, jadval `overflow-x-auto`.

## Tugatish

- `pnpm check` yashil, `pnpm --filter @zexn/client build` o'tadi.
- Ekran brauzerda ko'rilgan (uch holat), qisqa `Report`.
- Task faylida `Status: REVIEW`.
