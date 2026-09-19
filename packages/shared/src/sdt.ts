import { z } from "zod";
import { idSchema } from "./common.js";

/**
 * SDT - Student Digital Twin (o'quvchining raqamli egizagi).
 * Skill darajasidagi bilim modeli: har skill uchun mastery (0..100), confidence (0..1),
 * aniqlangan xato patternlar, keyingi qadam va progress tarixi.
 *
 * Endpointlar (rol TEACHER | CENTER_ADMIN, tenant ichida):
 *   GET  /api/digital-twin/class                                   -> classDigitalTwinSchema
 *   GET  /api/digital-twin/:studentId                              -> digitalTwinSchema
 *   GET  /api/digital-twin/:studentId/progress                     -> studentProgressSchema
 *   POST /api/digital-twin/:studentId/next-steps                   -> digitalTwinSchema (Qayta tekshir / qo'lda qadam)
 *   POST /api/digital-twin/:studentId/next-steps/:nextStepId/assign -> digitalTwinSchema (Vazifa yubor)
 *   POST /api/digital-twin/:studentId/notes                        -> digitalTwinSchema (Izoh yubor, P1)
 *
 * Skill = mavjud Topic ustidagi nozik qatlam (har skill bitta topic'ga bog'liq). Topic duplicate qilinmaydi.
 */

/* ---------- Konstantalar (server hisoblaydi, client ko'rsatadi) ---------- */

/**
 * Mastery yangilash formulasi (sodda, tushunarli):
 *   newMastery = oldMastery * historical + evidence * evidenceWeight
 * Maqsadli (targeted) vazifa kuchliroq dalil: 0.6 / 0.4.
 * Yangi skill uchun prior 50 (hech narsa bilmaymiz - o'rtacha).
 * Pattern aniqlanganda evidence = 30 (salbiy dalil, lekin 0 emas - bitta xato hammasini yo'qqa chiqarmaydi).
 * Confidence = min(1, attempts / confidenceAttempts).
 */
export const SDT_WEIGHTS = {
  historical: 0.7,
  evidence: 0.3,
  targetedHistorical: 0.6,
  targetedEvidence: 0.4,
  priorMastery: 50,
  patternEvidence: 30,
  confidenceAttempts: 5,
} as const;

/** Skill darajalari: strong >= 75, weak < 60, o'rtasi developing. */
export const SKILL_TIERS = ["strong", "developing", "weak", "unassessed"] as const;
export const skillTierSchema = z.enum(SKILL_TIERS);
export type SkillTier = z.infer<typeof skillTierSchema>;
export const SKILL_TIER_THRESHOLDS = { strong: 75, weak: 60 } as const;

/** attempts = 0 bo'lsa "unassessed" (hali dalil yo'q), mastery ko'rsatilmaydi. */
export function skillTier(mastery: number, attempts: number): SkillTier {
  if (attempts === 0) return "unassessed";
  if (mastery >= SKILL_TIER_THRESHOLDS.strong) return "strong";
  if (mastery < SKILL_TIER_THRESHOLDS.weak) return "weak";
  return "developing";
}

export const PATTERN_STATUSES = ["ACTIVE", "IMPROVING", "RESOLVED"] as const;
export const patternStatusSchema = z.enum(PATTERN_STATUSES);
export type PatternStatus = z.infer<typeof patternStatusSchema>;

export const NEXT_STEP_ACTION_TYPES = ["TARGETED_TASK", "RETEST", "REVIEW_MATERIAL"] as const;
export const nextStepActionTypeSchema = z.enum(NEXT_STEP_ACTION_TYPES);
export type NextStepActionType = z.infer<typeof nextStepActionTypeSchema>;

export const SKILL_HISTORY_SOURCES = [
  "ATTEMPT",
  "SUBMISSION",
  "REVIEW",
  "INTERVIEW",
  "SEED",
] as const;
export const skillHistorySourceSchema = z.enum(SKILL_HISTORY_SOURCES);
export type SkillHistorySource = z.infer<typeof skillHistorySourceSchema>;

/** Seed'dagi skill kalitlari (React Beginner). Server seed va detektor shu kalitlarga tayanadi. */
export const SKILL_KEYS = [
  "jsx",
  "props",
  "components",
  "lists-keys",
  "conditional-rendering",
  "state",
  "state-immutability",
  "events",
  "forms",
  "use-effect",
  "api-fetching",
  "component-architecture",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

/** Deterministik detektor aniqlaydigan xato patternlar (kod -> skill mapping seed'da). */
export const ERROR_PATTERN_CODES = [
  "DIRECT_STATE_MUTATION",
  "MISSING_KEY_PROP",
  "INDEX_AS_KEY",
  "MISSING_EFFECT_DEPS",
  "NUMBER_AND_RENDER",
] as const;
export type ErrorPatternCode = (typeof ERROR_PATTERN_CODES)[number];

/* ---------- Javob bo'laklari ---------- */

export const skillCardSchema = z.object({
  id: idSchema,
  key: z.string(),
  name: z.string(),
  topicId: idSchema,
  topicTitle: z.string(),
  /** 0..100. attempts = 0 bo'lsa ham prior (50) qaytadi, client tier'ga qarab yashiradi. */
  mastery: z.number().int().min(0).max(100),
  confidence: z.number().min(0).max(1),
  attempts: z.number().int(),
  tier: skillTierSchema,
  lastActivityAt: z.string().nullable(),
});
export type SkillCard = z.infer<typeof skillCardSchema>;

export const patternCardSchema = z.object({
  /** StudentPattern.id */
  id: idSchema,
  patternId: idSchema,
  code: z.string(),
  name: z.string(),
  description: z.string(),
  skillId: idSchema,
  skillName: z.string(),
  occurrences: z.number().int(),
  resolvedCount: z.number().int(),
  status: patternStatusSchema,
  lastDetectedAt: z.string(),
});
export type PatternCard = z.infer<typeof patternCardSchema>;

export const twinNextStepSchema = z.object({
  id: idSchema,
  skillId: idSchema,
  skillName: z.string(),
  actionType: nextStepActionTypeSchema,
  /** Katta = muhimroq. Pattern'dan kelgan qadam 3, past mastery 1, qo'lda 2. */
  priority: z.number().int(),
  /** "Nega": pattern tavsifi yoki "mastery 42%" */
  reason: z.string(),
  /** O'quvchiga ko'rinadigan ko'rsatma */
  instruction: z.string(),
  status: z.enum(["pending", "done"]),
  /** "Vazifa yubor" bosilgan bo'lsa yaratilgan Assignment id */
  assignmentId: idSchema.nullable(),
  createdAt: z.string(),
});
export type TwinNextStep = z.infer<typeof twinNextStepSchema>;

export const progressPointSchema = z.object({
  id: idSchema,
  skillId: idSchema,
  skillName: z.string(),
  previousScore: z.number().int(),
  newScore: z.number().int(),
  source: skillHistorySourceSchema,
  /** Timeline matni: "Maqsadli vazifa qabul qilindi (90 ball)" */
  label: z.string(),
  createdAt: z.string(),
});
export type ProgressPoint = z.infer<typeof progressPointSchema>;

/* ---------- GET /api/digital-twin/:studentId ---------- */

export const digitalTwinSchema = z.object({
  student: z.object({ id: idSchema, fullName: z.string(), login: z.string() }),
  course: z.object({
    id: idSchema,
    title: z.string(),
    /** "React Beginner" - hozircha statik, keyin mastery'dan hisoblanadi */
    level: z.string(),
  }),
  /** Baholangan skill'lar o'rtachasi; hech biri baholanmagan bo'lsa null */
  overallMastery: z.number().int().min(0).max(100).nullable(),
  /** Baholangan skill'lar confidence o'rtachasi (0 - dalil yo'q) */
  confidence: z.number().min(0).max(1),
  /** "JSX va Props yaxshi. State immutability va Shartli rendering'da bo'shliq bor." */
  summary: z.string(),
  strongSkills: z.array(skillCardSchema),
  developingSkills: z.array(skillCardSchema),
  weakSkills: z.array(skillCardSchema),
  unassessedSkills: z.array(skillCardSchema),
  /** ACTIVE va IMPROVING */
  activePatterns: z.array(patternCardSchema),
  resolvedPatterns: z.array(patternCardSchema),
  /** Faqat pending, priority desc; birinchisi "ZEXN tavsiyasi" */
  nextSteps: z.array(twinNextStepSchema),
  /** Oxirgi 20 ta, yangisi birinchi */
  recentProgress: z.array(progressPointSchema),
  updatedAt: z.string().nullable(),
});
export type DigitalTwin = z.infer<typeof digitalTwinSchema>;

/* ---------- GET /api/digital-twin/:studentId/progress ---------- */

export const studentProgressSchema = z.object({
  skills: z.array(
    z.object({
      skillId: idSchema,
      skillName: z.string(),
      /** Eskidan yangiga (chart uchun), maksimum 50 nuqta */
      points: z.array(
        z.object({
          score: z.number().int(),
          source: skillHistorySourceSchema,
          label: z.string(),
          createdAt: z.string(),
        }),
      ),
    }),
  ),
});
export type StudentProgress = z.infer<typeof studentProgressSchema>;

/* ---------- GET /api/digital-twin/class ---------- */

export const classStudentRowSchema = z.object({
  id: idSchema,
  fullName: z.string(),
  login: z.string(),
  overallMastery: z.number().int().min(0).max(100).nullable(),
  confidence: z.number().min(0).max(1),
  weakestSkill: z.object({ id: idSchema, name: z.string(), mastery: z.number().int() }).nullable(),
  activePatternCount: z.number().int(),
  /** overallMastery < 50 yoki >= 2 ACTIVE pattern */
  atRisk: z.boolean(),
  updatedAt: z.string().nullable(),
});
export type ClassStudentRow = z.infer<typeof classStudentRowSchema>;

export const CLASS_ACTION_TYPES = ["GROUP_LESSON", "TARGETED_TASKS", "RETEST"] as const;
export const classActionTypeSchema = z.enum(CLASS_ACTION_TYPES);

export const classDigitalTwinSchema = z.object({
  /** Markazning faol STUDENT'lari, atRisk birinchi, keyin overallMastery asc */
  students: z.array(classStudentRowSchema),
  studentsAtRisk: z.number().int(),
  /** Kamida 2 o'quvchida weak bo'lgan skill'lar, studentCount desc */
  commonWeakSkills: z.array(
    z.object({
      skillId: idSchema,
      name: z.string(),
      studentCount: z.number().int(),
      avgMastery: z.number().int(),
    }),
  ),
  /** ACTIVE/IMPROVING pattern'lar bo'yicha, studentCount desc */
  commonPatterns: z.array(
    z.object({
      patternId: idSchema,
      code: z.string(),
      name: z.string(),
      studentCount: z.number().int(),
    }),
  ),
  /** Server qoidasi: eng ko'p weak skill -> GROUP_LESSON; eng ko'p pattern -> TARGETED_TASKS */
  recommendedActions: z.array(
    z.object({
      type: classActionTypeSchema,
      skillId: idSchema,
      skillName: z.string(),
      text: z.string(),
    }),
  ),
});
export type ClassDigitalTwin = z.infer<typeof classDigitalTwinSchema>;

/* ---------- Body / params ---------- */

/** POST /api/digital-twin/:studentId/next-steps - o'qituvchi qo'lda qadam yaratadi ("Qayta tekshir") */
export const createTwinNextStepBodySchema = z.object({
  skillId: idSchema,
  actionType: nextStepActionTypeSchema,
  reason: z.string().trim().max(500).optional(),
});
export type CreateTwinNextStepBody = z.infer<typeof createTwinNextStepBodySchema>;

/** POST .../next-steps/:nextStepId/assign - "Vazifa yubor" */
export const assignNextStepBodySchema = z.object({
  dueInDays: z.number().int().min(1).max(14).default(2),
});
export type AssignNextStepBody = z.infer<typeof assignNextStepBodySchema>;

/** POST /api/digital-twin/:studentId/notes - "Izoh yubor" (P1): o'quvchining mentor chatiga o'qituvchi izohi */
export const sendTwinNoteBodySchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
export type SendTwinNoteBody = z.infer<typeof sendTwinNoteBodySchema>;

export const twinParamsSchema = z.object({ studentId: idSchema });
export const twinNextStepParamsSchema = z.object({ studentId: idSchema, nextStepId: idSchema });
