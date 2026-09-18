# apps/server - server ijrochisi (Codex) uchun qoidalar

Umumiy protokol: `../../AGENTS.md` (2, 3, 4, 5-bo'limlar majburiy). Bu fayl faqat server'ga xos.

## Modul tuzilmasi (aynan shu, `modules/health/` dan nusxa ol)

```
src/modules/<nom>/
  <nom>.routes.ts      Router + validate({ body/query/params }) + requireAuth/requireTenant/requireRole
  <nom>.controller.ts  asyncHandler(async (req, res) => { ... res.status(201).json(...) })
  <nom>.service.ts     biznes mantiq; AppError tashlaydi; Prisma import QILMAYDI
  <nom>.repository.ts  faqat Prisma; tenant jadvallarida har so'rovda where: { centerId }
```

Router `src/modules/index.ts` ga ulanadi: `apiRouter.use("/<nom>", <nom>Router)`.

## Qoidalar

1. Schema: `import { xSchema } from "@zexn/shared"`. Shared'da yo'q bo'lsa - `Questions` ga
   yoz, Claude qo'shadi. O'zing `packages/shared` ga yozma, lokal Zod schema ham yozma.
2. `centerId` faqat `req.centerId` (tenant middleware). Body/query'dagi `centerId` e'tiborsiz.
   Tenant jadvalidagi har `findMany/findFirst/update/delete` da `where: { centerId }`.
   Boshqa markaz resursi so'ralsa 404 (`NOT_FOUND`), 403 emas (mavjudligini oshkor qilmaymiz).
3. Xato: `throw new AppError(404, "Guruh topilmadi", API_ERROR_CODES.NOT_FOUND)`. Xabar o'zbekcha.
   Yangi kod kerak bo'lsa `Questions` ga (kodlar `@zexn/shared` da).
4. Env: `import { env } from "../../config/env.js"`. Yangi env kerak bo'lsa `env.ts` schema +
   `.env.example` ikkalasi.
5. ESM: relativ importlarda `.js` kengaytma majburiy (`./x.service.js`).
6. Prisma: schema o'zgarsa `pnpm --filter @zexn/server prisma:migrate --name <nom>`; migratsiya
   fayli ishning bir qismi. `docs/04-data-model.md` ni o'zgartirma - `Report` da yoz, Claude yangilaydi.
7. Ochiq endpoint faqat brief aytsa. Default: `requireAuth, requireTenant`.
8. Loglar: `console.log` yo'q. Xato log errorHandler'da bo'ladi, service'da log yozma.
9. Test faqat brief so'rasa (kritik: tenant scope, auth, analysis). `vitest`, fayl `<nom>.service.test.ts`.

## Tugatish

- `pnpm check:server` yashil (client xatosi senga tegishli emas).
- Endpointni curl bilan sinab, buyruq + javobni `Report` ga.
- Task faylida `Status: REVIEW`, `Report`, kerak bo'lsa `Questions`.

## Dev seed demo hisoblar (curl sinovlari uchun; `SEED_DEV_PASSWORDS=true`)

`student/student`, `teacher/teacher`, `admin/admin`, `superadmin/superadmin`, `newstudent/temp1234` (parol almashtirish oqimi).
Token: `POST /api/auth/login {"login":"student","password":"student"}` -> `accessToken`.
