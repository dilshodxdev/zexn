# T-XXX - <nom>

**Status:** TODO | IN_PROGRESS | REVIEW | CHANGES_REQUESTED | BLOCKED | DONE
**Phase:** <1..6>
**Assignee:** <egasi | sherik | AI nomi>
**Reviewer:** <egasi | Claude>

## Goal

Bir-ikki gap: nima uchun bu task bor, tugaganda nima o'zgaradi.

## Read first

- `docs/README.md`
- `AGENTS.md`
- <tegishli docs/0X fayl>
- <namuna kod: masalan `apps/server/src/modules/health/`>

## Requirements

1. Aniq, tekshiriladigan talab.
2. ...

## Out of scope

- Bu task'da qilinmaydigan narsalar (scope creep oldini olish uchun aniq yoz).

## Self-checks

Ijrochi topshirishdan oldin o'zi bajaradi va natijani `Report` ga yozadi:

- [ ] `pnpm typecheck`
- [ ] `pnpm lint` va `pnpm format:check`
- [ ] (server) `prisma migrate dev` xatosiz, migratsiya fayli bor
- [ ] (server) `pnpm --filter @zexn/server dev` ko'tariladi, endpoint qo'lda sinalgan (curl/REST client)
- [ ] (client) `pnpm --filter @zexn/client build` xatosiz, ekran brauzerda ko'rilgan
- [ ] Uzun chiziq yo'q (`.claude/rules/NO_EM_DASH.md` dagi buyruq)

## Report

Ijrochi to'ldiradi:

- Nima qilindi (qisqa).
- O'zgargan/yangi fayllar (ro'yxat).
- Self-checks natijasi (qaysi buyruq, nima chiqdi). Sinalmagan bo'lsa ochiq yoz.
- Yangi dependency (bo'lsa) va sababi.

## Questions

Ijrochining savollari / noaniqliklar. Javobsiz bo'lsa Status: BLOCKED.

## Review findings

Reviewer to'ldiradi: topilmalar, qaror (DONE / CHANGES_REQUESTED), sabab.
