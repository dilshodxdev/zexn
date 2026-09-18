import { describe, expect, it } from "vitest";
import { analyzeAttempt, type AnalysisQuestion } from "./analysis.service.js";

const topicId = "topic";

function questions(correct: number, total = 5): AnalysisQuestion[] {
  return Array.from({ length: total }, (_, index) => ({
    questionId: `question-${index}`,
    topicId,
    isCorrect: index < correct,
  }));
}

function analyze(prerequisites: string[], mastery: Array<[string, number | null]>, correct = 2) {
  return analyzeAttempt({
    topicId,
    questions: questions(correct),
    prerequisiteGraph: new Map([[topicId, prerequisites]]),
    mastery: new Map(mastery),
  });
}

describe("analyzeAttempt", () => {
  it("70 yoki undan yuqori natijada gap yaratmaydi", () => {
    expect(analyze(["prerequisite"], [["prerequisite", 20]], 4)).toMatchObject({
      score: 80,
      gap: null,
    });
  });

  it("mastery 40 bo'lgan prerequisite'ni ildiz deb topadi", () => {
    expect(analyze(["prerequisite"], [["prerequisite", 40]]).gap).toEqual({
      rootTopicId: "prerequisite",
      confidence: 0.9,
    });
  });

  it("barcha prerequisite o'zlashtirilgan bo'lsa ildizni joriy mavzuda qoldiradi", () => {
    expect(
      analyze(
        ["first", "second"],
        [
          ["first", 70],
          ["second", 90],
        ],
      ).gap,
    ).toEqual({
      rootTopicId: null,
      confidence: 0.6,
    });
  });

  it("urinilmagan prerequisite'ni ildiz deb topadi", () => {
    expect(analyze(["prerequisite"], [["prerequisite", null]]).gap).toEqual({
      rootTopicId: "prerequisite",
      confidence: 0.5,
    });
  });

  it("ikki prerequisite orasidan mastery eng pastini tanlaydi", () => {
    expect(
      analyze(
        ["first", "second"],
        [
          ["first", 60],
          ["second", 30],
        ],
      ).gap,
    ).toEqual({
      rootTopicId: "second",
      confidence: 0.9,
    });
  });
});
