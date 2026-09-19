import type { AiProvider } from "./AiProvider.js";
import { env } from "../../config/env.js";
import { DeepSeekAiProvider } from "./DeepSeekAiProvider.js";
import { MockAiProvider } from "./MockAiProvider.js";

export type * from "./AiProvider.js";
export { DeepSeekAiProvider } from "./DeepSeekAiProvider.js";
export { MockAiProvider } from "./MockAiProvider.js";

const mockProvider = new MockAiProvider();
const deepSeekProvider =
  env.AI_PROVIDER === "deepseek"
    ? new DeepSeekAiProvider({
        apiKey: env.DEEPSEEK_API_KEY,
        model: env.DEEPSEEK_MODEL,
        baseUrl: env.DEEPSEEK_BASE_URL,
        timeoutMs: env.AI_TIMEOUT_MS,
      })
    : null;

export function createAiProvider(): AiProvider {
  return deepSeekProvider ?? mockProvider;
}
