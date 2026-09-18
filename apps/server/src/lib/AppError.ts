import type { ApiErrorCode } from "@zexn/shared";

/**
 * Biznes xatolarining yagona klassi. Service/controller `throw new AppError(...)` qiladi,
 * errorHandler uni { error: { message, code, meta } } formatiga o'giradi.
 *
 * Nega Error'dan meros: stack trace saqlanadi, `instanceof AppError` bilan ajratish oson.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: ApiErrorCode,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}
