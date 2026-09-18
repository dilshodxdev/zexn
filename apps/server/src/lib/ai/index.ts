import type { AiProvider } from "./AiProvider.js";
import { MockAiProvider } from "./MockAiProvider.js";

export type * from "./AiProvider.js";
export { MockAiProvider } from "./MockAiProvider.js";

/**
 * Provayderni tanlash bitta joyda. 5-bosqichda env'ga qarab real provayder qaytariladi;
 * hozir hamma joyda mock.
 */
export function createAiProvider(): AiProvider {
  return new MockAiProvider();
}
