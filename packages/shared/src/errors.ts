/**
 * API xato kodlari. Server AppError.code sifatida yuboradi, client shu kodga qarab
 * o'zbekcha xabar ko'rsatadi (HTTP status'ga emas, kodga tayanamiz).
 *
 * `as const`: qiymatlar literal type bo'lib qoladi ("NOT_FOUND", string emas),
 * shundan ApiErrorCode union type chiqadi.
 */
export const API_ERROR_CODES = {
  // umumiy
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",

  // auth / tenant (2-bosqich)
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  TENANT_REQUIRED: "TENANT_REQUIRED",
  RATE_LIMITED: "RATE_LIMITED",
  /** Holat eskirgan: masalan DONE vazifani qayta topshirish (409). Client ro'yxatni yangilaydi. */
  CONFLICT: "CONFLICT",
  /** AI provayder javob bermadi / kalit noto'g'ri (503). Client "keyinroq urinib ko'ring" ko'rsatadi. */
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
