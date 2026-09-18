# ZEXN - hujjatlar indeksi

**Nima qurayapmiz.** ZEXN - har bir o'quvchining bilimidagi bo'shliqni aniqlab, unga mos
keyingi o'quv qadamini avtomatik beradigan AI platforma. Ikki o'quvchi bir xil ball oladi,
lekin sababi har xil; ZEXN xatoning **ildizini** (prerequisite mavzudagi zaiflik) topadi va
aynan shuni tuzatadigan qadamni beradi. O'qituvchi sinf ko'rinishida kim qayerda qoqilayotganini
ko'radi. Shior: "Bir sinf. O'ttiz xil yo'l." Birinchi pilot: IT Park Xorazm.

**Asosiy oqim:** Test -> bilim xaritasi -> xato ildizi -> keyingi qadam -> o'qituvchi uchun sinf ko'rinishi.

## Hackathon MVP: IN / OUT

| IN                                                  | OUT                             |
| --------------------------------------------------- | ------------------------------- |
| Login + parol, Telegram deep-link                   | SMS OTP, ijtimoiy login         |
| Bitta fan, ~10 mavzu, prerequisite graf             | Ko'p fan, mavzu tahriri UI      |
| Test topshirish, deterministik tahlil               | Adaptiv test (savol tanlash)    |
| Bilim xaritasi + 1 ta keyingi qadam                 | To'liq o'quv rejasi             |
| O'qituvchi sinf ko'rinishi                          | Ota-ona kabineti                |
| Markaz admini: o'quvchi/guruh                       | To'lov, obuna avtomatlashtiruvi |
| AI: ildiz tushuntirish + qadam matni (mock -> real) | AI savol generatsiyasi          |
| Docker Compose deploy, HTTPS                        | Mobil ilova, PWA, offline       |

To'liq: [02-scope.md](02-scope.md).

## Fayllar

| Fayl                                             | Nima bor                                          | Holat            |
| ------------------------------------------------ | ------------------------------------------------- | ---------------- |
| [01-product-overview.md](01-product-overview.md) | Nega, kim uchun, pilot, qarorlar jurnali          | tayyor           |
| [02-scope.md](02-scope.md)                       | MVP'da nima bor / yo'q, non-goals                 | tayyor           |
| 03-auth.md                                       | Ikki login oqimi, strategy, tokenlar, endpointlar | 2-bosqichda      |
| [04-data-model.md](04-data-model.md)             | Prisma schema, tenant qoidasi, timezone           | 1-bosqich qismi  |
| [05-api.md](05-api.md)                           | Endpointlar, xato formati                         | 1-bosqich qismi  |
| 06-design-system.md                              | Ranglar, shriftlar, komponentlar                  | 4-bosqichda      |
| 07-screens.md                                    | Ekranma-ekran holatlar                            | 4-bosqichda      |
| [08-build-plan.md](08-build-plan.md)             | Bosqichlar, joriy holat, qabul mezonlari          | doim yangilanadi |
| DEPLOY.md                                        | VPS runbook                                       | 6-bosqichda      |
| [tasks/](tasks/)                                 | Task brieflar `T-XXX-<slug>.md`                   | doim             |
| `agent-log/`                                     | AI ish jurnali (lokal, commit qilinmaydi)         | lokal            |

## Sen kim bo'lsang, birinchi nimani o'qiysan

| Kim                        | Tartib                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| Backend dasturchi (sherik) | README -> `AGENTS.md` -> 04 -> 05 -> 08 -> o'z task fayling -> `apps/server/src/modules/health/` (namuna) |
| Frontend dasturchi (egasi) | README -> `AGENTS.md` -> 05 -> 07 (bo'lganda) -> 06 -> 08 -> `apps/client/src/features/health/` (namuna)  |
| AI ijrochi (bitta task)    | `AGENTS.md` -> README -> berilgan task fayli -> task'da ko'rsatilgan hujjatlar                            |
| Review qiluvchi            | Task fayli -> `AGENTS.md` 6-bo'lim (invariantlar) -> diff                                                 |
| Deploy qiluvchi            | DEPLOY.md (bo'lganda) -> `docker-compose.prod.yml` -> `.env.production.example`                           |

## Tez boshlash (dev)

```
pnpm install
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
docker compose up -d            # Postgres
pnpm --filter @zexn/server prisma:migrate --name init
pnpm --filter @zexn/server db:seed
pnpm dev                        # shared watch + server :4000 + client :5173
```

Tekshirish: http://localhost:4000/health, http://localhost:5173 (client `/api/health` ni ko'rsatadi).
