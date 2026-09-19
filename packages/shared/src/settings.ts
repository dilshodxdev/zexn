import { z } from "zod";
import { idSchema } from "./common.js";

/**
 * AI mentor sozlamalari - system prompt ikki qatlamda:
 *   - platforma (super admin):   GET/PUT /api/superadmin/settings/ai   (User.isSuperAdmin)
 *   - markaz (teacher/admin):    GET/PUT /api/settings/ai               (TEACHER | CENTER_ADMIN, tenant)
 * Yakuniy system prompt = platforma matni + markaz matni + avtomatik kontekst (o'quvchi, kurs, zaif mavzular,
 * keyingi qadam). Bo'sh bo'lsa server o'zining default matnini ishlatadi.
 *
 * Super admin bosh sahifasi: GET /api/superadmin/overview.
 */

/** Prompt uzunligi: 4000 belgi (DeepSeek/OpenAI kontekstida arzon, UI textarea uchun yetarli). */
export const AI_PROMPT_MAX = 4000;

export const aiSettingsSchema = z.object({
  /** Bo'sh string = sozlanmagan (server default ishlatadi) */
  prompt: z.string(),
  /** Faqat ko'rsatish uchun: qaysi provayder ishlayapti ("mock" | "deepseek") */
  provider: z.string(),
  /** Server default matni - UI'da placeholder/yordam sifatida ko'rsatiladi */
  defaultPrompt: z.string(),
  updatedAt: z.string().nullable(),
  updatedBy: z.object({ id: idSchema, fullName: z.string() }).nullable(),
});
export type AiSettings = z.infer<typeof aiSettingsSchema>;

/** PUT .../settings/ai */
export const updateAiSettingsBodySchema = z.object({
  prompt: z.string().trim().max(AI_PROMPT_MAX),
});
export type UpdateAiSettingsBody = z.infer<typeof updateAiSettingsBodySchema>;

/** POST .../settings/ai/test - promptni saqlamasdan sinash (P1) */
export const testAiPromptBodySchema = z.object({
  prompt: z.string().trim().max(AI_PROMPT_MAX),
  message: z.string().trim().min(1).max(2000),
});
export type TestAiPromptBody = z.infer<typeof testAiPromptBodySchema>;

export const testAiPromptResponseSchema = z.object({
  reply: z.string(),
  provider: z.string(),
  /** Server o'lchagan javob vaqti, ms */
  latencyMs: z.number().int(),
});
export type TestAiPromptResponse = z.infer<typeof testAiPromptResponseSchema>;

/* ---------- Super admin ---------- */

/** GET /api/superadmin/overview */
export const superAdminOverviewSchema = z.object({
  centers: z.number().int(),
  activeCenters: z.number().int(),
  users: z.number().int(),
  students: z.number().int(),
  teachers: z.number().int(),
  aiProvider: z.string(),
  /** So'nggi yaratilgan markazlar (max 10), createdAt desc */
  recentCenters: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      slug: z.string(),
      isActive: z.boolean(),
      studentCount: z.number().int(),
      teacherCount: z.number().int(),
      createdAt: z.string(),
    }),
  ),
});
export type SuperAdminOverview = z.infer<typeof superAdminOverviewSchema>;
