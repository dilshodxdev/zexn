# 02 - Hackathon MVP chegarasi

## BOR (IN)

**Auth (2-bosqich)**

- Login + parol (bcrypt). Admin yaratadi, birinchi kirishda parol almashtiriladi.
- Telegram deep-link: `t.me/<bot>?start=<token>` -> akkauntga bog'lash.
- JWT access (~15 min) + refresh (~30 kun). Strategy pattern (`AuthStrategy`).
- Rollar: STUDENT, TEACHER, CENTER_ADMIN (membership), super admin (`User.isSuperAdmin`).

**Domen (3-bosqich)**

- Bitta fan (matematika, taxminan 10 mavzu), prerequisite graf qo'lda seed qilinadi.
- Savollar: mavzu + qiyinlik, variantli (single choice).
- Test topshirish: `TestAttempt` -> `Answer[]` -> deterministik tahlil -> `KnowledgeGap[]` -> `NextStep[]`.
- Materiallar: mavzuga bog'langan havolalar (video/matn), seed'dan.

**Frontend (4-bosqich)**

- Student: test -> bilim xaritasi -> keyingi qadam.
- Teacher: guruh dashboard (mavzu x zaif o'quvchilar soni, har o'quvchi uchun 1 qadam), test tayinlash.
- Center admin: o'quvchi/o'qituvchi/guruh CRUD, obuna holati (faqat ko'rsatish).
- i18n: uz. Vaqt UI'da Asia/Tashkent.
- **Mobil-first** (360px dan) va **PWA**: o'rnatiladi, app shell offline ochiladi (T-004).

**AI (5-bosqich)**

- `AiProvider` interfeysi. Mock -> real provayder (egasi tanlaydi).
- Ildiz sababi tushuntirishi + keyingi qadam matni. Qaror AI'da emas.

**Deploy (6-bosqich)**

- Docker Compose VPS'da, HTTPS (host nginx/caddy), seed real testga o'xshash.

## YO'Q (OUT)

- SMS OTP, Google/Apple login.
- Ko'p fan, mavzu/graf tahriri UI (faqat seed).
- Adaptiv test (savol tanlash o'quvchiga qarab).
- To'lov integratsiyasi, obuna avtomatlashtiruvi.
- Ota-ona kabineti.
- AI savol generatsiyasi, insho tekshiruvi.
- Native mobil ilova, push notification, offline test topshirish (PWA app shell BOR).
- ru tili (struktura tayyor, tarjima keyin).
- Super admin UI (faqat seed/SQL).

## Non-goals (ataylab qilinmaydi)

- Umumiy LMS (dars jadvali, davomat, baholar jurnali): biz LMS emasmiz, LMS ustidagi tahlil qatlamimiz.
- Real vaqt (websocket): polling/refetch yetadi.
- Mikroservislar: bitta server, modullar papkada.
