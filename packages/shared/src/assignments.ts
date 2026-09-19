import { z } from "zod";
import { idSchema } from "./common.js";

/**
 * Vazifalar (assignments). Ikki tomon:
 *   - boshqaruv: /api/assignments/*          (rol TEACHER yoki CENTER_ADMIN, tenant ichida)
 *   - o'quvchi:  /api/student/assignments/*  (rol STUDENT)
 * Holat oqimi: NEW -> IN_PROGRESS -> SUBMITTED -> DONE; qaytarilsa SUBMITTED -> IN_PROGRESS.
 * NEW - DB'da qator yo'q (virtual): server ro'yxatda o'zi to'ldiradi.
 */

export const ASSIGNMENT_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const assignmentDifficultySchema = z.enum(ASSIGNMENT_DIFFICULTIES);
export type AssignmentDifficulty = z.infer<typeof assignmentDifficultySchema>;

export const SUBMISSION_STATUSES = ["NEW", "IN_PROGRESS", "SUBMITTED", "DONE"] as const;
export const submissionStatusSchema = z.enum(SUBMISSION_STATUSES);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

/** Vazifaga biriktirilgan havola (fayl yuklash yo'q, faqat URL). */
export const assignmentResourceSchema = z.object({
  title: z.string().trim().min(1).max(120),
  url: z.string().trim().url(),
});
export type AssignmentResource = z.infer<typeof assignmentResourceSchema>;

/** ISO 8601 sana (server UTC saqlaydi, UI Asia/Tashkent). */
const isoDateSchema = z.string().datetime({ offset: true });

/* ---------- Boshqaruv (TEACHER | CENTER_ADMIN) ---------- */

/** GET /api/assignments/topics - forma Select uchun faol kurs mavzulari */
export const assignmentTopicSchema = z.object({
  id: idSchema,
  title: z.string(),
  order: z.number().int(),
});
export type AssignmentTopic = z.infer<typeof assignmentTopicSchema>;

/** POST /api/assignments */
export const createAssignmentBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(1).max(4000),
  topicId: idSchema.nullable().optional(),
  difficulty: assignmentDifficultySchema,
  dueAt: isoDateSchema,
  resources: z.array(assignmentResourceSchema).max(10).default([]),
});
export type CreateAssignmentBody = z.infer<typeof createAssignmentBodySchema>;

/** PATCH /api/assignments/:assignmentId - o'chirish yo'q, faqat isActive=false */
export const updateAssignmentBodySchema = createAssignmentBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateAssignmentBody = z.infer<typeof updateAssignmentBodySchema>;

const assignmentTopicRefSchema = z.object({ id: idSchema, title: z.string() }).nullable();

/** GET /api/assignments (ro'yxat elementi), POST/PATCH javobi */
export const assignmentManageItemSchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  topic: assignmentTopicRefSchema,
  difficulty: assignmentDifficultySchema,
  dueAt: z.string(),
  resources: z.array(assignmentResourceSchema),
  isActive: z.boolean(),
  /** Markazdagi faol STUDENT soni (vazifa hammaga) */
  studentCount: z.number().int(),
  inProgressCount: z.number().int(),
  submittedCount: z.number().int(),
  doneCount: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AssignmentManageItem = z.infer<typeof assignmentManageItemSchema>;

/** Detail jadvalidagi bir o'quvchi qatori. Submission yo'q bo'lsa status NEW, qolgani null/0. */
export const submissionRowSchema = z.object({
  studentId: idSchema,
  fullName: z.string(),
  login: z.string(),
  status: submissionStatusSchema,
  progress: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100).nullable(),
  submittedAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});
export type SubmissionRow = z.infer<typeof submissionRowSchema>;

/** GET /api/assignments/:assignmentId */
export const assignmentManageDetailSchema = z.object({
  assignment: assignmentManageItemSchema,
  submissions: z.array(submissionRowSchema),
});
export type AssignmentManageDetail = z.infer<typeof assignmentManageDetailSchema>;

/** GET /api/assignments/:assignmentId/submissions/:studentId, review javobi */
export const submissionDetailSchema = submissionRowSchema.extend({
  content: z.string(),
  feedback: z.string().nullable(),
  reviewedAt: z.string().nullable(),
});
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;

/**
 * POST .../submissions/:studentId/review
 * Discriminated union: `decision` qolgan maydonlar shaklini belgilaydi.
 * accept -> score majburiy; return -> feedback majburiy (o'quvchi nimani tuzatishini bilsin).
 */
export const reviewSubmissionBodySchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("accept"),
    score: z.number().int().min(0).max(100),
    feedback: z.string().trim().max(2000).optional(),
  }),
  z.object({
    decision: z.literal("return"),
    feedback: z.string().trim().min(1).max(2000),
  }),
]);
export type ReviewSubmissionBody = z.infer<typeof reviewSubmissionBodySchema>;

/* ---------- O'quvchi (STUDENT) ---------- */

/** Ro'yxat elementi (screenshot qatori). Faqat isActive vazifalar. */
export const studentAssignmentItemSchema = z.object({
  id: idSchema,
  title: z.string(),
  description: z.string(),
  topic: assignmentTopicRefSchema,
  difficulty: assignmentDifficultySchema,
  dueAt: z.string(),
  resourcesCount: z.number().int(),
  status: submissionStatusSchema,
  progress: z.number().int().min(0).max(100),
  score: z.number().int().min(0).max(100).nullable(),
  /** Vazifa mavzusi o'quvchining KnowledgeGap'ida bo'lsa true ("AI tomonidan tavsiya") */
  isAiRecommended: z.boolean(),
  updatedAt: z.string().nullable(),
});
export type StudentAssignmentItem = z.infer<typeof studentAssignmentItemSchema>;

/** GET /api/student/assignments - stat kartalar ro'yxatdan hisoblanadi, faqat streak serverdan */
export const studentAssignmentsResponseSchema = z.object({
  streakDays: z.number().int(),
  items: z.array(studentAssignmentItemSchema),
});
export type StudentAssignmentsResponse = z.infer<typeof studentAssignmentsResponseSchema>;

/** GET /api/student/assignments/:assignmentId, start / PATCH / submit javobi */
export const studentAssignmentDetailSchema = studentAssignmentItemSchema.extend({
  resources: z.array(assignmentResourceSchema),
  submission: z
    .object({
      content: z.string(),
      feedback: z.string().nullable(),
      submittedAt: z.string().nullable(),
      reviewedAt: z.string().nullable(),
    })
    .nullable(),
});
export type StudentAssignmentDetail = z.infer<typeof studentAssignmentDetailSchema>;

/** PATCH /api/student/assignments/:assignmentId/submission - faqat IN_PROGRESS; kamida bir maydon */
export const saveSubmissionBodySchema = z
  .object({
    content: z.string().max(8000).optional(),
    progress: z.number().int().min(0).max(100).optional(),
  })
  .refine((b) => b.content !== undefined || b.progress !== undefined, {
    message: "content yoki progress kerak",
  });
export type SaveSubmissionBody = z.infer<typeof saveSubmissionBodySchema>;

/** POST /api/student/assignments/:assignmentId/submit */
export const submitAssignmentBodySchema = z.object({
  content: z.string().trim().min(1).max(8000),
});
export type SubmitAssignmentBody = z.infer<typeof submitAssignmentBodySchema>;

/** Route params: validate({ params: assignmentParamsSchema }) */
export const assignmentParamsSchema = z.object({ assignmentId: idSchema });
export const submissionParamsSchema = z.object({ assignmentId: idSchema, studentId: idSchema });
