import { prisma } from "../../lib/prisma.js";

export function findAttemptTest(testId: string) {
  return prisma.test.findFirst({
    where: { id: testId, isActive: true, topic: { subject: { isActive: true } } },
    include: {
      topic: {
        include: {
          materials: { orderBy: { id: "asc" }, take: 1 },
          prerequisites: {
            select: {
              prerequisiteId: true,
              prerequisite: {
                select: {
                  id: true,
                  title: true,
                  materials: { orderBy: { id: "asc" }, take: 1 },
                },
              },
            },
          },
        },
      },
      testQuestions: {
        orderBy: { order: "asc" },
        include: {
          question: {
            select: { id: true, topicId: true, text: true, options: true, correctOptionId: true },
          },
        },
      },
    },
  });
}

export function findPrerequisiteAttempts(centerId: string, studentId: string, topicIds: string[]) {
  return prisma.testAttempt.findMany({
    where: {
      centerId,
      studentId,
      finishedAt: { not: null },
      test: { topicId: { in: topicIds } },
    },
    orderBy: { finishedAt: "desc" },
    select: { score: true, test: { select: { topicId: true } } },
  });
}

export function findStats(centerId: string, studentId: string) {
  return prisma.studentStats.findFirst({ where: { centerId, studentId } });
}

export interface PersistAttemptInput {
  centerId: string;
  studentId: string;
  testId: string;
  topicId: string;
  score: number;
  correct: number;
  total: number;
  xpEarned: number;
  answers: Array<{ questionId: string; optionId: string; isCorrect: boolean }>;
  gap: {
    rootTopicId: string | null;
    confidence: number;
    explanation: string | null;
  } | null;
  nextStep: {
    materialId: string | null;
    instruction: string;
  } | null;
  stats: {
    xp: number;
    streakDays: number;
    streakRecord: number;
    lastActiveDate: Date;
  };
}

export function persistAttempt(input: PersistAttemptInput) {
  return prisma.$transaction(async (transaction) => {
    const attempt = await transaction.testAttempt.create({
      data: {
        centerId: input.centerId,
        studentId: input.studentId,
        testId: input.testId,
        score: input.score,
        correct: input.correct,
        total: input.total,
        finishedAt: input.stats.lastActiveDate,
      },
    });

    await transaction.answer.createMany({
      data: input.answers.map((answer) => ({
        attemptId: attempt.id,
        questionId: answer.questionId,
        optionId: answer.optionId,
        isCorrect: answer.isCorrect,
      })),
    });

    await transaction.nextStep.deleteMany({
      where: {
        centerId: input.centerId,
        studentId: input.studentId,
        topicId: input.topicId,
        status: "pending",
      },
    });

    const gap = input.gap
      ? await transaction.knowledgeGap.create({
          data: {
            centerId: input.centerId,
            studentId: input.studentId,
            topicId: input.topicId,
            rootTopicId: input.gap.rootTopicId,
            confidence: input.gap.confidence,
            explanation: input.gap.explanation,
          },
        })
      : null;

    const nextStep = input.nextStep
      ? await transaction.nextStep.create({
          data: {
            centerId: input.centerId,
            studentId: input.studentId,
            topicId: input.topicId,
            gapId: gap?.id ?? null,
            materialId: input.nextStep.materialId,
            instruction: input.nextStep.instruction,
            status: "pending",
          },
        })
      : null;

    const existingStats = await transaction.studentStats.findFirst({
      where: { centerId: input.centerId, studentId: input.studentId },
      select: { id: true },
    });
    if (existingStats) {
      await transaction.studentStats.update({
        where: { id: existingStats.id },
        data: input.stats,
      });
    } else {
      await transaction.studentStats.create({
        data: {
          centerId: input.centerId,
          studentId: input.studentId,
          ...input.stats,
        },
      });
    }

    return { attempt, gap, nextStep };
  });
}
