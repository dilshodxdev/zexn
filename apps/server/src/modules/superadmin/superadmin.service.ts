import {
  aiSettingsSchema,
  superAdminOverviewSchema,
  type AiSettings,
  type SuperAdminOverview,
  type TestAiPromptBody,
  type TestAiPromptResponse,
  type UpdateAiSettingsBody,
} from "@zexn/shared";
import { createAiProvider } from "../../lib/ai/index.js";
import { DEFAULT_MENTOR_SYSTEM_PROMPT, testAiPrompt } from "../settings/settings.service.js";
import * as superadminRepository from "./superadmin.repository.js";

function mapSettings(setting: {
  mentorSystemPrompt: string;
  updatedAt: Date;
  updatedBy: { id: string; fullName: string } | null;
}): AiSettings {
  return aiSettingsSchema.parse({
    prompt: setting.mentorSystemPrompt,
    provider: createAiProvider().name,
    defaultPrompt: DEFAULT_MENTOR_SYSTEM_PROMPT,
    updatedAt: setting.updatedAt.toISOString(),
    updatedBy: setting.updatedBy,
  });
}

export async function getPlatformSettings(): Promise<AiSettings> {
  return mapSettings(await superadminRepository.findPlatformSettings());
}

export async function updatePlatformSettings(
  userId: string,
  body: UpdateAiSettingsBody,
): Promise<AiSettings> {
  return mapSettings(await superadminRepository.updatePlatformSettings(body.prompt, userId));
}

export async function testPlatformPrompt(
  userId: string,
  body: TestAiPromptBody,
): Promise<TestAiPromptResponse> {
  return testAiPrompt(userId, body.prompt, { ...body, prompt: "" });
}

export async function getOverview(): Promise<SuperAdminOverview> {
  const data = await superadminRepository.findOverviewData();
  const studentIds = new Set(
    data.memberships
      .filter((membership) => membership.role === "STUDENT")
      .map((membership) => membership.userId),
  );
  const teacherIds = new Set(
    data.memberships
      .filter((membership) => membership.role === "TEACHER")
      .map((membership) => membership.userId),
  );
  const countsByCenter = new Map<string, { students: Set<string>; teachers: Set<string> }>();
  for (const membership of data.memberships) {
    const counts = countsByCenter.get(membership.centerId) ?? {
      students: new Set<string>(),
      teachers: new Set<string>(),
    };
    if (membership.role === "STUDENT") counts.students.add(membership.userId);
    if (membership.role === "TEACHER") counts.teachers.add(membership.userId);
    countsByCenter.set(membership.centerId, counts);
  }
  return superAdminOverviewSchema.parse({
    centers: data.centers,
    activeCenters: data.activeCenters,
    users: data.users,
    students: studentIds.size,
    teachers: teacherIds.size,
    aiProvider: createAiProvider().name,
    recentCenters: data.recentCenters.map((center) => {
      const counts = countsByCenter.get(center.id);
      return {
        ...center,
        studentCount: counts?.students.size ?? 0,
        teacherCount: counts?.teachers.size ?? 0,
        createdAt: center.createdAt.toISOString(),
      };
    }),
  });
}
