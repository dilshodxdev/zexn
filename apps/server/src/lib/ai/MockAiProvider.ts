import type { InterviewLanguage, InterviewTrack } from "@zexn/shared";
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

interface TrackQuestion {
  question: string;
  language?: InterviewLanguage;
  starterCode?: string;
}

const TRACK_QUESTIONS: Record<InterviewTrack, TrackQuestion[]> = {
  frontend: [
    { question: "React state va props orasidagi farqni tushuntiring." },
    {
      question: "Ro'yxatni barqaror key bilan render qiladigan komponent yozing.",
      language: "tsx",
      starterCode:
        "type Item = { id: string; name: string };\n\nexport function List({ items }: { items: Item[] }) {\n  // TODO: ro'yxatni render qiling\n}",
    },
    { question: "Brauzerda HTTP so'rovi loading va error holatlarini qanday boshqarasiz?" },
    {
      question: "State obyektini immutable yangilaydigan funksiyani yozing.",
      language: "typescript",
      starterCode:
        "type User = { name: string; active: boolean };\n\nfunction activate(user: User): User {\n  // TODO: yangi obyekt qaytaring\n}",
    },
    { question: "useEffect dependency ro'yxati nima uchun kerak?" },
  ],
  backend: [
    { question: "REST API'da autentifikatsiya va avtorizatsiya farqi nima?" },
    {
      question: "Express handlerda id bo'yicha resurs topish funksiyasini yozing.",
      language: "typescript",
      starterCode:
        "type User = { id: string; name: string };\n\nfunction findUser(users: User[], id: string) {\n  // TODO: foydalanuvchini toping\n}",
    },
    { question: "SQL injection qanday yuzaga keladi va undan qanday himoyalanasiz?" },
    {
      question: "Email qiymatini tekshiradigan funksiya yozing.",
      language: "javascript",
      starterCode: "function isValidEmail(value) {\n  // TODO: boolean qaytaring\n}",
    },
    { question: "API xatolarini yagona formatda qaytarish nega muhim?" },
  ],
  mobile: [
    { question: "Mobil ilovada navigatsiya state'ini qanday boshqarasiz?" },
    {
      question: "Dart'da nullable ism uchun xavfsiz salomlashuv yozing.",
      language: "dart",
      starterCode: "String greeting(String? name) {\n  // TODO: null holatini boshqaring\n}",
    },
    { question: "Offline rejim uchun ma'lumotlarni qanday saqlaysiz?" },
    {
      question: "API natijasini UI holatiga aylantiradigan funksiya yozing.",
      language: "dart",
      starterCode:
        "String statusLabel(bool loading, Object? error) {\n  // TODO: holatni qaytaring\n}",
    },
    { question: "Mobil ekranda loading va retry oqimi qanday quriladi?" },
  ],
  fullstack: [
    { question: "Frontend va backend orasida auth oqimi qanday ishlaydi?" },
    {
      question: "API javobini foydalanuvchi nomlari ro'yxatiga aylantiring.",
      language: "typescript",
      starterCode:
        "type User = { id: string; name: string };\n\nfunction names(users: User[]): string[] {\n  // TODO: nomlarni qaytaring\n}",
    },
    { question: "Monorepo frontend va backend uchun qanday foyda beradi?" },
    {
      question: "Pagination query parametrlarini xavfsiz parse qiling.",
      language: "typescript",
      starterCode:
        "function pageOf(value: string | undefined): number {\n  // TODO: musbat sahifa qaytaring\n}",
    },
    { question: "Deploy jarayonida migratsiya qachon bajariladi?" },
  ],
  android: [
    { question: "Android lifecycle va ViewModel vazifasini tushuntiring." },
    {
      question: "Kotlin'da nullable ismni xavfsiz formatlaydigan funksiya yozing.",
      language: "kotlin",
      starterCode:
        "fun displayName(name: String?): String {\n    // TODO: null-safety bilan qiymat qaytaring\n}",
    },
    { question: "Coroutines UI thread'ni bloklamasdan qanday ishlaydi?" },
    {
      question: "Jetpack Compose uchun immutable UI state yangilanishini yozing.",
      language: "kotlin",
      starterCode:
        "data class UiState(val count: Int)\n\nfun increment(state: UiState): UiState {\n    // TODO: yangi state qaytaring\n}",
    },
    { question: "Room va repository qatlamlari qanday bog'lanadi?" },
  ],
  ios: [
    { question: "SwiftUI state va binding orasidagi farq nima?" },
    {
      question: "Swift'da optional ismni xavfsiz formatlaydigan funksiya yozing.",
      language: "swift",
      starterCode:
        "func displayName(_ name: String?) -> String {\n    // TODO: optional qiymatni boshqaring\n}",
    },
    { question: "async/await bilan UI yangilanishini qanday xavfsiz qilasiz?" },
    {
      question: "SwiftUI modelining count qiymatini oshiradigan funksiya yozing.",
      language: "swift",
      starterCode:
        "struct Counter { let count: Int }\n\nfunc increment(_ value: Counter) -> Counter {\n    // TODO: yangi qiymat qaytaring\n}",
    },
    { question: "Core Data qachon va nima uchun ishlatiladi?" },
  ],
};

const TRACK_KEYWORDS: Record<InterviewTrack, string[]> = {
  frontend: ["react", "state", "props", "render", "http"],
  backend: ["api", "auth", "sql", "middleware", "validation"],
  mobile: ["state", "navigation", "offline", "api", "loading"],
  fullstack: ["frontend", "backend", "json", "auth", "deploy"],
  android: ["kotlin", "viewmodel", "coroutine", "compose", "room"],
  ios: ["swift", "swiftui", "state", "async", "core data"],
};

function reviewCode(message: string): string | null {
  const match = /```([^\n`]*)\n([\s\S]*?)```/.exec(message);
  if (!match) return null;
  const code = match[2] ?? "";
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (/\b\w+\.\w+\s*=\s*[^=]/.test(code)) {
    issues.push(
      "Obyekt qiymati to'g'ridan-to'g'ri o'zgartirilgan; React state uchun bu mutatsiya xavfini tug'diradi.",
    );
    suggestions.push(
      "Spread sintaksisi bilan yangi obyekt yarating va setterga yangi qiymat bering.",
    );
  }
  if (/\.map\s*\(/.test(code) && /<[A-Za-z]/.test(code) && !/\bkey\s*=/.test(code)) {
    issues.push("Ro'yxat renderida barqaror key topilmadi.");
    suggestions.push(
      "Har bir ro'yxat elementiga ma'lumotdagi barqaror id qiymatini key sifatida bering.",
    );
  }
  if (/key=\{\s*(?:index|i|idx)\s*\}/.test(code)) {
    issues.push(
      "Massiv indeksi key sifatida ishlatilgan; tartib o'zgarsa komponent holati adashishi mumkin.",
    );
    suggestions.push("Index o'rniga elementning o'zgarmaydigan identifikatoridan foydalaning.");
  }
  if (/useEffect\s*\(/.test(code) && !/\}\s*,\s*\[[\s\S]*?\]\s*\)/.test(code)) {
    issues.push("useEffect dependency ro'yxati ko'rinmayapti.");
    suggestions.push("Effect ishlatadigan reaktiv qiymatlarni dependency ro'yxatiga kiriting.");
  }

  if (issues.length === 0) {
    issues.push(
      "Aniq xavfli pattern topilmadi; kodni real loyiha kontekstida ham tekshirish kerak.",
    );
    suggestions.push(
      "Nomlarni aniq saqlang, edge case'larni tekshiring va komponentni kichik testlar bilan mustahkamlang.",
    );
  }

  return [
    `Xulosa: Kod ko'rib chiqildi. ${issues.length} ta muhim nuqta qayd etildi.`,
    "Muammolar:",
    ...issues.map((issue) => `- ${issue}`),
    "Tavsiyalar:",
    ...suggestions.map((suggestion) => `- ${suggestion}`),
  ].join("\n");
}

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

  async chat(input: ChatInput): Promise<string> {
    if (input.message.startsWith("[tizim]")) {
      const studentName =
        input.system
          .split("\n")
          .find((line) => line.startsWith("O'quvchi: "))
          ?.slice("O'quvchi: ".length) ?? "o'quvchi";
      const nextStep =
        input.system
          .split("\n")
          .find((line) => line.startsWith("Joriy keyingi qadam: "))
          ?.slice("Joriy keyingi qadam: ".length) ?? "hozircha keyingi qadam belgilanmagan";
      return `Salom, ${studentName}! 👋 Ishlar yaxshimi? Bugun nima o'tamiz - o'zing aytasanmi yoki men taklif qilaymi? (Keyingi qadaming: ${nextStep})`;
    }
    const codeReview = reviewCode(input.message);
    if (codeReview) return codeReview;
    const message = input.message.toLocaleLowerCase("uz");
    const topicLines = input.system
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).split(" | "));

    for (const [topic, material, url] of topicLines) {
      if (topic && message.includes(topic.toLocaleLowerCase("uz"))) {
        if (material && url) return `"${material}" materialini o'rganing: ${url}`;
        if (material) return `"${material}" materialini o'rganing.`;
        return `"${topic}" mavzusini takrorlang.`;
      }
    }

    const nextStepPrefix = "Joriy keyingi qadam: ";
    const nextStep = input.system
      .split("\n")
      .find((line) => line.startsWith(nextStepPrefix))
      ?.slice(nextStepPrefix.length);
    return nextStep ?? "Hozircha keyingi qadam belgilanmagan.";
  }

  async interviewQuestion(input: InterviewQuestionInput): Promise<InterviewQuestionResult> {
    const questions = TRACK_QUESTIONS[input.track];
    return { ...questions[input.index % questions.length]! };
  }

  async interviewEvaluate(input: InterviewEvaluationInput): Promise<InterviewEvaluationResult> {
    const answer = input.answer.trim();
    if (input.kind === "code") {
      const completed = answer.length > (input.starterCode?.length ?? 0) && !/TODO/i.test(answer);
      const score = completed ? 70 + (/\b(?:return|fun|func|def)\b|=>/.test(answer) ? 10 : 0) : 25;
      return {
        score,
        feedback:
          score >= 70
            ? "Kod topshirig'i bajarilgan va yechim o'qiluvchan. Chekka holatlarni ham tekshirib ko'r."
            : "Kod hali to'liq emas. TODO qismini tugatib, ishlaydigan yechim qaytar.",
        modelAnswer:
          score < 70
            ? (input.starterCode?.replace(/\/\/ TODO[^\n]*/g, "return value") ??
              "fun solution() = Unit")
            : null,
      };
    }
    if (answer.length < 15) {
      return {
        score: 20,
        feedback: "Javob juda qisqa. Asosiy tushuncha va amaliy misol bilan kengaytir.",
        modelAnswer: "Tushunchani sabab va kichik kod misoli bilan izohlash kerak.",
      };
    }
    const normalized = answer.toLocaleLowerCase("uz");
    const matches = TRACK_KEYWORDS[input.track].filter((keyword) =>
      normalized.includes(keyword.toLocaleLowerCase("uz")),
    ).length;
    const score = Math.min(95, 50 + matches * 15);
    return {
      score,
      feedback:
        score >= 70
          ? "Javob yaxshi va asosiy kalit tushunchalarni qamrab olgan. Amaliy misol bilan yanada kuchaytirishing mumkin."
          : "Asosiy yo'nalish to'g'ri, lekin muhim kalit tushunchalar yetishmayapti. Javobni aniq misol bilan to'ldir.",
      modelAnswer:
        score < 70
          ? "Tushunchani asosiy API yoki usul va qisqa amaliy misol bilan tushuntir."
          : null,
    };
  }

  async interviewSummary(input: InterviewSummaryInput): Promise<InterviewSummaryResult> {
    const average = Math.round(
      input.turns.reduce((sum, turn) => sum + turn.score, 0) / input.turns.length,
    );
    const strong = input.turns.filter((turn) => turn.score >= 70).length;
    return {
      summary: `Intervyu natijasi ${average}% bo'ldi. ${strong} ta savolda tushunchalar yaxshi ko'rsatildi, qolgan mavzularni amaliy mashq bilan mustahkamlash kerak.`,
      strengths: strong > 0 ? ["Asosiy tushunchalarni izohlash"] : [],
      weaknesses: strong < input.turns.length ? ["Javoblarni amaliy misol bilan asoslash"] : [],
    };
  }
}
