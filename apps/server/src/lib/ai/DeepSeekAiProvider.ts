import { API_ERROR_CODES, interviewLanguageSchema } from "@zexn/shared";
import { AppError } from "../AppError.js";
import type {
  AiProvider,
  ChatInput,
  InterviewEvaluationInput,
  InterviewEvaluationResult,
  InterviewQuestionInput,
  InterviewQuestionResult,
  InterviewSummaryInput,
  InterviewSummaryResult,
  NextStepInput,
  NextStepSuggestion,
  RootCauseExplanation,
  RootCauseInput,
} from "./AiProvider.js";
import { MockAiProvider } from "./MockAiProvider.js";

interface DeepSeekOptions {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string | null } }>;
}

function aiUnavailable(status?: number | "timeout"): AppError {
  return new AppError(
    503,
    "AI provayder javob bermadi",
    API_ERROR_CODES.AI_UNAVAILABLE,
    status === undefined ? undefined : { status },
  );
}

function parseRootCause(value: string): RootCauseExplanation {
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("explanation" in parsed) ||
    !("confidence" in parsed) ||
    typeof parsed.explanation !== "string" ||
    typeof parsed.confidence !== "number"
  ) {
    throw new Error("AI JSON shakli noto'g'ri");
  }
  return { explanation: parsed.explanation, confidence: parsed.confidence };
}

function parseNextStep(value: string): NextStepSuggestion {
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("materialId" in parsed) ||
    !("instruction" in parsed) ||
    typeof parsed.materialId !== "string" ||
    typeof parsed.instruction !== "string"
  ) {
    throw new Error("AI JSON shakli noto'g'ri");
  }
  return { materialId: parsed.materialId, instruction: parsed.instruction };
}

function parseInterviewQuestion(value: string): InterviewQuestionResult {
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("question" in parsed) ||
    typeof parsed.question !== "string" ||
    parsed.question.trim() === ""
  ) {
    throw new Error("AI JSON shakli noto'g'ri");
  }
  const language = "language" in parsed ? interviewLanguageSchema.safeParse(parsed.language) : null;
  const starterCode = "starterCode" in parsed ? parsed.starterCode : undefined;
  return {
    question: parsed.question.trim(),
    ...(language?.success ? { language: language.data } : {}),
    ...(typeof starterCode === "string" ? { starterCode } : {}),
  };
}

function parseInterviewEvaluation(value: string): InterviewEvaluationResult {
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("score" in parsed) ||
    !("feedback" in parsed) ||
    !("modelAnswer" in parsed) ||
    typeof parsed.score !== "number" ||
    typeof parsed.feedback !== "string" ||
    (parsed.modelAnswer !== null && typeof parsed.modelAnswer !== "string")
  ) {
    throw new Error("AI JSON shakli noto'g'ri");
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    feedback: parsed.feedback,
    modelAnswer: parsed.modelAnswer,
  };
}

function parseInterviewSummary(value: string): InterviewSummaryResult {
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("summary" in parsed) ||
    !("strengths" in parsed) ||
    !("weaknesses" in parsed) ||
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.strengths) ||
    !parsed.strengths.every((item) => typeof item === "string") ||
    !Array.isArray(parsed.weaknesses) ||
    !parsed.weaknesses.every((item) => typeof item === "string")
  ) {
    throw new Error("AI JSON shakli noto'g'ri");
  }
  return {
    summary: parsed.summary,
    strengths: parsed.strengths.slice(0, 3),
    weaknesses: parsed.weaknesses.slice(0, 3),
  };
}

export class DeepSeekAiProvider implements AiProvider {
  readonly name = "deepseek";
  private readonly mock = new MockAiProvider();

  constructor(private readonly options: DeepSeekOptions) {}

  async chat(input: ChatInput): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);
    try {
      const response = await fetch(`${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: [
            { role: "system", content: input.system },
            ...input.history.map((item) => ({
              role: item.role === "student" ? "user" : "assistant",
              content: item.text,
            })),
            { role: "user", content: input.message },
          ],
          temperature: 0.4,
          max_tokens: 800,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw aiUnavailable(response.status);
      const payload = (await response.json()) as ChatCompletionResponse;
      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) throw aiUnavailable(response.status);
      return content;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (controller.signal.aborted) throw aiUnavailable("timeout");
      throw aiUnavailable();
    } finally {
      clearTimeout(timeout);
    }
  }

  async explainRootCause(input: RootCauseInput): Promise<RootCauseExplanation> {
    const message = JSON.stringify(input);
    const response = await this.chat({
      system:
        'Faqat JSON qaytar: {"explanation":"o\'zbekcha 2-3 gap","confidence":0.0}. Boshqa matn yozma.',
      history: [],
      message,
    });
    try {
      return parseRootCause(response);
    } catch {
      return this.mock.explainRootCause(input);
    }
  }

  async suggestNextStep(input: NextStepInput): Promise<NextStepSuggestion> {
    const message = JSON.stringify(input);
    const response = await this.chat({
      system:
        'Faqat JSON qaytar: {"materialId":"mavjud id","instruction":"o\'zbekcha 1-2 gap"}. Boshqa matn yozma.',
      history: [],
      message,
    });
    try {
      return parseNextStep(response);
    } catch {
      return this.mock.suggestNextStep(input);
    }
  }

  async interviewQuestion(input: InterviewQuestionInput): Promise<InterviewQuestionResult> {
    const response = await this.chat({
      system: [
        input.platformPrompt,
        `Sen ${input.track} yo'nalishi bo'yicha texnik intervyu oluvchisan. Mavzular: ${input.topics}.`,
        "Bitta qisqa, amaliy, darajaga mos savol ber va oldingi savollarni takrorlama. Code turida ruxsat etilgan tildan foydalanib 3-15 qatorli TODO izohli starterCode ber.",
        'FAQAT JSON qaytar: {"question":"savol","language":"kotlin","starterCode":"kod"}. Theory turida language va starterCode null bo\'lsin. Boshqa matn yozma.',
      ]
        .filter(Boolean)
        .join("\n"),
      history: [],
      message: JSON.stringify(input),
    });
    try {
      return parseInterviewQuestion(response);
    } catch {
      return this.mock.interviewQuestion(input);
    }
  }

  async interviewEvaluate(input: InterviewEvaluationInput): Promise<InterviewEvaluationResult> {
    const response = await this.chat({
      system: [
        input.platformPrompt,
        `Sen ${input.track} yo'nalishi bo'yicha texnik intervyu oluvchisan.`,
        "Javobni 0-100 butun ball bilan bahola. Kodda to'g'rilik, chekka holatlar, o'qiluvchanlik va soha amaliyotini tekshir. Kotlin'da null-safety, SwiftUI'da state kabi amaliyotlarni hisobga ol. Feedback 1-2 gap, iliq va sen deb yozilsin. Model javobi faqat score 70 dan past bo'lsa nazariy javob yoki namuna kod bo'lsin.",
        'FAQAT JSON qaytar: {"score":0,"feedback":"fikr","modelAnswer":null}. Boshqa matn yozma.',
      ]
        .filter(Boolean)
        .join("\n"),
      history: [],
      message: JSON.stringify(input),
    });
    try {
      return parseInterviewEvaluation(response);
    } catch {
      return this.mock.interviewEvaluate(input);
    }
  }

  async interviewSummary(input: InterviewSummaryInput): Promise<InterviewSummaryResult> {
    const response = await this.chat({
      system: [
        input.platformPrompt,
        `Sen ${input.track} yo'nalishi bo'yicha texnik intervyu oluvchisan. Natijani 2-3 gapda xulosa qil, ko'pi bilan 3 ta kuchli va 3 ta zaif tomonni ber.`,
        'FAQAT JSON qaytar: {"summary":"xulosa","strengths":[],"weaknesses":[]}. Boshqa matn yozma.',
      ]
        .filter(Boolean)
        .join("\n"),
      history: [],
      message: JSON.stringify(input),
    });
    try {
      return parseInterviewSummary(response);
    } catch {
      return this.mock.interviewSummary(input);
    }
  }
}
