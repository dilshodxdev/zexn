# 04 - Ma'lumotlar modeli

Manba: `apps/server/prisma/schema.prisma`. Bu hujjat schema'ni **tushuntiradi**; schema
o'zgarsa bu fayl ham yangilanadi (bir PR'da).

## Qoidalar

1. **Multi-tenant.** Markaz (`Center`) = tenant. Markazga tegishli har jadvalda `centerId`
   ustuni bor. Har Prisma so'rovida `centerId` filtri **majburiy**. Qo'lda unutish xavfi
   bo'lmasligi uchun 2-bosqichda `lib/prisma.ts` ga tenant-scoped extension qo'shiladi:
   repository `prisma` emas, `tenantDb(centerId)` orqali ishlaydi. `centerId` faqat JWT dan
   (`req.centerId`).
2. **Vaqt.** DB'da UTC: Prisma `DateTime` -> `TIMESTAMP(3)`, Prisma doim UTC yozadi va o'qiydi. UI `Asia/Tashkent`
   ga o'giradi (`apps/client/src/lib/utils.ts` -> `formatDateTime`).
3. **ID.** `cuid()` string. URL'da ko'rinadi, ketma-ket emas (taxmin qilib bo'lmaydi).
4. **Jadval nomlari** `@@map` bilan snake_case ko'plik (`centers`, `users`). Prisma model
   nomi PascalCase birlik.
5. **O'chirish.** Membership: user yoki center o'chsa cascade. Domen jadvallarida
   (3-bosqich) soft delete (`deletedAt`) ko'rib chiqiladi.

## 1-bosqich jadvallari

### Center (tenant)

| Ustun                | Tur            | Izoh                                          |
| -------------------- | -------------- | --------------------------------------------- |
| id                   | cuid           |                                               |
| name                 | string         | "IT Park Xorazm"                              |
| slug                 | string, unique | URL/log uchun: `itpark-xorazm`                |
| isActive             | bool           | Litsenziya to'xtasa `false`, login bloklanadi |
| createdAt, updatedAt | timestamptz    |                                               |

### User (akkaunt, markazga bog'liq emas)

| Ustun                | Tur             | Izoh                                                                    |
| -------------------- | --------------- | ----------------------------------------------------------------------- |
| id                   | cuid            |                                                                         |
| fullName             | string          |                                                                         |
| login                | string, unique  | Login + parol usuli. Admin beradi                                       |
| passwordHash         | string?         | bcrypt. Telegram-only akkaunt uchun null                                |
| telegramId           | bigint?, unique | Telegram user ID (deep-link orqali bog'lanadi)                          |
| mustChangePassword   | bool            | Vaqtinchalik parol bilan yaratilgan                                     |
| isSuperAdmin         | bool            | Biz. Tenant filtri unga ham qo'llanadi, faqat markaz tanlash imkoni bor |
| createdAt, updatedAt | timestamptz     |                                                                         |

Nega `login` global unique, markaz ichida emas: bitta odam bir nechta markazda bo'lishi mumkin,
akkaunt bitta. Login formati 2-bosqichda aniqlanadi (masalan `markaz-slug.ism` yoki telefon).

### Membership (User x Center x Role)

| Ustun                | Tur         | Izoh                                              |
| -------------------- | ----------- | ------------------------------------------------- |
| id                   | cuid        |                                                   |
| userId               | fk User     | cascade                                           |
| centerId             | fk Center   | cascade                                           |
| role                 | enum Role   | STUDENT, TEACHER, CENTER_ADMIN                    |
| isActive             | bool        | O'quvchi markazdan ketsa `false`, tarix saqlanadi |
| createdAt, updatedAt | timestamptz |                                                   |

Cheklovlar: `@@unique([userId, centerId])` - bir odam bir markazda bitta rol.
Indeks: `@@index([centerId, role])` - "markazdagi barcha o'quvchilar" so'rovi uchun.

### enum Role

`STUDENT | TEACHER | CENTER_ADMIN`. Super admin bu yerda **yo'q** (`User.isSuperAdmin`) -
shunda `centerId` hech qachon nullable bo'lmaydi.

## 3-bosqich (T-008 da yoziladi; aniq modellar `docs/tasks/T-008-domain-student-read.md`)

Qaror (2026-09-18): kontent GLOBAL (`centerId` yo'q), o'quvchi ma'lumotlari TENANT. Stitch dizayni
bo'yicha qo'shimcha: `StudentStats` (XP, streak), `MentorMessage`.

Dastlabki reja:

Hammasi `centerId` bilan (tenant):

- `Group` - guruh (o'qituvchi + o'quvchilar). `GroupMember`.
- `Subject` - fan. `Topic` - mavzu (`subjectId`, `order`).
- `TopicPrerequisite` - graf qirrasi: `topicId -> prerequisiteId` (DAG, sikl yo'q, seed tekshiradi).
- `Question` - `topicId`, `difficulty (1..3)`, matn, variantlar, to'g'ri javob.
- `Test` - savollar to'plami; `TestAssignment` - guruh/o'quvchiga tayinlash.
- `TestAttempt` - `studentId`, `testId`, boshlangan/tugagan vaqt. `Answer` - `attemptId`, `questionId`, tanlangan, to'g'rimi.
- `KnowledgeGap` - `studentId`, `topicId`, `rootTopicId?`, `confidence (0..1)`, `attemptId`, `explanation?` (AI).
- `Material` - `topicId`, sarlavha, havola, tur. `NextStep` - `studentId`, `gapId`, `materialId`, `instruction`, `status`.

Global (tenant emas): `Subject`, `Topic`, `TopicPrerequisite`, `Question`, `Material` bo'lishi
mumkin (barcha markazlar bitta kontentdan foydalanadi) - **3-bosqichda qaror qilinadi**;
hozircha default: global kontent, markaz o'zi qo'shsa `centerId?` bilan.

## Migratsiya tartibi

```
pnpm --filter @zexn/server prisma:migrate --name <nom>   # dev: yaratadi + qo'llaydi
pnpm --filter @zexn/server prisma:deploy                 # prod: faqat qo'llaydi
pnpm --filter @zexn/server db:seed                       # dev seed (prisma/seed.ts)
```

Migratsiya fayllari commit qilinadi. Schema'ni tahrirlab migratsiya yaratmasdan PR ochilmaydi.

Eslatma: Prisma CLI `.env` ni faqat `apps/server/` ichidan qidiradi, bizniki repo root'da.
Shuning uchun `prisma:*` va `db:seed` skriptlari `dotenv -e ../../.env --` bilan boshlanadi.
`prisma generate` ga env kerak emas.
