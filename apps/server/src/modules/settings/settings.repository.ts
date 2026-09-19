import { prisma } from "../../lib/prisma.js";

const centerSettingsSelect = {
  mentorSystemPrompt: true,
  promptUpdatedAt: true,
  promptUpdatedBy: { select: { id: true, fullName: true } },
} as const;

export function findCenterSettings(centerId: string) {
  return prisma.center.findFirst({
    where: { id: centerId },
    select: centerSettingsSelect,
  });
}

export async function updateCenterSettings(
  centerId: string,
  prompt: string,
  updatedByUserId: string,
) {
  const updated = await prisma.center.updateMany({
    where: { id: centerId },
    data: {
      mentorSystemPrompt: prompt,
      promptUpdatedAt: new Date(),
      promptUpdatedByUserId: updatedByUserId,
    },
  });
  if (updated.count === 0) return null;
  return findCenterSettings(centerId);
}

export async function findCenterPrompt(centerId: string): Promise<string> {
  const center = await prisma.center.findFirst({
    where: { id: centerId },
    select: { mentorSystemPrompt: true },
  });
  return center?.mentorSystemPrompt ?? "";
}

export async function findPlatformPrompt(): Promise<string> {
  const setting = await prisma.platformSetting.findUnique({
    where: { id: "default" },
    select: { mentorSystemPrompt: true },
  });
  return setting?.mentorSystemPrompt ?? "";
}
