import {
  API_ERROR_CODES,
  aiSettingsSchema,
  testAiPromptResponseSchema,
  type AiSettings,
  type TestAiPromptBody,
  type TestAiPromptResponse,
  type UpdateAiSettingsBody,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { createAiProvider } from "../../lib/ai/index.js";
import * as settingsRepository from "./settings.repository.js";
import { MENTOR_PERSONA } from "../../lib/ai/context-builder.js";

/** Platforma prompt'i bo'sh bo'lganda ishlatiladigan default - context-builder'dagi mentor shaxsi. */
export const DEFAULT_MENTOR_SYSTEM_PROMPT = MENTOR_PERSONA;

const TEST_RATE_LIMIT = 5;
const TEST_RATE_WINDOW_MS = 60_000;
const testTimes = new Map<string, number[]>();

function enforceTestRateLimit(userId: string): void {
  const now = Date.now();
  const recent = (testTimes.get(userId) ?? []).filter((time) => now - time < TEST_RATE_WINDOW_MS);
  if (recent.length >= TEST_RATE_LIMIT) {
    testTimes.set(userId, recent);
    throw new AppError(
      429,
      "Bir daqiqada 5 tadan ortiq sinov yuborib bo'lmaydi",
      API_ERROR_CODES.RATE_LIMITED,
    );
  }
  recent.push(now);
  testTimes.set(userId, recent);
}

function mapSettings(setting: {
  mentorSystemPrompt: string;
  promptUpdatedAt: Date | null;
  promptUpdatedBy: { id: string; fullName: string } | null;
}): AiSettings {
  return aiSettingsSchema.parse({
    prompt: setting.mentorSystemPrompt,
    provider: createAiProvider().name,
    defaultPrompt: DEFAULT_MENTOR_SYSTEM_PROMPT,
    updatedAt: setting.promptUpdatedAt?.toISOString() ?? null,
    updatedBy: setting.promptUpdatedBy,
  });
}

export async function getCenterSettings(centerId: string): Promise<AiSettings> {
  const setting = await settingsRepository.findCenterSettings(centerId);
  if (!setting) {
    throw new AppError(404, "Markaz topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return mapSettings(setting);
}

export async function updateCenterSettings(
  centerId: string,
  userId: string,
  body: UpdateAiSettingsBody,
): Promise<AiSettings> {
  const setting = await settingsRepository.updateCenterSettings(centerId, body.prompt, userId);
  if (!setting) {
    throw new AppError(404, "Markaz topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return mapSettings(setting);
}

export async function testAiPrompt(
  userId: string,
  platformPrompt: string,
  body: TestAiPromptBody,
): Promise<TestAiPromptResponse> {
  enforceTestRateLimit(userId);
  const provider = createAiProvider();
  const system = [
    platformPrompt.trim() || DEFAULT_MENTOR_SYSTEM_PROMPT,
    body.prompt.trim(),
    "Sinov rejimi: o'quvchi konteksti yo'q",
  ]
    .filter(Boolean)
    .join("\n");
  const startedAt = Date.now();
  const reply = await provider.chat({ system, history: [], message: body.message });
  return testAiPromptResponseSchema.parse({
    reply,
    provider: provider.name,
    latencyMs: Date.now() - startedAt,
  });
}

export async function testCenterPrompt(
  userId: string,
  body: TestAiPromptBody,
): Promise<TestAiPromptResponse> {
  return testAiPrompt(userId, await settingsRepository.findPlatformPrompt(), body);
}
