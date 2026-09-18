/**
 * Barcha yo'llar bitta joyda. Komponentlarda "/login" kabi qattiq string yozilmaydi,
 * ROUTES.login ishlatiladi. Parametrli yo'llar uchun funksiya: ROUTES.test(id).
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  selectCenter: "/select-center",
  app: "/app",
  admin: "/admin",
  dev: {
    health: "/dev/health",
    uiKit: "/dev/ui",
  },
} as const;
