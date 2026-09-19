import type { InterviewLanguage, InterviewQuestionKind, InterviewTrack } from "@zexn/shared";

/**
 * AI qatlami interfeysi. Hackathon'da bitta provayder, keyin almashtirish oson bo'lsin.
 * Deterministik tahlil (prerequisite graf + statistika) bu yerda EMAS - u service'da.
 * AI faqat: (1) ildiz sababini odam tilida tushuntirish, (2) keyingi qadam matnini yozish.
 */

export interface RootCauseInput {
  /** O'quvchi xato qilgan mavzu */
  topic: string;
  /** Deterministik tahlil zaif deb topgan prerequisite mavzular */
  weakPrerequisites: string[];
  /** Xato javoblar (savol + berilgan javob + to'g'ri javob) */
  mistakes: Array<{ question: string; given: string; correct: string }>;
}

export interface RootCauseExplanation {
  /** O'zbekcha, o'quvchiga tushunarli 2-3 gap */
  explanation: string;
  /** 0..1 - modelning ishonch darajasi */
  confidence: number;
}

export interface NextStepInput {
  topic: string;
  rootCause: string;
  /** Mavjud materiallar ro'yxati (nom + havola), tanlov shulardan */
  materials: Array<{ id: string; title: string }>;
}

export interface NextStepSuggestion {
  materialId: string;
  /** O'zbekcha, 1-2 gap: nima qilish kerak va nega */
  instruction: string;
}

export interface ChatInput {
  system: string;
  history: Array<{ role: "student" | "mentor"; text: string }>;
  message: string;
}

export type InterviewLevel = "easy" | "medium" | "hard";

export interface InterviewQuestionInput {
  skill: string | null;
  topic: string | null;
  track: InterviewTrack;
  topics: string;
  kind: InterviewQuestionKind;
  languages: readonly InterviewLanguage[];
  level: InterviewLevel;
  index: number;
  total: number;
  previous: Array<{ question: string; answer: string; score: number }>;
  platformPrompt: string;
}

export interface InterviewEvaluationInput {
  skill: string | null;
  track: InterviewTrack;
  level: InterviewLevel;
  kind: InterviewQuestionKind;
  language: InterviewLanguage | null;
  starterCode: string | null;
  question: string;
  answer: string;
  platformPrompt: string;
}

export interface InterviewSummaryInput {
  skill: string | null;
  track: InterviewTrack;
  turns: Array<{ question: string; answer: string; score: number }>;
  platformPrompt: string;
}

export interface InterviewQuestionResult {
  question: string;
  language?: InterviewLanguage;
  starterCode?: string;
}

export interface InterviewEvaluationResult {
  score: number;
  feedback: string;
  modelAnswer: string | null;
}

export interface InterviewSummaryResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AiProvider {
  /** Provayder nomi (log va debug uchun) */
  readonly name: string;
  explainRootCause(input: RootCauseInput): Promise<RootCauseExplanation>;
  suggestNextStep(input: NextStepInput): Promise<NextStepSuggestion>;
  chat(input: ChatInput): Promise<string>;
  interviewQuestion(input: InterviewQuestionInput): Promise<InterviewQuestionResult>;
  interviewEvaluate(input: InterviewEvaluationInput): Promise<InterviewEvaluationResult>;
  interviewSummary(input: InterviewSummaryInput): Promise<InterviewSummaryResult>;
}
