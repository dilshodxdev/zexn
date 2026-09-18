/**
 * Barcha yo'llar bitta joyda. Komponentlarda "/login" kabi qattiq string yozilmaydi,
 * ROUTES.login ishlatiladi. Parametrli yo'llar uchun funksiya: ROUTES.test(id).
 */
export const ROUTES = {
  home: "/",
  ...(import.meta.env.DEV
    ? {
        dev: {
          uiKit: "/dev/ui",
        },
      }
    : {}),
} as const;
