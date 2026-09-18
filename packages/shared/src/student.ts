import { z } from "zod";
import { idSchema } from "./common.js";

/**
 * O'quvchi workspace: /api/student/*  (rol STUDENT, tenant ichida).
 * Stitch "workspace" ekrani: chap - mavzular (bilim xaritasi), o'rta - AI mentor, o'ng - panel + reyting.
 */

/** Mavzu holati bilim xaritasida */
export const topicStatusSchema = z.enum(["done", "current", "weak", "locked"]);
export type TopicStatus = z.infer<typeof topicStatusSchema>;

export const topicNodeSchema = z.object({
  id: idSchema,
  title: z.string(),
  order: z.number().int(),
  status: topicStatusSchema,
  /** 0..100, to'g'ri javoblar foizi (urinish bo'lmasa null) */
  mastery: z.number().min(0).max(100).nullable(),
  prerequisiteIds: z.array(idSchema),
});
export type TopicNode = z.infer<typeof topicNodeSchema>;

export const nextStepSchema = z.object({
  id: idSchema,
  topicId: idSchema,
  topicTitle: z.string(),
  /** Ildiz sababi bo'lgan prerequisite mavzu (bo'lsa) */
  rootTopicId: idSchema.nullable(),
  rootTopicTitle: z.string().nullable(),
  instruction: z.string(),
  material: z
    .object({ id: idSchema, title: z.string(), url: z.string(), kind: z.string() })
    .nullable(),
  status: z.enum(["pending", "done"]),
  createdAt: z.string(),
});
export type NextStep = z.infer<typeof nextStepSchema>;

export const studentStatsSchema = z.object({
  xp: z.number().int(),
  levelXp: z.number().int(),
  streakDays: z.number().int(),
  streakRecord: z.number().int(),
  achievementsEarned: z.number().int(),
  achievementsTotal: z.number().int(),
});
export type StudentStats = z.infer<typeof studentStatsSchema>;

export const ratingItemSchema = z.object({
  userId: idSchema,
  fullName: z.string(),
  xp: z.number().int(),
  rank: z.number().int(),
  isMe: z.boolean(),
});

/** GET /api/student/overview */
export const studentOverviewSchema = z.object({
  student: z.object({ id: idSchema, fullName: z.string(), hasTelegram: z.boolean() }),
  course: z.object({
    id: idSchema,
    title: z.string(),
    topics: z.array(topicNodeSchema),
    completedCount: z.number().int(),
    totalCount: z.number().int(),
  }),
  nextStep: nextStepSchema.nullable(),
  stats: studentStatsSchema,
  rating: z.array(ratingItemSchema),
});
export type StudentOverview = z.infer<typeof studentOverviewSchema>;

/** GET /api/student/topics/:topicId */
export const topicDetailSchema = z.object({
  topic: topicNodeSchema,
  description: z.string(),
  materials: z.array(
    z.object({ id: idSchema, title: z.string(), url: z.string(), kind: z.string() }),
  ),
  gap: z
    .object({
      rootTopicId: idSchema.nullable(),
      rootTopicTitle: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      explanation: z.string().nullable(),
    })
    .nullable(),
  availableTestId: idSchema.nullable(),
});
export type TopicDetail = z.infer<typeof topicDetailSchema>;

/** GET /api/student/tests - tayinlangan/ochiq testlar */
export const testListItemSchema = z.object({
  id: idSchema,
  title: z.string(),
  topicId: idSchema,
  topicTitle: z.string(),
  questionCount: z.number().int(),
  status: z.enum(["available", "completed"]),
  lastScore: z.number().min(0).max(100).nullable(),
});
export type TestListItem = z.infer<typeof testListItemSchema>;

/** GET /api/student/tests/:testId - savollar TO'G'RI JAVOBSIZ */
export const testDetailSchema = z.object({
  id: idSchema,
  title: z.string(),
  topicId: idSchema,
  questions: z.array(
    z.object({
      id: idSchema,
      text: z.string(),
      options: z.array(z.object({ id: z.string(), text: z.string() })).min(2),
    }),
  ),
});
export type TestDetail = z.infer<typeof testDetailSchema>;

/** POST /api/student/tests/:testId/attempts */
export const submitAttemptBodySchema = z.object({
  answers: z.array(z.object({ questionId: idSchema, optionId: z.string() })).min(1),
});
export type SubmitAttemptBody = z.infer<typeof submitAttemptBodySchema>;

export const attemptResultSchema = z.object({
  attemptId: idSchema,
  score: z.number().min(0).max(100),
  correct: z.number().int(),
  total: z.number().int(),
  xpEarned: z.number().int(),
  gaps: z.array(
    z.object({
      topicId: idSchema,
      topicTitle: z.string(),
      rootTopicId: idSchema.nullable(),
      rootTopicTitle: z.string().nullable(),
      confidence: z.number().min(0).max(1),
      explanation: z.string().nullable(),
    }),
  ),
  nextSteps: z.array(nextStepSchema),
});
export type AttemptResult = z.infer<typeof attemptResultSchema>;

/** POST /api/student/next-steps/:id/done */
export const nextStepDoneResponseSchema = z.object({ nextStep: nextStepSchema });

/** Mentor chat: GET /api/student/mentor/messages?limit=, POST /api/student/mentor/messages */
export const mentorMessageSchema = z.object({
  id: idSchema,
  role: z.enum(["student", "mentor"]),
  text: z.string(),
  createdAt: z.string(),
});
export type MentorMessage = z.infer<typeof mentorMessageSchema>;

export const sendMentorMessageBodySchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
export type SendMentorMessageBody = z.infer<typeof sendMentorMessageBodySchema>;

export const sendMentorMessageResponseSchema = z.object({
  student: mentorMessageSchema,
  mentor: mentorMessageSchema,
});
