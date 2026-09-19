import { z } from "zod";
import { idSchema } from "./common.js";
import { skillTierSchema } from "./sdt.js";

/**
 * AI intervyu: o'quvchi SOHA tanlaydi (frontend, backend, mobile, fullstack, android, ios), AI 5 ta savol beradi:
 * 3 nazariy + 2 kod topshirig'i (Monaco muharririda yechiladi, AI baholaydi - kod ijro etilmaydi).
 * Har javobga ball + qisqa fikr, yakunda umumiy ball va xulosa. `frontend` sohasida React skill tanlansa
 * SDT yangilanadi (source INTERVIEW); boshqa sohalarda faqat intervyu tarixi.
 *
 * Endpointlar (rol STUDENT, tenant ichida, /api/student/interviews):
 *   GET  /tracks               -> interviewTrackInfoSchema[]  (sohalar, o'quvchi statistikasi bilan)
 *   GET  /skills               -> interviewSkillSchema[]      (frontend uchun ixtiyoriy skill tanlash)
 *   GET  /                     -> interviewListItemSchema[]
 *   POST /                     -> interviewSessionSchema (201)  body: startInterviewBodySchema
 *   GET  /:sessionId           -> interviewSessionSchema
 *   POST /:sessionId/answer    -> interviewSessionSchema       body: answerInterviewBodySchema
 *   POST /:sessionId/abandon   -> interviewSessionSchema
 * O'qituvchi (TEACHER | CENTER_ADMIN):
 *   GET  /api/digital-twin/:studentId/interviews -> interviewListItemSchema[]
 */

export const INTERVIEW_QUESTION_COUNT = 5;
/** 0-asosli indekslar: qaysi savollar kod topshirig'i (2- va 4-savol) */
export const INTERVIEW_CODE_INDEXES = [1, 3] as const;
export const INTERVIEW_ANSWER_MAX = 2000;
export const INTERVIEW_CODE_MAX = 8000;

/* ---------- Sohalar ---------- */

export const INTERVIEW_TRACKS = [
  "frontend",
  "backend",
  "mobile",
  "fullstack",
  "android",
  "ios",
] as const;
export const interviewTrackSchema = z.enum(INTERVIEW_TRACKS);
export type InterviewTrack = z.infer<typeof interviewTrackSchema>;

/** Monaco tillari (highlight uchun). Kod savolida `language` shu ro'yxatdan. */
export const INTERVIEW_LANGUAGES = [
  "tsx",
  "typescript",
  "javascript",
  "html",
  "css",
  "python",
  "sql",
  "dart",
  "kotlin",
  "java",
  "swift",
] as const;
export const interviewLanguageSchema = z.enum(INTERVIEW_LANGUAGES);
export type InterviewLanguage = z.infer<typeof interviewLanguageSchema>;

/** Soha -> ruxsat etilgan tillar (birinchisi default). Server savol yaratganda, client muharrirda ishlatadi. */
export const INTERVIEW_TRACK_LANGUAGES: Record<InterviewTrack, readonly InterviewLanguage[]> = {
  frontend: ["tsx", "typescript", "javascript", "html", "css"],
  backend: ["typescript", "javascript", "python", "sql"],
  mobile: ["dart", "kotlin", "swift"],
  fullstack: ["typescript", "tsx", "sql"],
  android: ["kotlin", "java"],
  ios: ["swift"],
};

/** Soha -> savollar mavzusi (AI promptida va mock bankida). */
export const INTERVIEW_TRACK_TOPICS: Record<InterviewTrack, string> = {
  frontend: "HTML/CSS, JavaScript, React, state, rendering, brauzer, HTTP",
  backend: "Node.js/Express, REST API, autentifikatsiya, ma'lumotlar bazasi, SQL, xavfsizlik",
  mobile: "Flutter/Dart yoki React Native, ekranlar, navigatsiya, state, API, offline",
  fullstack: "Frontend + backend integratsiya, REST/JSON, auth oqimi, deploy, monorepo",
  android: "Kotlin, Android lifecycle, Jetpack Compose, ViewModel, coroutines, Room",
  ios: "Swift, SwiftUI, UIKit lifecycle, Combine/async-await, Core Data, App Store",
};

export const INTERVIEW_STATUSES = ["IN_PROGRESS", "DONE", "ABANDONED"] as const;
export const interviewStatusSchema = z.enum(INTERVIEW_STATUSES);
export type InterviewStatus = z.infer<typeof interviewStatusSchema>;

/** Qiyinlik: frontend + skill bo'lsa mastery'dan (< 60 easy, < 75 medium, aks holda hard); boshqa hollarda o'quvchi tanlaydi */
export const INTERVIEW_LEVELS = ["easy", "medium", "hard"] as const;
export const interviewLevelSchema = z.enum(INTERVIEW_LEVELS);
export type InterviewLevel = z.infer<typeof interviewLevelSchema>;

export const INTERVIEW_QUESTION_KINDS = ["theory", "code"] as const;
export const interviewQuestionKindSchema = z.enum(INTERVIEW_QUESTION_KINDS);
export type InterviewQuestionKind = z.infer<typeof interviewQuestionKindSchema>;

/* ---------- Ro'yxatlar ---------- */

/** GET /tracks */
export const interviewTrackInfoSchema = z.object({
  track: interviewTrackSchema,
  languages: z.array(interviewLanguageSchema),
  /** Tugallangan intervyular soni (shu o'quvchi) */
  interviewCount: z.number().int(),
  lastScore: z.number().int().min(0).max(100).nullable(),
  bestScore: z.number().int().min(0).max(100).nullable(),
});
export type InterviewTrackInfo = z.infer<typeof interviewTrackInfoSchema>;

/** GET /skills - frontend sohasi uchun ixtiyoriy React skill (SDT'ga ulash) */
export const interviewSkillSchema = z.object({
  id: idSchema,
  key: z.string(),
  name: z.string(),
  topicTitle: z.string(),
  mastery: z.number().int().min(0).max(100),
  tier: skillTierSchema,
  interviewCount: z.number().int(),
  lastScore: z.number().int().min(0).max(100).nullable(),
});
export type InterviewSkill = z.infer<typeof interviewSkillSchema>;

/* ---------- Sessiya ---------- */

/** Bitta savol-javob. answer null = hali javob berilmagan (joriy savol). */
export const interviewTurnSchema = z.object({
  index: z.number().int(),
  kind: interviewQuestionKindSchema,
  question: z.string(),
  /** kind = code: Monaco tili va boshlang'ich kod; theory'da null */
  language: interviewLanguageSchema.nullable(),
  starterCode: z.string().nullable(),
  /** theory: matn; code: o'quvchi yozgan kod */
  answer: z.string().nullable(),
  score: z.number().int().min(0).max(100).nullable(),
  /** AI ning 1-2 gaplik fikri (o'zbekcha) */
  feedback: z.string().nullable(),
  /** score < 70 bo'lsa AI bergan qisqa to'g'ri javob / namuna kod */
  modelAnswer: z.string().nullable(),
  answeredAt: z.string().nullable(),
});
export type InterviewTurn = z.infer<typeof interviewTurnSchema>;

export const interviewResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  /** Nazariy va kod savollari alohida o'rtachasi */
  theoryScore: z.number().int().min(0).max(100),
  codeScore: z.number().int().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).max(3),
  weaknesses: z.array(z.string()).max(3),
  /** Faqat skill bog'langan bo'lsa (frontend + skillId); aks holda null */
  masteryBefore: z.number().int().min(0).max(100).nullable(),
  masteryAfter: z.number().int().min(0).max(100).nullable(),
});
export type InterviewResult = z.infer<typeof interviewResultSchema>;

/** POST /, GET /:sessionId, answer, abandon javobi */
export const interviewSessionSchema = z.object({
  id: idSchema,
  track: interviewTrackSchema,
  /** frontend + skill tanlangan bo'lsa; aks holda null */
  skill: z.object({ id: idSchema, name: z.string(), topicTitle: z.string() }).nullable(),
  level: interviewLevelSchema,
  status: interviewStatusSchema,
  questionCount: z.number().int(),
  answeredCount: z.number().int(),
  turns: z.array(interviewTurnSchema),
  result: interviewResultSchema.nullable(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});
export type InterviewSession = z.infer<typeof interviewSessionSchema>;

/** GET / (student) va GET /api/digital-twin/:studentId/interviews (teacher) */
export const interviewListItemSchema = z.object({
  id: idSchema,
  track: interviewTrackSchema,
  skill: z.object({ id: idSchema, name: z.string() }).nullable(),
  level: interviewLevelSchema,
  status: interviewStatusSchema,
  answeredCount: z.number().int(),
  questionCount: z.number().int(),
  score: z.number().int().min(0).max(100).nullable(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});
export type InterviewListItem = z.infer<typeof interviewListItemSchema>;

/* ---------- Body / params ---------- */

/**
 * POST / - `track` majburiy. `skillId` faqat frontend'da (boshqa sohada 400).
 * `level` berilmasa: skill bo'lsa mastery'dan, aks holda "medium".
 */
export const startInterviewBodySchema = z.object({
  track: interviewTrackSchema,
  skillId: idSchema.optional(),
  level: interviewLevelSchema.optional(),
});
export type StartInterviewBody = z.infer<typeof startInterviewBodySchema>;

/** Javob: nazariy savolda matn (max 2000), kod savolida kod (max 8000) - server turn.kind ga qarab tekshiradi */
export const answerInterviewBodySchema = z.object({
  answer: z.string().trim().min(1).max(INTERVIEW_CODE_MAX),
});
export type AnswerInterviewBody = z.infer<typeof answerInterviewBodySchema>;

export const interviewParamsSchema = z.object({ sessionId: idSchema });
