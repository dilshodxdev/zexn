/**
 * Barcha yo'llar bitta joyda. Komponentlarda "/login" kabi qattiq string yozilmaydi,
 * ROUTES.login ishlatiladi. Parametrli yo'llar uchun funksiya: ROUTES.test(id).
 */
export const ROUTES = {
  home: "/",
  // 2-bosqich: login: "/login",
  // 4-bosqich: student: "/student", teacher: "/teacher", admin: "/admin",
} as const;
