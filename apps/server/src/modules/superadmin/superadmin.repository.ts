import { prisma } from "../../lib/prisma.js";

const platformSettingsSelect = {
  mentorSystemPrompt: true,
  updatedAt: true,
  updatedBy: { select: { id: true, fullName: true } },
} as const;

export function findPlatformSettings() {
  return prisma.platformSetting.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
    select: platformSettingsSelect,
  });
}

export function updatePlatformSettings(prompt: string, updatedByUserId: string) {
  return prisma.platformSetting.upsert({
    where: { id: "default" },
    create: { id: "default", mentorSystemPrompt: prompt, updatedByUserId },
    update: { mentorSystemPrompt: prompt, updatedByUserId },
    select: platformSettingsSelect,
  });
}

export async function findOverviewData() {
  const [centers, activeCenters, users, memberships, recentCenters] = await Promise.all([
    prisma.center.count(),
    prisma.center.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.membership.findMany({
      where: { isActive: true, role: { in: ["STUDENT", "TEACHER"] } },
      select: { centerId: true, userId: true, role: true },
    }),
    prisma.center.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, slug: true, isActive: true, createdAt: true },
    }),
  ]);
  return { centers, activeCenters, users, memberships, recentCenters };
}
