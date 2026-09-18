import { prisma } from "../../lib/prisma.js";

export function createMessage(
  centerId: string,
  studentId: string,
  role: "student" | "mentor",
  text: string,
) {
  return prisma.mentorMessage.create({ data: { centerId, studentId, role, text } });
}

export function findRecentMessages(
  centerId: string,
  studentId: string,
  limit: number,
  excludeId?: string,
) {
  return prisma.mentorMessage.findMany({
    where: { centerId, studentId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
}

export function completeNextStep(centerId: string, studentId: string, nextStepId: string) {
  return prisma.$transaction(async (transaction) => {
    const pending = await transaction.nextStep.findFirst({
      where: { id: nextStepId, centerId, studentId, status: "pending" },
      select: { id: true },
    });
    if (!pending) return null;

    const completed = await transaction.nextStep.updateMany({
      where: { id: nextStepId, centerId, studentId, status: "pending" },
      data: { status: "done", doneAt: new Date() },
    });
    if (completed.count === 0) return null;

    const stats = await transaction.studentStats.findFirst({
      where: { centerId, studentId },
      select: { id: true },
    });
    if (stats) {
      await transaction.studentStats.update({
        where: { id: stats.id },
        data: { xp: { increment: 20 } },
      });
    } else {
      await transaction.studentStats.create({
        data: {
          centerId,
          studentId,
          xp: 20,
          streakDays: 0,
          streakRecord: 0,
          lastActiveDate: new Date(),
        },
      });
    }

    return transaction.nextStep.findFirst({
      where: { id: nextStepId, centerId, studentId },
      include: {
        topic: { select: { title: true } },
        material: { select: { id: true, title: true, url: true, kind: true } },
        gap: { include: { rootTopic: { select: { id: true, title: true } } } },
      },
    });
  });
}
