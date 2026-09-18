# 06. Dizayn tizimi (ZEXN Design System)

Bu hujjat Google Stitch dizaynidan olingan dizayn tokenlari, semantik qatlam,
UI kit komponentlari va oraliqlar (spacing) qoidalarini belgilaydi.

## 1. Arxitektura va tamoyillar

Dizayn tizimi ikki qatlamga bo'linadi:

1. Semantik tokenlar (`apps/client/src/index.css` ichidagi `@theme` blokida).
2. Qayta ishlatiluvchi UI kit komponentlari (`apps/client/src/components/ui/`).

Ekranlar va funksional modullar (`screens/`, `features/`) xom ranglardan (masalan,
`bg-gray-100`, `text-blue-600`, hex kodlar) foydalanmaydi. Barcha vizual parametrlar
faqat semantik tokenlar orqali boshqariladi.

## 2. Tokenlar jadvali

### 2.1. Ranglar (Colors)

| Token nomi            | Qiymat                      | Stitch dizaynidagi manbasi / roli                                 |
| --------------------- | --------------------------- | ----------------------------------------------------------------- |
| `--color-brand`       | `#d9f944`                   | Stitch asosiy aksent rangi (tugmalar, faol tablar, XP indikatori) |
| `--color-brand-hover` | `#e6ff5e`                   | Asosiy aksent tugmalar hover holati                               |
| `--color-brand-soft`  | `rgba(217, 249, 68, 0.15)`  | Aksent badge foni, hoshiya va nozik ajratgichlar                  |
| `--color-bg`          | `#181a1b`                   | Sahifaning asosiy foni                                            |
| `--color-surface`     | `#1e2022`                   | Header, sidebar va markaziy ish panellari foni                    |
| `--color-surface-alt` | `#242729`                   | Ichki kartalar, inputlar va chat xabarlarining foni               |
| `--color-text`        | `#f1f5f9`                   | Asosiy matn foni (oq/och kulrang matn)                            |
| `--color-text-muted`  | `#94a3b8`                   | Ikkinchi darajali tavsif matnlari va label'lar                    |
| `--color-line`        | `rgba(255, 255, 255, 0.08)` | Ajratuvchi chiziqlar (border-white/5, border-white/10)            |
| `--color-ok`          | `#22c55e`                   | Muvaffaqiyat, online holati                                       |
| `--color-ok-soft`     | `rgba(34, 197, 94, 0.15)`   | Muvaffaqiyat holati yengil foni                                   |
| `--color-warn`        | `#f59e0b`                   | Ogohlantirish holati                                              |
| `--color-warn-soft`   | `rgba(245, 158, 11, 0.15)`  | Ogohlantirish holati yengil foni                                  |
| `--color-danger`      | `#ef4444`                   | Xatolik holati, bekor qilish                                      |
| `--color-danger-soft` | `rgba(239, 68, 68, 0.15)`   | Xatolik holati yengil foni                                        |
| `--color-info`        | `#1e60f0`                   | Qo'shimcha axborot va havolalar (Stitch accent)                   |
| `--color-info-soft`   | `rgba(30, 96, 240, 0.15)`   | Axborot holati yengil foni                                        |

### 2.2. Radius (Border Radius)

| Token nomi      | Qiymat           | Ishlatilishi                                          |
| --------------- | ---------------- | ----------------------------------------------------- |
| `--radius-sm`   | `0.375rem` (6px) | Kichik nishonlar va badge'lar                         |
| `--radius-md`   | `0.5rem` (8px)   | Standart tugmalar va inputlar                         |
| `--radius-lg`   | `0.75rem` (12px) | Katta tugmalar va ikonka konteynerlari (`rounded-xl`) |
| `--radius-card` | `1rem` (16px)    | Ichki va tashqi kartochkalar (`rounded-2xl`)          |

### 2.3. Soyalar (Shadows)

| Token nomi      | Qiymat                                                                    | Ishlatilishi                               |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------ |
| `--shadow-card` | `0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)`       | Standart kartochka soyasi                  |
| `--shadow-pop`  | `0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)` | Qalqib chiquvchi oynalar (dropdown, modal) |

### 2.4. Shriftlar (Typography)

| Token nomi       | Qiymat                | Ishlatilishi                                 |
| ---------------- | --------------------- | -------------------------------------------- |
| `--font-sans`    | `"Inter", sans-serif` | Barcha matnlar (Google Fonts orqali ulanadi) |
| `--font-display` | `"Inter", sans-serif` | Sarlavhalar va ajralib turuvchi matnlar      |

## 3. Spacing qoidalari (Oraliqlar)

1. Oraliqlar faqat Tailwind standart 4px karrali o'lchamlari bo'yicha beriladi:
   - `gap-1` / `p-1` = 4px
   - `gap-2` / `p-2` = 8px (kichik elementlar orasidagi masofa)
   - `gap-3` / `p-3` = 12px (kartochka ichidagi elementlar)
   - `gap-4` / `p-4` = 16px (standart kartochka padding)
   - `gap-6` / `p-6` = 24px (bo'limlar va bloklar orasidagi masofa)
   - `gap-8` / `p-8` = 32px (sahifa darajasidagi bo'linish)
2. Ichki padding:
   - Karta ichi: `p-4` (mobil) dan `p-5` (desktop) gacha.
   - Tugma: `h-8 px-3` (sm), `h-10 px-4` (md), `h-12 px-5` (lg).
   - Input: `px-3 py-2 text-sm`.
3. Mobil moslashuvchanlik:
   - Minimal ekran kengligi: 360px.
   - Har qanday gorizontal ro'yxat `flex-wrap` yoki `overflow-x-auto` bilan ta'minlanadi.

## 4. UI Kit komponentlari va variantlari

Barcha komponentlar `@/components/ui` orqali eksport qilinadi.

| Komponent    | Props / Variantlar                                                                                                                                                                                     | Tavsif                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `Button`     | `variant`: `"primary"` \| `"secondary"` \| `"ghost"` \| `"danger"`<br>`size`: `"sm"` \| `"md"` \| `"lg"`<br>`loading?`: boolean<br>`disabled?`: boolean<br>`icon?`: ReactNode<br>`fullWidth?`: boolean | Harakat tugmasi. Loading holatida avtomatik Spinner ko'rsatiladi va `aria-busy` faollashadi.     |
| `Card`       | `title?`: string<br>`subtitle?`: string<br>`actions?`: ReactNode<br>`padding?`: `"none"` \| `"md"`                                                                                                     | Konteyner blok. Hoshiya va soya tokenlar orqali berilgan.                                        |
| `Input`      | `label`: string<br>`error?`: string<br>`hint?`: string<br>HTML input props                                                                                                                             | Matn kiritish maydoni. Avtomatik id generatsiya qilinadi, xatolik bo'lsa `aria-invalid` ulanadi. |
| `Select`     | `label`: string<br>`options`: `{ value, label }[]`<br>`error?`: string<br>`hint?`: string                                                                                                              | Tanlash maydoni.                                                                                 |
| `Badge`      | `tone`: `"neutral"` \| `"brand"` \| `"ok"` \| `"warn"` \| `"danger"` \| `"info"`                                                                                                                       | Holat va toifani bildiruvchi nishon.                                                             |
| `Spinner`    | `size?`: `"sm"` \| `"md"`                                                                                                                                                                              | Yuklanish aylanuvchi indikatori.                                                                 |
| `EmptyState` | `title`: string<br>`description?`: string<br>`action?`: ReactNode<br>`icon?`: ReactNode                                                                                                                | Ma'lumot yo'qligini ifodalovchi blok.                                                            |
| `ErrorState` | `message`: string<br>`onRetry?`: () => void                                                                                                                                                            | Xatolik bloki va qayta urinish tugmasi.                                                          |
| `PageHeader` | `title`: string<br>`subtitle?`: string<br>`actions?`: ReactNode                                                                                                                                        | Sahifa bosh qismi sarlavhasi va harakatlar to'plami.                                             |
| `StatusDot`  | `ok`: boolean                                                                                                                                                                                          | Kichik holat nuqtasi (yashil yoki qizil).                                                        |
