import { z } from "zod";

/**
 * Majburiy env'lar startda tekshiriladi. Yetishmasa server ko'tarilmaydi -
 * "3 soatdan keyin undefined sababli yiqilish" o'rniga darrov, aniq xabar.
 *
 * Qoida: process.env ga to'g'ridan-to'g'ri murojaat faqat shu faylda. Qolgan kod `env` ni import qiladi.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL postgresql:// URL bo'lishi kerak" }),
  /** Vergul bilan bir nechta origin. Dev'da localhost:5173 avtomatik qo'shiladi (app.ts). */
  CLIENT_ORIGIN: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ),
  // 2-bosqich: auth. Hozircha ixtiyoriy, auth moduli ulanganda majburiy qilinadi.
  JWT_ACCESS_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const lines = result.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    // Bu yerda AppError emas: server hali yo'q, oddiy throw yetarli.
    throw new Error(`Env konfiguratsiyasi noto'g'ri:\n${lines.join("\n")}`);
  }
  return result.data;
}

export const env: Env = loadEnv();
export const isProd = env.NODE_ENV === "production";
