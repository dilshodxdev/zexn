import {
  API_ERROR_CODES,
  assignmentResourceSchema,
  type AssignmentManageDetail,
  type AssignmentManageItem,
  type AssignmentTopic,
  type CreateAssignmentBody,
  type ReviewSubmissionBody,
  type SaveSubmissionBody,
  type StudentAssignmentDetail,
  type StudentAssignmentItem,
  type StudentAssignmentsResponse,
  type SubmissionDetail,
  type SubmissionRow,
  type SubmitAssignmentBody,
  type UpdateAssignmentBody,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import * as assignmentRepository from "./assignments.repository.js";

type AssignmentRecord = NonNullable<
  Awaited<ReturnType<typeof assignmentRepository.findAssignment>>
>;
type StudentAssignmentRecord = NonNullable<
  Awaited<ReturnType<typeof assignmentRepository.findStudentAssignment>>
>;
type SubmissionRecord = Awaited<ReturnType<typeof assignmentRepository.findStudentSubmission>>;

function parseResources(value: unknown) {
  const parsed = assignmentResourceSchema.array().safeParse(value);
  if (!parsed.success) {
    throw new AppError(500, "Vazifa resurslari yaroqsiz", API_ERROR_CODES.INTERNAL_ERROR);
  }
  return parsed.data;
}

function mapManageItem(assignment: AssignmentRecord, studentCount: number): AssignmentManageItem {
  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    topic: assignment.topic,
    difficulty: assignment.difficulty,
    dueAt: assignment.dueAt.toISOString(),
    resources: parseResources(assignment.resources),
    isActive: assignment.isActive,
    studentCount: assignment.targetStudentId ? 1 : studentCount,
    inProgressCount: assignment.submissions.filter((item) => item.status === "IN_PROGRESS").length,
    submittedCount: assignment.submissions.filter((item) => item.status === "SUBMITTED").length,
    doneCount: assignment.submissions.filter((item) => item.status === "DONE").length,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  };
}

function mapSubmissionRow(
  student: { id: string; fullName: string; login: string },
  submission: SubmissionRecord,
): SubmissionRow {
  return {
    studentId: student.id,
    fullName: student.fullName,
    login: student.login,
    status: submission?.status ?? "NEW",
    progress: submission?.progress ?? 0,
    score: submission?.score ?? null,
    submittedAt: submission?.submittedAt?.toISOString() ?? null,
    updatedAt: submission?.updatedAt.toISOString() ?? null,
  };
}

function mapSubmissionDetail(
  student: { id: string; fullName: string; login: string },
  submission: SubmissionRecord,
): SubmissionDetail {
  return {
    ...mapSubmissionRow(student, submission),
    content: submission?.content ?? "",
    feedback: submission?.feedback ?? null,
    reviewedAt: submission?.reviewedAt?.toISOString() ?? null,
  };
}

function conflict(message: string): never {
  throw new AppError(409, message, API_ERROR_CODES.CONFLICT);
}

async function requireActiveTopic(topicId: string | null | undefined): Promise<void> {
  if (topicId && !(await assignmentRepository.findActiveTopic(topicId))) {
    throw new AppError(400, "Faol mavzu topilmadi", API_ERROR_CODES.VALIDATION_ERROR);
  }
}

export async function getTopics(): Promise<AssignmentTopic[]> {
  return assignmentRepository.findTopics();
}

export async function getAssignments(centerId: string): Promise<AssignmentManageItem[]> {
  const [assignments, studentCount] = await Promise.all([
    assignmentRepository.findAssignments(centerId),
    assignmentRepository.countActiveStudents(centerId),
  ]);
  return assignments.map((assignment) => mapManageItem(assignment, studentCount));
}

export async function createAssignment(
  centerId: string,
  createdByUserId: string,
  body: CreateAssignmentBody,
): Promise<AssignmentManageItem> {
  await requireActiveTopic(body.topicId);
  const assignment = await assignmentRepository.createAssignment(centerId, createdByUserId, {
    ...body,
    topicId: body.topicId ?? null,
    dueAt: new Date(body.dueAt),
  });
  if (!assignment) {
    throw new AppError(500, "Vazifa yaratilmadi", API_ERROR_CODES.INTERNAL_ERROR);
  }
  return mapManageItem(assignment, await assignmentRepository.countActiveStudents(centerId));
}

export async function updateAssignment(
  centerId: string,
  assignmentId: string,
  body: UpdateAssignmentBody,
): Promise<AssignmentManageItem> {
  const existing = await assignmentRepository.findAssignment(centerId, assignmentId);
  if (!existing) {
    throw new AppError(404, "Vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  await requireActiveTopic(body.topicId);
  const { dueAt, ...changes } = body;
  const assignment = await assignmentRepository.updateAssignment(centerId, assignmentId, {
    ...changes,
    ...(dueAt !== undefined ? { dueAt: new Date(dueAt) } : {}),
  });
  if (!assignment) {
    throw new AppError(404, "Vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return mapManageItem(assignment, await assignmentRepository.countActiveStudents(centerId));
}

export async function getManageDetail(
  centerId: string,
  assignmentId: string,
): Promise<AssignmentManageDetail> {
  const { assignment, students, submissions } = await assignmentRepository.findManageDetail(
    centerId,
    assignmentId,
  );
  if (!assignment) {
    throw new AppError(404, "Vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const byStudent = new Map(submissions.map((submission) => [submission.studentId, submission]));
  const rows = students.map(({ user }) => mapSubmissionRow(user, byStudent.get(user.id) ?? null));
  rows.sort((left, right) => {
    const leftPriority = left.status === "SUBMITTED" ? 0 : 1;
    const rightPriority = right.status === "SUBMITTED" ? 0 : 1;
    return leftPriority - rightPriority || left.fullName.localeCompare(right.fullName, "uz");
  });
  return {
    assignment: mapManageItem(assignment, students.length),
    submissions: rows,
  };
}

export async function getSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
): Promise<SubmissionDetail> {
  const context = await assignmentRepository.findSubmissionContext(
    centerId,
    assignmentId,
    studentId,
  );
  if (!context.assignment || !context.student) {
    throw new AppError(404, "Vazifa yoki o'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return mapSubmissionDetail(context.student, context.submission);
}

export async function reviewSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
  reviewerId: string,
  body: ReviewSubmissionBody,
): Promise<SubmissionDetail> {
  const context = await assignmentRepository.findSubmissionContext(
    centerId,
    assignmentId,
    studentId,
  );
  if (!context.assignment || !context.student) {
    throw new AppError(404, "Vazifa yoki o'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (context.submission?.status !== "SUBMITTED") {
    conflict("Faqat topshirilgan vazifani tekshirish mumkin");
  }
  const updated = await assignmentRepository.reviewSubmission(
    centerId,
    assignmentId,
    studentId,
    reviewerId,
    body.decision === "accept"
      ? {
          decision: "accept",
          score: body.score,
          feedback: body.feedback ?? null,
        }
      : { decision: "return", feedback: body.feedback },
  );
  if (!updated) conflict("Vazifa holati allaqachon o'zgargan");
  if (body.decision === "accept") {
    const { onSubmissionReviewed } = await import("../sdt/sdt.service.js");
    await onSubmissionReviewed(centerId, studentId, {
      submissionId: context.submission.id,
      assignmentId,
      content: context.submission.content,
      score: body.score,
      skillId: context.assignment.skillId ?? null,
      topicId: context.assignment.topicId ?? null,
      targeted: context.assignment.targetStudentId === studentId && !!context.assignment.skillId,
    });
  }
  return getSubmission(centerId, assignmentId, studentId);
}

function recommendationTopicIds(
  gaps: Array<{ topicId: string; rootTopicId: string | null }>,
): Set<string> {
  return new Set(
    gaps.flatMap((gap) => [gap.topicId, ...(gap.rootTopicId ? [gap.rootTopicId] : [])]),
  );
}

function mapStudentItem(
  assignment: StudentAssignmentRecord,
  recommendedTopicIds: Set<string>,
): StudentAssignmentItem {
  const submission = assignment.submissions[0] ?? null;
  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    topic: assignment.topic,
    difficulty: assignment.difficulty,
    dueAt: assignment.dueAt.toISOString(),
    resourcesCount: parseResources(assignment.resources).length,
    status: submission?.status ?? "NEW",
    progress: submission?.progress ?? 0,
    score: submission?.score ?? null,
    isAiRecommended: assignment.topicId ? recommendedTopicIds.has(assignment.topicId) : false,
    updatedAt: submission?.updatedAt.toISOString() ?? null,
  };
}

function mapStudentDetail(
  assignment: StudentAssignmentRecord,
  recommendedTopicIds: Set<string>,
): StudentAssignmentDetail {
  const submission = assignment.submissions[0] ?? null;
  return {
    ...mapStudentItem(assignment, recommendedTopicIds),
    resources: parseResources(assignment.resources),
    submission: submission
      ? {
          content: submission.content,
          feedback: submission.feedback,
          submittedAt: submission.submittedAt?.toISOString() ?? null,
          reviewedAt: submission.reviewedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export async function getStudentAssignments(
  centerId: string,
  studentId: string,
): Promise<StudentAssignmentsResponse> {
  const [assignments, gaps, stats] = await Promise.all([
    assignmentRepository.findStudentAssignments(centerId, studentId),
    assignmentRepository.findStudentGapTopics(centerId, studentId),
    assignmentRepository.findStudentStats(centerId, studentId),
  ]);
  const recommended = recommendationTopicIds(gaps);
  return {
    streakDays: stats?.streakDays ?? 0,
    items: assignments.map((assignment) => mapStudentItem(assignment, recommended)),
  };
}

export async function getStudentDetail(
  centerId: string,
  studentId: string,
  assignmentId: string,
): Promise<StudentAssignmentDetail> {
  const [assignment, gaps] = await Promise.all([
    assignmentRepository.findStudentAssignment(centerId, studentId, assignmentId),
    assignmentRepository.findStudentGapTopics(centerId, studentId),
  ]);
  if (!assignment) {
    throw new AppError(404, "Faol vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return mapStudentDetail(assignment, recommendationTopicIds(gaps));
}

export async function startAssignment(
  centerId: string,
  studentId: string,
  assignmentId: string,
): Promise<StudentAssignmentDetail> {
  const assignment = await assignmentRepository.findStudentAssignment(
    centerId,
    studentId,
    assignmentId,
  );
  if (!assignment) {
    throw new AppError(404, "Faol vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const submission = assignment.submissions[0];
  if (!submission) {
    await assignmentRepository.createStudentSubmission(centerId, assignmentId, studentId);
  }
  return getStudentDetail(centerId, studentId, assignmentId);
}

export async function saveSubmission(
  centerId: string,
  studentId: string,
  assignmentId: string,
  body: SaveSubmissionBody,
): Promise<StudentAssignmentDetail> {
  const assignment = await assignmentRepository.findStudentAssignment(
    centerId,
    studentId,
    assignmentId,
  );
  if (!assignment) {
    throw new AppError(404, "Faol vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const result = await assignmentRepository.saveStudentSubmission(
    centerId,
    assignmentId,
    studentId,
    body,
  );
  if (result.count === 0) conflict("Faqat jarayondagi vazifani saqlash mumkin");
  return getStudentDetail(centerId, studentId, assignmentId);
}

export async function submitAssignment(
  centerId: string,
  studentId: string,
  assignmentId: string,
  body: SubmitAssignmentBody,
): Promise<StudentAssignmentDetail> {
  const assignment = await assignmentRepository.findStudentAssignment(
    centerId,
    studentId,
    assignmentId,
  );
  if (!assignment) {
    throw new AppError(404, "Faol vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const submission = assignment.submissions[0];
  const submittedAt = new Date();
  let submissionId: string;
  if (!submission) {
    const created = await assignmentRepository.createStudentSubmission(
      centerId,
      assignmentId,
      studentId,
      {
        status: "SUBMITTED",
        content: body.content,
        submittedAt,
      },
    );
    submissionId = created.id;
  } else {
    if (submission.status !== "IN_PROGRESS") {
      conflict("Vazifa allaqachon topshirilgan yoki yakunlangan");
    }
    const result = await assignmentRepository.submitStudentSubmission(
      centerId,
      assignmentId,
      studentId,
      body.content,
      submittedAt,
    );
    if (result.count === 0) conflict("Vazifa holati allaqachon o'zgargan");
    submissionId = submission.id;
  }
  const { onSubmissionSubmitted } = await import("../sdt/sdt.service.js");
  await onSubmissionSubmitted(centerId, studentId, {
    submissionId,
    assignmentId,
    content: body.content,
    skillId: assignment.skillId ?? null,
    topicId: assignment.topicId,
  });
  return getStudentDetail(centerId, studentId, assignmentId);
}
