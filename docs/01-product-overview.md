# 01 - Mahsulot haqida

## Muammo

Ikki o'quvchi bir xil ball oladi, lekin sababi har xil: biri kasrlarni qo'shishda EKUK'ni
bilmaydi, ikkinchisi e'tiborsizlikdan xato qiladi. O'qituvchi ikkalasiga bir xil vazifa
beradi. Bo'shliqlar yig'iladi, o'quvchi orqada qoladi va tashlab ketadi. O'qituvchiga 30
o'quvchining har birini alohida tahlil qilishga vaqt yetmaydi. Mavjud LMS'lar faqat ballni
ko'rsatadi, sababni emas.

## Yechim

ZEXN xatoning **ildizini** topadi va aynan shuni tuzatadigan keyingi qadamni beradi.

1. O'quvchi test topshiradi (savollar mavzu + qiyinlikka bog'langan).
2. Deterministik tahlil: mavzu X da xato -> X ning prerequisite'laridan qaysi biri zaif?
   (mavzular grafi orqali).
3. Natija: `KnowledgeGap` (o'quvchi x mavzu, ildiz sababi, ishonch darajasi).
4. `NextStep`: qaysi mavzuni qaysi material bilan takrorlash. AI (LLM) faqat tushuntirish
   matnini va qadam matnini yozadi - qaror deterministik.
5. O'qituvchi sinf ko'rinishi: qaysi mavzuda nechta o'quvchi zaif, har biri uchun 1 ta eng
   muhim qadam.

## Kim uchun

| Rol               | Nima oladi                                              |
| ----------------- | ------------------------------------------------------- |
| O'quvchi          | Bilim xaritasi + aniq keyingi qadam                     |
| O'qituvchi        | Sinf ko'rinishi, kim qayerda qoqilyapti, test tayinlash |
| Markaz admini     | O'qituvchi/o'quvchi/guruh boshqaruvi, obuna holati      |
| Super admin (biz) | Markazlar, litsenziyalar (dizaynsiz, eng oxirida)       |

Rol markazga bog'liq (membership): bir odam bir markazda o'qituvchi, boshqasida admin.

## Kim to'laydi

O'quv markazlari, davlat dasturlari (IT Park), xususiy maktablar, keyinroq ota-onalar.
Har o'quvchi uchun oylik obuna; davlat dasturlariga yillik litsenziya.

## Pilot va isbot

Birinchi pilot: **IT Park Xorazm**. Hackathon davomida real o'quvchilar testdan o'tadi,
natija o'qituvchi dashboard'ida ko'rsatiladi.

## Qarorlar jurnali

| Sana       | Qaror                                                                         | Sabab                                                                               |
| ---------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-09-18 | pnpm workspaces, Turborepo/Nx yo'q                                            | 3 paket uchun ortiqcha; `pnpm -r` yetadi                                            |
| 2026-09-18 | Prisma 6 (7 emas)                                                             | Prisma 7 `prisma.config.ts` + driver adapter talab qiladi; hackathon uchun ortiqcha |
| 2026-09-18 | Express 4 (5 emas)                                                            | Typelar va middleware ekotizimi barqaror; `asyncHandler` bilan async xato ushlanadi |
| 2026-09-18 | Super admin `User.isSuperAdmin`, Membership'da emas                           | Tenant filtri (`centerId`) hech qachon nullable bo'lmaydi                           |
| 2026-09-18 | `User.passwordHash` nullable                                                  | Telegram-only akkaunt bo'lishi mumkin                                               |
| 2026-09-18 | Deterministik tahlil birinchi, LLM faqat matn                                 | Natija takrorlanuvchan va tushuntiriladigan bo'lsin; AI yiqilsa ham qadam bor       |
| 2026-09-18 | Vite dev proxy = nginx qoidasi (`/api/health -> /health`)                     | Dev va prod bir xil yo'l, `VITE_API_URL` bo'sh                                      |
| 2026-09-18 | Auth stub default yopiq (401)                                                 | Ochiq stub xavfsizlik teshigi                                                       |
| 2026-09-18 | Hujjatlar o'zbekcha, kod inglizcha, UI o'zbekcha                              | Sherik va pilot uchun tushunarli                                                    |
| 2026-09-18 | Ko'p-AI ish tartibi: Claude orkestrator/reviewer, Codex server, Gemini client | Tez tempda parallel ish; har ijrochi faqat o'z papkasi                              |
| 2026-09-18 | Tekshiruvchi = `pnpm check` skript, review faqat diff                         | Token tejash; grep 0 tokenda 100% aniq                                              |
| 2026-09-18 | Testlar faqat kritik joylarda (tenant scope, JWT, analysis)                   | Hackathon tempi; qolgan joyda `pnpm check` yetadi                                   |
| 2026-09-18 | PWA (o'rnatiladigan) + mobil-first majburiy                                   | Egasi talabi; pilotda o'quvchilar telefondan kiradi                                 |
| 2026-09-18 | Register = markaz ro'yxatdan o'tadi, birinchi CENTER_ADMIN                    | SaaS uchun tabiiy; o'quvchini admin yaratadi                                        |
| 2026-09-18 | Admin UI `apps/client` ichida alohida papkalarda, GPT bajaradi                | Bitta kit, bitta deploy; papka chegarasi to'qnashuvni oldini oladi                  |
