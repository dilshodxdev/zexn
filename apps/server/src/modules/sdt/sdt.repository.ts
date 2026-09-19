import { Prisma, type SkillHistorySource } from "@prisma/client";
import { SDT_WEIGHTS } from "@zexn/shared";
import { prisma } from "../../lib/prisma.js";
import { applyEvidence, computeConfidence } from "./mastery.js";

export interface DigitalTwinEvidence {
  skillId: string;
  evidence: number;
  targeted: boolean;
  correct?: boolean;
}

export interface UpdateDigitalTwinRecord {
  source: SkillHistorySource;
  label: string;
  sourceAttemptId?: string;
  sourceSubmissionId?: string;
  evidences: DigitalTwinEvidence[];
  detectedPatternCodes: string[];
  cleanSkillIds: string[];
  completeNextStepAssignmentId?: string;
}

type Transaction = Prisma.TransactionClient;

async function recordEvidence(
  transaction: Transaction,
  centerId: string,
  studentId: string,
  input: UpdateDigitalTwinRecord,
  evidence: DigitalTwinEvidence,
  label = input.label,
): Promise<void> {
  const current = await transaction.studentSkill.findFirst({
    where: { centerId, studentId, skillId: evidence.skillId },
  });
  const previousScore = current?.masteryScore ?? SDT_WEIGHTS.priorMastery;
  const attempts = (current?.attempts ?? 0) + 1;
  const newScore = applyEvidence({
    oldMastery: previousScore,
    attempts: current?.attempts ?? 0,
    evidence: evidence.evidence,
    targeted: evidence.targeted,
  });
  const now = new Date();

  if (current) {
    await transaction.studentSkill.updateMany({
      where: { id: current.id, centerId, studentId },
      data: {
        masteryScore: newScore,
        confidence: computeConfidence(attempts),
        attempts,
        correctAttempts: current.correctAttempts + (evidence.correct ? 1 : 0),
        lastActivityAt: now,
      },
    });
  } else {
    await transaction.studentSkill.create({
      data: {
        centerId,
        studentId,
        skillId: evidence.skillId,
        masteryScore: newScore,
        confidence: computeConfidence(attempts),
        attempts,
        correctAttempts: evidence.correct ? 1 : 0,
        lastActivityAt: now,
      },
    });
  }

  await transaction.skillHistory.create({
    data: {
      centerId,
      studentId,
      skillId: evidence.skillId,
      previousScore,
      newScore,
      source: input.source,
      label,
      sourceAttemptId: input.sourceAttemptId,
      sourceSubmissionId: input.sourceSubmissionId,
    },
  });
}

async function generateNextStepsInTransaction(
  transaction: Transaction,
  centerId: string,
  studentId: string,
): Promise<void> {
  const [activePatterns, lowSkills, pending] = await Promise.all([
    transaction.studentPattern.findMany({
      where: { centerId, studentId, status: "ACTIVE" },
      orderBy: { lastDetectedAt: "desc" },
      include: { pattern: { include: { skill: true } } },
    }),
    transaction.studentSkill.findMany({
      where: { centerId, studentId, attempts: { gt: 0 }, masteryScore: { lt: 60 } },
      orderBy: { masteryScore: "asc" },
      include: {
        skill: {
          include: { topic: { include: { materials: { orderBy: { id: "asc" }, take: 1 } } } },
        },
      },
    }),
    transaction.nextStep.findMany({
      where: { centerId, studentId, status: "pending", skillId: { not: null } },
      select: { id: true, skillId: true, actionType: true },
    }),
  ]);
  const pendingSkillIds = new Set(pending.flatMap((item) => (item.skillId ? [item.skillId] : [])));

  for (const studentPattern of activePatterns) {
    const { pattern } = studentPattern;
    const existing = pending.find((item) => item.skillId === pattern.skillId);
    if (existing) {
      if (existing.actionType !== "TARGETED_TASK") {
        await transaction.nextStep.updateMany({
          where: { id: existing.id, centerId, studentId, status: "pending" },
          data: {
            actionType: "TARGETED_TASK",
            priority: 3,
            reason: pattern.description,
            instruction: `"${pattern.skill.name}" bo'yicha 5-10 daqiqalik maqsadli vazifa`,
          },
        });
      }
      continue;
    }
    await transaction.nextStep.create({
      data: {
        centerId,
        studentId,
        topicId: pattern.skill.topicId,
        skillId: pattern.skillId,
        actionType: "TARGETED_TASK",
        priority: 3,
        reason: pattern.description,
        instruction: `"${pattern.skill.name}" bo'yicha 5-10 daqiqalik maqsadli vazifa`,
        status: "pending",
      },
    });
    pendingSkillIds.add(pattern.skillId);
  }

  const lowest = lowSkills.find((item) => !pendingSkillIds.has(item.skillId));
  if (lowest) {
    const material = lowest.skill.topic.materials[0];
    if (material) {
      await transaction.nextStep.create({
        data: {
          centerId,
          studentId,
          topicId: lowest.skill.topicId,
          materialId: material.id,
          skillId: lowest.skillId,
          actionType: "REVIEW_MATERIAL",
          priority: 1,
          reason: `Mastery ${lowest.masteryScore}%`,
          instruction: `"${lowest.skill.topic.title}" materialini takrorlang: ${material.title}`,
          status: "pending",
        },
      });
    }
  }
}

export function generateNextSteps(centerId: string, studentId: string): Promise<void> {
  return prisma.$transaction((transaction) =>
    generateNextStepsInTransaction(transaction, centerId, studentId),
  );
}

export function updateDigitalTwin(
  centerId: string,
  studentId: string,
  input: UpdateDigitalTwinRecord,
): Promise<void> {
  return prisma.$transaction(async (transaction) => {
    for (const evidence of input.evidences) {
      await recordEvidence(transaction, centerId, studentId, input, evidence);
    }

    const patterns = await transaction.errorPattern.findMany({
      where: { code: { in: input.detectedPatternCodes } },
      include: { skill: true },
    });
    const now = new Date();
    for (const pattern of patterns) {
      const current = await transaction.studentPattern.findFirst({
        where: { centerId, studentId, patternId: pattern.id },
      });
      if (current) {
        await transaction.studentPattern.updateMany({
          where: { id: current.id, centerId, studentId },
          data: { occurrences: { increment: 1 }, status: "ACTIVE", lastDetectedAt: now },
        });
      } else {
        await transaction.studentPattern.create({
          data: { centerId, studentId, patternId: pattern.id, occurrences: 1, lastDetectedAt: now },
        });
      }
      await recordEvidence(
        transaction,
        centerId,
        studentId,
        input,
        {
          skillId: pattern.skillId,
          evidence: SDT_WEIGHTS.patternEvidence,
          targeted: false,
          correct: false,
        },
        `Xato: ${pattern.name}`,
      );
    }

    const cleanPatterns = await transaction.studentPattern.findMany({
      where: {
        centerId,
        studentId,
        status: { in: ["ACTIVE", "IMPROVING"] },
        pattern: {
          skillId: { in: input.cleanSkillIds },
          code: { notIn: input.detectedPatternCodes },
        },
      },
    });
    for (const pattern of cleanPatterns) {
      const resolvedCount = pattern.resolvedCount + 1;
      await transaction.studentPattern.updateMany({
        where: { id: pattern.id, centerId, studentId },
        data: {
          resolvedCount,
          status: resolvedCount >= pattern.occurrences ? "RESOLVED" : "IMPROVING",
        },
      });
    }

    if (input.completeNextStepAssignmentId) {
      await transaction.nextStep.updateMany({
        where: {
          centerId,
          studentId,
          assignmentId: input.completeNextStepAssignmentId,
          status: "pending",
        },
        data: { status: "done", doneAt: now },
      });
    }

    await generateNextStepsInTransaction(transaction, centerId, studentId);
  });
}

export function findStudent(centerId: string, studentId: string) {
  return prisma.membership.findFirst({
    where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
    select: { user: { select: { id: true, fullName: true, login: true } } },
  });
}

export function findActiveCourse() {
  return prisma.subject.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
    select: { id: true, title: true },
  });
}

export function findSkills(centerId: string, studentId: string, subjectId: string) {
  return prisma.skill.findMany({
    where: { topic: { subjectId } },
    orderBy: { order: "asc" },
    include: {
      topic: { select: { id: true, title: true } },
      studentSkills: { where: { centerId, studentId }, take: 1 },
    },
  });
}

export function findStudentPatterns(centerId: string, studentId: string) {
  return prisma.studentPattern.findMany({
    where: { centerId, studentId },
    orderBy: { lastDetectedAt: "desc" },
    include: { pattern: { include: { skill: true } } },
  });
}

export function findPendingNextSteps(centerId: string, studentId: string) {
  return prisma.nextStep.findMany({
    where: { centerId, studentId, status: "pending", skillId: { not: null } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { skill: true },
  });
}

export function findRecentProgress(centerId: string, studentId: string) {
  return prisma.skillHistory.findMany({
    where: { centerId, studentId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { skill: true },
  });
}

export function findProgress(centerId: string, studentId: string) {
  return prisma.skill.findMany({
    orderBy: { order: "asc" },
    include: {
      histories: {
        where: { centerId, studentId },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
}

export function findSkillsByTopicIds(topicIds: string[]) {
  return prisma.skill.findMany({
    where: { topicId: { in: topicIds } },
    include: { topic: true },
  });
}

export function findSkillsByIds(skillIds: string[]) {
  return prisma.skill.findMany({
    where: { id: { in: skillIds } },
    include: { topic: true },
  });
}

export function findPatternSkills(codes: string[]) {
  return prisma.errorPattern.findMany({
    where: { code: { in: codes } },
    select: { code: true, skillId: true },
  });
}

export function findAssignment(centerId: string, assignmentId: string) {
  return prisma.assignment.findFirst({
    where: { centerId, id: assignmentId },
    select: {
      id: true,
      title: true,
      topicId: true,
      skillId: true,
      targetStudentId: true,
    },
  });
}

export async function findClassDigitalTwinData(centerId: string) {
  const memberships = await prisma.membership.findMany({
    where: { centerId, role: "STUDENT", isActive: true },
    orderBy: { user: { fullName: "asc" } },
    select: { user: { select: { id: true, fullName: true, login: true } } },
  });
  const studentIds = memberships.map((membership) => membership.user.id);
  const [studentSkills, studentPatterns] = await Promise.all([
    prisma.studentSkill.findMany({
      where: { centerId, studentId: { in: studentIds } },
      include: { skill: true },
    }),
    prisma.studentPattern.findMany({
      where: { centerId, studentId: { in: studentIds } },
      include: { pattern: { include: { skill: true } } },
    }),
  ]);
  return { memberships, studentSkills, studentPatterns };
}

export function createManualNextStep(
  centerId: string,
  studentId: string,
  input: {
    skillId: string;
    actionType: "TARGETED_TASK" | "RETEST" | "REVIEW_MATERIAL";
    reason: string;
  },
) {
  return prisma.$transaction(async (transaction) => {
    const [membership, skill, pending] = await Promise.all([
      transaction.membership.findFirst({
        where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
        select: { id: true },
      }),
      transaction.skill.findFirst({
        where: { id: input.skillId },
        include: {
          topic: { include: { materials: { orderBy: { id: "asc" }, take: 1 } } },
        },
      }),
      transaction.nextStep.findFirst({
        where: {
          centerId,
          studentId,
          skillId: input.skillId,
          actionType: input.actionType,
          status: "pending",
        },
        select: { id: true },
      }),
    ]);
    if (!membership) return { kind: "student_not_found" } as const;
    if (!skill) return { kind: "skill_not_found" } as const;
    if (pending) return { kind: "conflict" } as const;

    const material = skill.topic.materials[0];
    const instruction =
      input.actionType === "RETEST"
        ? `"${skill.topic.title}" testini qayta topshiring`
        : input.actionType === "REVIEW_MATERIAL"
          ? `"${skill.topic.title}" materialini takrorlang: ${material?.title ?? skill.topic.title}`
          : `"${skill.name}" bo'yicha 5-10 daqiqalik maqsadli vazifa`;
    await transaction.nextStep.create({
      data: {
        centerId,
        studentId,
        topicId: skill.topicId,
        materialId: material?.id,
        skillId: skill.id,
        actionType: input.actionType,
        priority: 2,
        reason: input.reason,
        instruction,
        status: "pending",
      },
    });
    return { kind: "created" } as const;
  });
}

export function assignNextStep(
  centerId: string,
  studentId: string,
  nextStepId: string,
  createdByUserId: string,
  dueInDays: number,
) {
  return prisma.$transaction(async (transaction) => {
    const [membership, nextStep] = await Promise.all([
      transaction.membership.findFirst({
        where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
        select: { id: true },
      }),
      transaction.nextStep.findFirst({
        where: { id: nextStepId, centerId, studentId, status: "pending", skillId: { not: null } },
        include: {
          skill: {
            include: {
              topic: { include: { materials: { orderBy: { id: "asc" }, take: 3 } } },
            },
          },
        },
      }),
    ]);
    if (!membership || !nextStep?.skill) return { kind: "not_found" } as const;
    if (nextStep.assignmentId) return { kind: "conflict" } as const;

    const dueAt = new Date();
    dueAt.setUTCDate(dueAt.getUTCDate() + dueInDays);
    const assignment = await transaction.assignment.create({
      data: {
        centerId,
        createdByUserId,
        topicId: nextStep.skill.topicId,
        skillId: nextStep.skillId,
        targetStudentId: studentId,
        title: nextStep.skill.remediationTitle,
        description: nextStep.skill.remediationDescription,
        difficulty: "EASY",
        dueAt,
        resources: nextStep.skill.topic.materials.map((material) => ({
          title: material.title,
          url: material.url,
        })),
        isActive: true,
      },
      select: { id: true },
    });
    const updated = await transaction.nextStep.updateMany({
      where: {
        id: nextStep.id,
        centerId,
        studentId,
        status: "pending",
        assignmentId: null,
      },
      data: { assignmentId: assignment.id },
    });
    if (updated.count === 0) return { kind: "conflict" } as const;
    return { kind: "assigned", assignmentId: assignment.id } as const;
  });
}

export function createTeacherNote(centerId: string, studentId: string, text: string) {
  return prisma.$transaction(async (transaction) => {
    const membership = await transaction.membership.findFirst({
      where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
      select: { id: true },
    });
    if (!membership) return false;
    await transaction.mentorMessage.create({
      data: { centerId, studentId, role: "teacher", text },
    });
    return true;
  });
}
