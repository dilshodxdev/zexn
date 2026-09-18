import type {
  AiProvider,
  NextStepInput,
  NextStepSuggestion,
  RootCauseExplanation,
  RootCauseInput,
} from "./AiProvider.js";

/**
 * Tarmoqsiz, deterministik mock. Dev/test'da va API kaliti yo'q joyda ishlatiladi.
 * Real provayder 5-bosqichda shu interfeysni amalga oshiradi.
 */
export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async explainRootCause(input: RootCauseInput): Promise<RootCauseExplanation> {
    const prereq = input.weakPrerequisites[0];
    const explanation = prereq
      ? `"${input.topic}" mavzusidagi xatolar "${prereq}" mavzusi mustahkam emasligidan kelib chiqyapti. Avval shuni takrorlash kerak.`
      : `"${input.topic}" mavzusida xatolar bor, lekin aniq prerequisite bo'shlig'i topilmadi. Mavzuning o'zini takrorlash tavsiya etiladi.`;
    return { explanation, confidence: prereq ? 0.7 : 0.4 };
  }

  async suggestNextStep(input: NextStepInput): Promise<NextStepSuggestion> {
    const material = input.materials[0];
    if (!material) {
      throw new Error("MockAiProvider: materiallar ro'yxati bo'sh");
    }
    return {
      materialId: material.id,
      instruction: `"${material.title}" materialini o'rganib, "${input.topic}" bo'yicha 5 ta mashq bajaring.`,
    };
  }
}
