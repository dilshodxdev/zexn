export interface AnalysisQuestion {
  questionId: string;
  topicId: string;
  isCorrect: boolean;
}

export interface AttemptAnalysisInput {
  topicId: string;
  questions: AnalysisQuestion[];
  prerequisiteGraph: Map<string, string[]>;
  mastery: Map<string, number | null>;
}

export interface AttemptAnalysis {
  score: number;
  correct: number;
  total: number;
  xpEarned: number;
  gap: {
    rootTopicId: string | null;
    confidence: number;
  } | null;
}

export function analyzeAttempt(input: AttemptAnalysisInput): AttemptAnalysis {
  const total = input.questions.length;
  const correct = input.questions.filter((question) => question.isCorrect).length;
  const score = total === 0 ? 0 : (correct / total) * 100;
  const xpEarned = correct * 10 + (score >= 70 ? 50 : 0);

  if (score >= 70) {
    return { score, correct, total, xpEarned, gap: null };
  }

  const prerequisiteIds = input.prerequisiteGraph.get(input.topicId) ?? [];
  let rootTopicId: string | null = null;
  let lowestMastery = Number.POSITIVE_INFINITY;

  for (const prerequisiteId of prerequisiteIds) {
    const prerequisiteMastery = input.mastery.get(prerequisiteId) ?? null;
    if (prerequisiteMastery !== null && prerequisiteMastery >= 70) continue;
    const comparableMastery = prerequisiteMastery ?? Number.NEGATIVE_INFINITY;
    if (rootTopicId === null || comparableMastery < lowestMastery) {
      rootTopicId = prerequisiteId;
      lowestMastery = comparableMastery;
    }
  }

  const rootMastery = rootTopicId === null ? null : (input.mastery.get(rootTopicId) ?? null);
  const confidence =
    rootTopicId === null ? 0.6 : rootMastery === null ? 0.5 : rootMastery < 50 ? 0.9 : 0.7;

  return {
    score,
    correct,
    total,
    xpEarned,
    gap: { rootTopicId, confidence },
  };
}
