import { z } from "zod";

/**
 * GET /health javobi. Kontraktga namuna: server shu schema bo'yicha javob beradi,
 * client shu typeni ishlatadi. Yangi endpoint qo'shganda xuddi shunday fayl yoziladi.
 */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("zexn-server"),
  /** ISO 8601, UTC */
  time: z.string(),
  uptimeSec: z.number(),
  db: z.enum(["ok", "down"]),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
