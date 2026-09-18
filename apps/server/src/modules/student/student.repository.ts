import { prisma } from "../../lib/prisma.js";

export function findStudent(studentId: string) {
  return prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, fullName: true, login: true, telegramId: true },
  });
}

export function findActiveCourse(centerId: string, studentId: string) {
  return prisma.subject.findFirst({
    where: { isActive: true },
    orderBy: { id: "asc" },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          prerequisites: { select: { prerequisiteId: true } },
          materials: { orderBy: { id: "asc" } },
          tests: {
            where: { isActive: true },
            select: {
              id: true,
              attempts: {
                where: { centerId, studentId, finishedAt: { not: null } },
                orderBy: { finishedAt: "desc" },
                take: 1,
                select: { score: true, finishedAt: true },
              },
            },
          },
          knowledgeGaps: {
            where: { centerId, studentId },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { rootTopic: { select: { id: true, title: true } } },
          },
        },
      },
    },
  });
}

export function findLatestNextStep(centerId: string, studentId: string) {
  return prisma.nextStep.findFirst({
    where: { centerId, studentId, status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      topic: { select: { title: true } },
      material: { select: { id: true, title: true, url: true, kind: true } },
      gap: { include: { rootTopic: { select: { id: true, title: true } } } },
    },
  });
}

export function findStudentStats(centerId: string, studentId: string) {
  return prisma.studentStats.findFirst({ where: { centerId, studentId } });
}

export function findRatingLeaders(centerId: string) {
  return prisma.studentStats.findMany({
    where: { centerId },
    orderBy: [{ xp: "desc" }, { studentId: "asc" }],
    take: 5,
    include: { student: { select: { fullName: true } } },
  });
}

export function countStudentsAboveXp(centerId: string, xp: number) {
  return prisma.studentStats.count({ where: { centerId, xp: { gt: xp } } });
}

export function findActiveTests(centerId: string, studentId: string) {
  return prisma.test.findMany({
    where: { isActive: true, topic: { subject: { isActive: true } } },
    orderBy: [{ topic: { order: "asc" } }, { title: "asc" }],
    include: {
      topic: { select: { id: true, title: true } },
      _count: { select: { testQuestions: true } },
      attempts: {
        where: { centerId, studentId, finishedAt: { not: null } },
        orderBy: { finishedAt: "desc" },
        take: 1,
        select: { score: true },
      },
    },
  });
}

export function findActiveTest(testId: string) {
  return prisma.test.findFirst({
    where: { id: testId, isActive: true, topic: { subject: { isActive: true } } },
    include: {
      testQuestions: {
        orderBy: { order: "asc" },
        include: { question: { select: { id: true, text: true, options: true } } },
      },
    },
  });
}
