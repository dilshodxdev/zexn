import { z } from "zod";
import { API_ERROR_CODES } from "./errors.js";

/**
 * Server xato javobining yagona formati:
 *   { "error": { "message": "...", "code": "NOT_FOUND", "meta": { ... } } }
 * errorHandler middleware faqat shu shaklda javob beradi.
 */
export const apiErrorBodySchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.enum(Object.values(API_ERROR_CODES) as [string, ...string[]]).optional(),
    meta: z.record(z.unknown()).optional(),
  }),
});
export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/** Markaz ichidagi rollar. Super admin markazga bog'liq emas: User.isSuperAdmin. */
export const ROLES = ["STUDENT", "TEACHER", "CENTER_ADMIN"] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

/** Ro'yxat endpointlari uchun umumiy sahifalash. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** Prisma ID lari: cuid. Zod'da alohida nomlab qo'yamiz, keyin almashtirish oson. */
export const idSchema = z.string().min(1);
