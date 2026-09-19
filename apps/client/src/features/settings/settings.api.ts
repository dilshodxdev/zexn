import { api } from "@/lib/api";
import {
  aiSettingsSchema,
  testAiPromptBodySchema,
  testAiPromptResponseSchema,
  updateAiSettingsBodySchema,
  type AiSettings,
  type TestAiPromptBody,
  type TestAiPromptResponse,
  type UpdateAiSettingsBody,
} from "@zexn/shared";
import {
  centerAiSettingsFixture,
  getTestAiPromptFixture,
  platformAiSettingsFixture,
} from "./settings.fixture";

export type SettingsScope = "center" | "platform";

const isFixture = import.meta.env.VITE_SETTINGS_FIXTURE === "true";

function getBasePath(scope: SettingsScope): string {
  return scope === "platform" ? "/superadmin/settings/ai" : "/settings/ai";
}

export async function getAiSettings(scope: SettingsScope): Promise<AiSettings> {
  if (isFixture) {
    return Promise.resolve(
      scope === "platform" ? platformAiSettingsFixture : centerAiSettingsFixture,
    );
  }

  const { data } = await api.get(getBasePath(scope));
  return aiSettingsSchema.parse(data);
}

export async function updateAiSettings(
  scope: SettingsScope,
  body: UpdateAiSettingsBody,
): Promise<AiSettings> {
  const validBody = updateAiSettingsBodySchema.parse(body);

  if (isFixture) {
    const base = scope === "platform" ? platformAiSettingsFixture : centerAiSettingsFixture;
    return Promise.resolve({
      ...base,
      prompt: validBody.prompt,
      updatedAt: new Date().toISOString(),
    });
  }

  const { data } = await api.put(getBasePath(scope), validBody);
  return aiSettingsSchema.parse(data);
}

export async function testAiPrompt(
  scope: SettingsScope,
  body: TestAiPromptBody,
): Promise<TestAiPromptResponse> {
  const validBody = testAiPromptBodySchema.parse(body);

  if (isFixture) {
    return Promise.resolve(getTestAiPromptFixture(validBody.message));
  }

  const { data } = await api.post(`${getBasePath(scope)}/test`, validBody);
  return testAiPromptResponseSchema.parse(data);
}
