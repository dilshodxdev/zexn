# 05 - API

Prefiks: `/api`. Istisno: `GET /health` prefikssiz (nginx `/api/health` ni unga yo'naltiradi,
Vite dev proxy ham). JSON, UTF-8. Vaqt ISO 8601 UTC.

## Konvensiyalar

- **Validatsiya**: har endpoint `validate({ body?, query?, params? })`, schema
  `@zexn/shared` dan. Client o'sha schemadan typeni oladi.
- **Auth**: `Authorization: Bearer <access>`. Refresh token httpOnly cookie (2-bosqich).
- **Tenant**: himoyalangan endpointlarda `req.centerId` JWT dan. Body/query'da `centerId`
  yuborilsa **e'tiborsiz** qoldiriladi (ishonilmaydi).
- **Sahifalash**: `?page=1&limit=20` -> `{ items, total, page, limit }` (`paginationQuerySchema`).
- **Rol**: jadvaldagi "Rol" ustuni - kim chaqira oladi. `SA` = super admin, `CA` = center
  admin, `T` = teacher, `S` = student, `*` = har qanday login qilgan, `-` = ochiq.

## Xato formati

Har xato bitta shaklda (`AppError` -> `errorHandler`):

```json
{
  "error": {
    "message": "So'rov ma'lumotlari noto'g'ri",
    "code": "VALIDATION_ERROR",
    "meta": { "part": "body", "issues": [{ "path": "login", "message": "Required" }] }
  }
}
```

`code` - `API_ERROR_CODES` dan (`packages/shared/src/errors.ts`). Client HTTP status'ga emas,
`code` ga qarab o'zbekcha xabar ko'rsatadi.

| HTTP | code                | Qachon                                                     |
| ---- | ------------------- | ---------------------------------------------------------- |
| 400  | VALIDATION_ERROR    | Zod schema o'tmadi, JSON buzuq                             |
| 401  | UNAUTHORIZED        | Token yo'q / noto'g'ri                                     |
| 401  | TOKEN_EXPIRED       | Access token muddati o'tgan -> client refresh qiladi       |
| 401  | INVALID_CREDENTIALS | Login/parol noto'g'ri                                      |
| 403  | FORBIDDEN           | Rol yetarli emas                                           |
| 403  | TENANT_REQUIRED     | JWT'da membership yo'q (markaz tanlanmagan)                |
| 404  | NOT_FOUND           | Resurs yo'q yoki boshqa markazniki (farqlanmaydi, ataylab) |
| 500  | INTERNAL_ERROR      | Kutilmagan xato; message umumiy, stack faqat server logda  |

## 1-bosqich endpointlari

| Method | Path      | Rol | Javob                                                                              |
| ------ | --------- | --- | ---------------------------------------------------------------------------------- |
| GET    | `/health` | -   | `HealthResponse`: `{ status: "ok", service, time, uptimeSec, db: "ok" \| "down" }` |
| GET    | `/api`    | -   | `{ name: "zexn-api", version }`                                                    |

`/health` DB yotgan bo'lsa ham **200** qaytaradi (server tirik), `db: "down"` bilan.
Monitoring `db` maydoniga qaraydi.

## 2-bosqich (reja, `03-auth.md` bilan birga aniqlashadi)

| Method | Path                            | Rol    | Izoh                                                                           |
| ------ | ------------------------------- | ------ | ------------------------------------------------------------------------------ |
| POST   | `/api/auth/login`               | -      | `{ login, password }` -> `{ accessToken, user, memberships }` + refresh cookie |
| POST   | `/api/auth/refresh`             | cookie | -> yangi access                                                                |
| POST   | `/api/auth/logout`              | *      | refresh bekor                                                                  |
| POST   | `/api/auth/change-password`     | *      | birinchi kirishda majburiy                                                     |
| POST   | `/api/auth/telegram/link-token` | *      | deep-link uchun token                                                          |
| POST   | `/api/auth/telegram/callback`   | bot    | bot -> backend (ichki)                                                         |
| POST   | `/api/auth/select-center`       | *      | membership tanlash -> yangi access (centerId bilan)                            |
| GET    | `/api/me`                       | *      | joriy user + membership                                                        |

## Admin (T-006, rol CA, hammasi tenant ichida)

`packages/shared/src/admin.ts` kontrakt. Endpoint jadvali: `docs/tasks/T-006-admin-module.md`.
`GET/POST /api/admin/users`, `PATCH /api/admin/users/:userId`, `GET/POST /api/admin/groups`,
`PATCH /api/admin/groups/:groupId`, `POST/DELETE .../students`, `GET /api/admin/overview`.

## 3-4 bosqich (reja)

Modullar: `groups`, `subjects`, `topics`, `tests`, `attempts`, `gaps`, `next-steps`, `dashboard`.
Har modul qo'shilganda avval `packages/shared/src/<modul>.ts` (schema), keyin shu jadval.
