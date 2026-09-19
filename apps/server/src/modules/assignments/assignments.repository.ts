import type { AssignmentDifficulty, Prisma, SubmissionStatus } from "@prisma/client";
import type { AssignmentResource } from "@zexn/shared";
import { prisma } from "../../lib/prisma.js";

const assignmentInclude = {
  topic: { select: { id: true, title: true } },
  submissions: { select: { status: true } },
} satisfies Prisma.AssignmentInclude;

type AssignmentRecord = Omit<
  Prisma.AssignmentGetPayload<{ include: typeof assignmentInclude }>,
  "skillId" | "targetStudentId"
> & {
  skillId?: string | null;
  targetStudentId?: string | null;
};

const studentAssignmentInclude = {
  topic: { select: { id: true, title: true } },
  submissions: true,
} satisfies Prisma.AssignmentInclude;

type StudentAssignmentRecord = Omit<
  Prisma.AssignmentGetPayload<{ include: typeof studentAssignmentInclude }>,
  "skillId" | "targetStudentId"
> & {
  skillId?: string | null;
  targetStudentId?: string | null;
};

export function findTopics() {
  return prisma.topic.findMany({
    where: { subject: { isActive: true } },
    orderBy: { order: "asc" },
    select: { id: true, title: true, order: true },
  });
}

export function findActiveTopic(topicId: string) {
  return prisma.topic.findFirst({
    where: { id: topicId, subject: { isActive: true } },
    select: { id: true },
  });
}

export function countActiveStudents(centerId: string) {
  return prisma.membership.count({
    where: { centerId, role: "STUDENT", isActive: true },
  });
}

export function findAssignments(centerId: string) {
  return prisma.assignment.findMany({
    where: { centerId },
    orderBy: { dueAt: "asc" },
    include: assignmentInclude,
  });
}

export async function findAssignment(
  centerId: string,
  assignmentId: string,
): Promise<AssignmentRecord | null> {
  return prisma.assignment.findFirst({
    where: { id: assignmentId, centerId },
    include: assignmentInclude,
  });
}

interface SaveAssignmentInput {
  title: string;
  description: string;
  topicId?: string | null;
  difficulty: AssignmentDifficulty;
  dueAt: Date;
  resources: AssignmentResource[];
}

export async function createAssignment(
  centerId: string,
  createdByUserId: string,
  input: SaveAssignmentInput,
) {
  const created = await prisma.assignment.create({
    data: {
      centerId,
      createdByUserId,
      title: input.title,
      description: input.description,
      topicId: input.topicId ?? null,
      difficulty: input.difficulty,
      dueAt: input.dueAt,
      resources: input.resources,
    },
    select: { id: true },
  });
  return findAssignment(centerId, created.id);
}

export async function updateAssignment(
  centerId: string,
  assignmentId: string,
  input: Partial<SaveAssignmentInput> & { isActive?: boolean },
) {
  const data: Prisma.AssignmentUncheckedUpdateManyInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.topicId !== undefined) data.topicId = input.topicId;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.dueAt !== undefined) data.dueAt = input.dueAt;
  if (input.resources !== undefined) data.resources = input.resources;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  await prisma.assignment.updateMany({ where: { id: assignmentId, centerId }, data });
  return findAssignment(centerId, assignmentId);
}

export async function findManageDetail(centerId: string, assignmentId: string) {
  const assignment = await findAssignment(centerId, assignmentId);
  const [students, submissions] = await Promise.all([
    prisma.membership.findMany({
      where: {
        centerId,
        role: "STUDENT",
        isActive: true,
        ...(assignment?.targetStudentId ? { userId: assignment.targetStudentId } : {}),
      },
      orderBy: { user: { fullName: "asc" } },
      select: { user: { select: { id: true, fullName: true, login: true } } },
    }),
    prisma.assignmentSubmission.findMany({
      where: { centerId, assignmentId },
    }),
  ]);
  return { assignment, students, submissions };
}

export async function findSubmissionContext(
  centerId: string,
  assignmentId: string,
  studentId: string,
) {
  const [assignment, membership, submission] = await Promise.all([
    prisma.assignment.findFirst({
      where: { id: assignmentId, centerId },
      select: { id: true, title: true, topicId: true, skillId: true, targetStudentId: true },
    }),
    prisma.membership.findFirst({
      where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
      select: { user: { select: { id: true, fullName: true, login: true } } },
    }),
    prisma.assignmentSubmission.findFirst({
      where: { centerId, assignmentId, studentId },
    }),
  ]);
  const optionalAssignment: {
    id: string;
    title?: string;
    topicId?: string | null;
    skillId?: string | null;
    targetStudentId?: string | null;
  } | null = assignment;
  return { assignment: optionalAssignment, student: membership?.user ?? null, submission };
}

export function reviewSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
  reviewerId: string,
  input:
    | { decision: "accept"; score: number; feedback: string | null }
    | { decision: "return"; feedback: string },
) {
  return prisma.$transaction(async (transaction) => {
    const reviewedAt = new Date();
    const updated = await transaction.assignmentSubmission.updateMany({
      where: { centerId, assignmentId, studentId, status: "SUBMITTED" },
      data:
        input.decision === "accept"
          ? {
              status: "DONE",
              progress: 100,
              score: input.score,
              feedback: input.feedback,
              reviewedAt,
              reviewedByUserId: reviewerId,
            }
          : {
              status: "IN_PROGRESS",
              score: null,
              feedback: input.feedback,
              reviewedAt,
              reviewedByUserId: reviewerId,
            },
    });
    if (updated.count === 0) return false;

    if (input.decision === "accept") {
      const stats = await transaction.studentStats.findFirst({
        where: { centerId, studentId },
        select: { id: true },
      });
      if (stats) {
        await transaction.studentStats.updateMany({
          where: { id: stats.id, centerId, studentId },
          data: { xp: { increment: 50 } },
        });
      } else {
        await transaction.studentStats.create({
          data: {
            centerId,
            studentId,
            xp: 50,
            streakDays: 0,
            streakRecord: 0,
            lastActiveDate: reviewedAt,
          },
        });
      }
    }
    return true;
  });
}

export async function findStudentAssignments(
  centerId: string,
  studentId: string,
): Promise<StudentAssignmentRecord[]> {
  return prisma.assignment.findMany({
    where: {
      centerId,
      isActive: true,
      OR: [{ targetStudentId: null }, { targetStudentId: studentId }],
    },
    orderBy: { dueAt: "asc" },
    include: {
      ...studentAssignmentInclude,
      submissions: {
        where: { centerId, studentId },
        take: 1,
      },
    },
  });
}

export async function findStudentAssignment(
  centerId: string,
  studentId: string,
  assignmentId: string,
): Promise<StudentAssignmentRecord | null> {
  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      centerId,
      isActive: true,
      OR: [{ targetStudentId: null }, { targetStudentId: studentId }],
    },
    include: {
      ...studentAssignmentInclude,
      submissions: {
        where: { centerId, studentId },
        take: 1,
      },
    },
  });
}

export function findStudentGapTopics(centerId: string, studentId: string) {
  return prisma.knowledgeGap.findMany({
    where: { centerId, studentId },
    select: { topicId: true, rootTopicId: true },
  });
}

export function findStudentStats(centerId: string, studentId: string) {
  return prisma.studentStats.findFirst({
    where: { centerId, studentId },
    select: { streakDays: true },
  });
}

export function findStudentSubmission(centerId: string, assignmentId: string, studentId: string) {
  return prisma.assignmentSubmission.findFirst({
    where: { centerId, assignmentId, studentId },
  });
}

export function createStudentSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
  input?: { status?: SubmissionStatus; content?: string; submittedAt?: Date },
) {
  return prisma.assignmentSubmission.create({
    data: {
      centerId,
      assignmentId,
      studentId,
      status: input?.status ?? "IN_PROGRESS",
      content: input?.content ?? "",
      submittedAt: input?.submittedAt,
    },
  });
}

export function saveStudentSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
  input: { content?: string; progress?: number },
) {
  return prisma.assignmentSubmission.updateMany({
    where: { centerId, assignmentId, studentId, status: "IN_PROGRESS" },
    data: input,
  });
}

export function submitStudentSubmission(
  centerId: string,
  assignmentId: string,
  studentId: string,
  content: string,
  submittedAt: Date,
) {
  return prisma.assignmentSubmission.updateMany({
    where: { centerId, assignmentId, studentId, status: "IN_PROGRESS" },
    data: { status: "SUBMITTED", content, submittedAt },
  });
}
