import { API_ERROR_CODES, type AttemptResult, type SubmitAttemptBody } from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { createAiProvider } from "../../lib/ai/index.js";
import { analyzeAttempt } from "./analysis.service.js";
import * as attemptRepository from "./attempt.repository.js";
import { onAttemptFinished } from "../sdt/sdt.service.js";

type AttemptTest = NonNullable<Awaited<ReturnType<typeof attemptRepository.findAttemptTest>>>;

interface Option {
  id: string;
  text: string;
}

function parseOptions(value: unknown): Option[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Option =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      "text" in item &&
      typeof item.text === "string",
  );
}

function tashkentDateKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function calculateStreak(lastActiveDate: Date | null, currentStreak: number, now: Date): number {
  if (!lastActiveDate) return 1;
  const today = tashkentDateKey(now);
  if (tashkentDateKey(lastActiveDate) === today) return currentStreak;
  const yesterday = tashkentDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  return tashkentDateKey(lastActiveDate) === yesterday ? currentStreak + 1 : 1;
}

async function explanationWithTimeout(
  test: AttemptTest,
  rootTitle: string | null,
  answers: Array<{
    question: AttemptTest["testQuestions"][number]["question"];
    optionId: string;
    isCorrect: boolean;
  }>,
): Promise<string | null> {
  const mistakes = answers
    .filter((answer) => !answer.isCorrect)
    .map(({ question, optionId }) => {
      const options = parseOptions(question.options);
      return {
        question: question.text,
        given: options.find((option) => option.id === optionId)?.text ?? optionId,
        correct:
          options.find((option) => option.id === question.correctOptionId)?.text ??
          question.correctOptionId,
      };
    });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("AI_TIMEOUT")), 3000);
    });
    const result = await Promise.race([
      createAiProvider().explainRootCause({
        topic: test.topic.title,
        weakPrerequisites: rootTitle ? [rootTitle] : [],
        mistakes,
      }),
      timeoutPromise,
    ]);
    return result.explanation;
  } catch {
    return null;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function submitAttempt(
  centerId: string,
  studentId: string,
  testId: string,
  body: SubmitAttemptBody,
): Promise<AttemptResult> {
  const test = await attemptRepository.findAttemptTest(testId);
  if (!test) {
    throw new AppError(404, "Test topilmadi", API_ERROR_CODES.NOT_FOUND);
  }

  const submitted = new Map(body.answers.map((answer) => [answer.questionId, answer.optionId]));
  const testQuestionIds = new Set(test.testQuestions.map(({ question }) => question.id));
  if (
    submitted.size !== body.answers.length ||
    submitted.size !== test.testQuestions.length ||
    body.answers.some((answer) => !testQuestionIds.has(answer.questionId))
  ) {
    throw new AppError(
      400,
      "Barcha test savollariga bittadan javob yuboring",
      API_ERROR_CODES.VALIDATION_ERROR,
    );
  }

  const checkedAnswers = test.testQuestions.map(({ question }) => {
    const optionId = submitted.get(question.id)!;
    const options = parseOptions(question.options);
    if (!options.some((option) => option.id === optionId)) {
      throw new AppError(400, "Javob varianti yaroqsiz", API_ERROR_CODES.VALIDATION_ERROR);
    }
    return { question, optionId, isCorrect: optionId === question.correctOptionId };
  });
  const prerequisiteIds = test.topic.prerequisites.map((item) => item.prerequisiteId);
  const previousAttempts = await attemptRepository.findPrerequisiteAttempts(
    centerId,
    studentId,
    prerequisiteIds,
  );
  const mastery = new Map<string, number | null>(prerequisiteIds.map((id) => [id, null]));
  for (const attempt of previousAttempts) {
    if (mastery.get(attempt.test.topicId) === null) {
      mastery.set(attempt.test.topicId, attempt.score);
    }
  }
  const analysis = analyzeAttempt({
    topicId: test.topicId,
    questions: checkedAnswers.map(({ question, isCorrect }) => ({
      questionId: question.id,
      topicId: question.topicId,
      isCorrect,
    })),
    prerequisiteGraph: new Map([[test.topicId, prerequisiteIds]]),
    mastery,
  });

  const root = test.topic.prerequisites.find(
    (item) => item.prerequisiteId === analysis.gap?.rootTopicId,
  )?.prerequisite;
  const targetTopic = root ?? test.topic;
  const material = targetTopic.materials[0] ?? null;
  const explanation = analysis.gap
    ? await explanationWithTimeout(test, root?.title ?? null, checkedAnswers)
    : null;
  const instruction = analysis.gap
    ? root
      ? `Avval ${root.title} mavzusini takrorlang: ${material?.title ?? "material"}. Keyin ${test.topic.title} testini qayta topshiring.`
      : `${test.topic.title} mavzusini takrorlang: ${material?.title ?? "material"}. Keyin testni qayta topshiring.`
    : null;

  const now = new Date();
  const currentStats = await attemptRepository.findStats(centerId, studentId);
  const streakDays = calculateStreak(
    currentStats?.lastActiveDate ?? null,
    currentStats?.streakDays ?? 0,
    now,
  );
  const persisted = await attemptRepository.persistAttempt({
    centerId,
    studentId,
    testId,
    topicId: test.topicId,
    score: analysis.score,
    correct: analysis.correct,
    total: analysis.total,
    xpEarned: analysis.xpEarned,
    answers: checkedAnswers.map(({ question, optionId, isCorrect }) => ({
      questionId: question.id,
      optionId,
      isCorrect,
    })),
    gap: analysis.gap ? { ...analysis.gap, explanation } : null,
    nextStep: instruction ? { materialId: material?.id ?? null, instruction } : null,
    stats: {
      xp: (currentStats?.xp ?? 0) + analysis.xpEarned,
      streakDays,
      streakRecord: Math.max(currentStats?.streakRecord ?? 0, streakDays),
      lastActiveDate: now,
    },
  });

  const groupedScores = new Map<string, { correct: number; total: number }>();
  for (const answer of checkedAnswers) {
    const current = groupedScores.get(answer.question.topicId) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    groupedScores.set(answer.question.topicId, current);
  }
  await onAttemptFinished(centerId, studentId, {
    attemptId: persisted.attempt.id,
    topicScores: [...groupedScores].map(([topicId, score]) => ({
      topicId,
      score: Math.round((score.correct / score.total) * 100),
    })),
  });

  return {
    attemptId: persisted.attempt.id,
    score: analysis.score,
    correct: analysis.correct,
    total: analysis.total,
    xpEarned: analysis.xpEarned,
    gaps:
      persisted.gap && analysis.gap
        ? [
            {
              topicId: test.topicId,
              topicTitle: test.topic.title,
              rootTopicId: root?.id ?? null,
              rootTopicTitle: root?.title ?? null,
              confidence: analysis.gap.confidence,
              explanation,
            },
          ]
        : [],
    nextSteps:
      persisted.nextStep && instruction
        ? [
            {
              id: persisted.nextStep.id,
              topicId: test.topicId,
              topicTitle: test.topic.title,
              rootTopicId: root?.id ?? null,
              rootTopicTitle: root?.title ?? null,
              instruction,
              material: material
                ? { id: material.id, title: material.title, url: material.url, kind: material.kind }
                : null,
              status: "pending",
              createdAt: persisted.nextStep.createdAt.toISOString(),
            },
          ]
        : [],
  };
}
