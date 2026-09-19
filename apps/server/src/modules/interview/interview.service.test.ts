import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAiProvider } from "../../lib/ai/index.js";
import * as sdtService from "../sdt/sdt.service.js";
import * as settingsRepository from "../settings/settings.repository.js";
import * as interviewRepository from "./interview.repository.js";
import * as interviewService from "./interview.service.js";

vi.mock("./interview.repository.js", () => ({
  findInterviewSkills: vi.fn(),
  findDoneTrackSessions: vi.fn(),
  findSkill: vi.fn(),
  findActiveSession: vi.fn(),
  createSession: vi.fn(),
  findSession: vi.fn(),
  findStudentSessions: vi.fn(),
  saveTurns: vi.fn(),
  finishSession: vi.fn(),
  setMasteryAfter: vi.fn(),
  findStudentMastery: vi.fn(),
  abandonSession: vi.fn(),
  findActiveStudent: vi.fn(),
}));
vi.mock("../../lib/ai/index.js", () => ({ createAiProvider: vi.fn() }));
vi.mock("../sdt/sdt.service.js", () => ({ updateStudentDigitalTwin: vi.fn() }));
vi.mock("../settings/settings.repository.js", () => ({
  findPlatformPrompt: vi.fn(),
  findCenterPrompt: vi.fn(),
}));
vi.mock("../settings/settings.service.js", () => ({
  DEFAULT_MENTOR_SYSTEM_PROMPT: "Default prompt",
}));

const now = new Date("2026-09-19T09:30:00.000Z");
const skill = {
  id: "skill-1",
  key: "state-immutability",
  name: "State immutability",
  description: "Immutable state",
  topicId: "topic-1",
  order: 7,
  remediationTitle: "Mashq",
  remediationDescription: "Mashq tavsifi",
  topic: { title: "Obyekt va massiv state" },
};
const answeredTurns = [0, 1, 2, 3].map((index) => ({
  index,
  kind: index === 1 || index === 3 ? ("code" as const) : ("theory" as const),
  question: `Savol ${index + 1}`,
  language: index === 1 || index === 3 ? ("tsx" as const) : null,
  starterCode: index === 1 || index === 3 ? "function solution() {\n  // TODO\n}" : null,
  answer: "Spread bilan yangi obyekt yarataman",
  score: 80,
  feedback: "Yaxshi javob",
  modelAnswer: null,
  answeredAt: now.toISOString(),
}));
const pendingTurn = {
  index: 4,
  kind: "theory" as const,
  question: "Savol 5",
  language: null,
  starterCode: null,
  answer: null,
  score: null,
  feedback: null,
  modelAnswer: null,
  answeredAt: null,
};
const session = {
  id: "session-1",
  centerId: "center-1",
  studentId: "student-1",
  skillId: skill.id,
  track: "frontend",
  level: "easy",
  status: "IN_PROGRESS" as const,
  questionCount: 5,
  turns: [...answeredTurns, pendingTurn],
  score: null,
  summary: null,
  strengths: [],
  weaknesses: [],
  masteryBefore: 50,
  masteryAfter: null,
  startedAt: now,
  finishedAt: null,
  updatedAt: now,
  skill,
};

const aiProvider = {
  name: "mock",
  explainRootCause: vi.fn(),
  suggestNextStep: vi.fn(),
  chat: vi.fn(),
  interviewQuestion: vi.fn(),
  interviewEvaluate: vi.fn(),
  interviewSummary: vi.fn(),
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(createAiProvider).mockReturnValue(aiProvider);
  vi.mocked(settingsRepository.findPlatformPrompt).mockResolvedValue("Platform prompt");
  vi.mocked(settingsRepository.findCenterPrompt).mockResolvedValue("Markaz prompt");
});

describe("AI intervyu", () => {
  it("backend uchun skillId yuborilsa 400 qaytaradi", async () => {
    await expect(
      interviewService.startInterview("center-1", "student-1", {
        track: "backend",
        skillId: "skill-1",
      }),
    ).rejects.toMatchObject({ statusCode: 400, code: "VALIDATION_ERROR" });
  });

  it("besh turnning ikkitasi soha tilidagi kod savoli bo'ladi", async () => {
    const fiveTurnSession = {
      ...session,
      status: "DONE" as const,
      turns: [
        ...answeredTurns,
        {
          ...pendingTurn,
          answer: "React state render jarayonini boshqaradi",
          score: 70,
          feedback: "Yaxshi",
          answeredAt: now.toISOString(),
        },
      ],
      score: 78,
      summary: "Yaxshi natija. Mashqni davom ettir.",
      strengths: ["Nazariya"],
      weaknesses: ["Kod"],
      masteryAfter: 58,
      finishedAt: now,
    };
    vi.mocked(interviewRepository.findSession).mockResolvedValue(fiveTurnSession);

    const result = await interviewService.getSession("center-1", "student-1", "session-1");
    const codeTurns = result.turns.filter((turn) => turn.kind === "code");

    expect(codeTurns).toHaveLength(2);
    expect(codeTurns.every((turn) => turn.language === "tsx")).toBe(true);
  });

  it("beshinchi javobdan keyin DONE qiladi va SDT'ni INTERVIEW bilan yangilaydi", async () => {
    const doneSession = {
      ...session,
      status: "DONE" as const,
      turns: [
        ...answeredTurns,
        {
          ...pendingTurn,
          answer: "Spread bilan yangi obyekt yarataman",
          score: 80,
          feedback: "Yaxshi javob",
          answeredAt: now.toISOString(),
        },
      ],
      score: 80,
      summary: "Bilim yaxshi. Amaliyotni davom ettir.",
      strengths: ["Immutable yangilash"],
      weaknesses: [],
      masteryAfter: 59,
      finishedAt: now,
    };
    vi.mocked(interviewRepository.findSession)
      .mockResolvedValueOnce(session)
      .mockResolvedValueOnce(doneSession);
    aiProvider.interviewEvaluate.mockResolvedValue({
      score: 80,
      feedback: "Yaxshi javob",
      modelAnswer: null,
    });
    aiProvider.interviewSummary.mockResolvedValue({
      summary: "Bilim yaxshi. Amaliyotni davom ettir.",
      strengths: ["Immutable yangilash"],
      weaknesses: [],
    });
    vi.mocked(interviewRepository.finishSession).mockResolvedValue({ count: 1 });
    vi.mocked(sdtService.updateStudentDigitalTwin).mockResolvedValue();
    vi.mocked(interviewRepository.findStudentMastery).mockResolvedValue({ masteryScore: 59 });
    vi.mocked(interviewRepository.setMasteryAfter).mockResolvedValue({ count: 1 });

    const result = await interviewService.answerInterview("center-1", "student-1", "session-1", {
      answer: "Spread bilan yangi obyekt yarataman",
    });

    expect(result.status).toBe("DONE");
    expect(sdtService.updateStudentDigitalTwin).toHaveBeenCalledOnce();
    expect(sdtService.updateStudentDigitalTwin).toHaveBeenCalledWith(
      "center-1",
      "student-1",
      expect.objectContaining({ source: "INTERVIEW" }),
    );
  });

  it("tugallanmagan sessiya bo'lsa ikkinchi startga 409 qaytaradi", async () => {
    vi.mocked(interviewRepository.findSkill).mockResolvedValue({
      ...skill,
      studentSkills: [],
    });
    vi.mocked(interviewRepository.findActiveSession).mockResolvedValue({ id: "session-active" });

    await expect(
      interviewService.startInterview("center-1", "student-1", {
        track: "frontend",
        skillId: "skill-1",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "CONFLICT",
      meta: { sessionId: "session-active" },
    });
  });

  it("skillsiz sessiya DONE bo'lganda SDT yangilanmaydi", async () => {
    const backendSession = {
      ...session,
      track: "backend",
      skillId: null,
      skill: null,
      level: "medium",
      masteryBefore: null,
      turns: [
        ...answeredTurns.map((turn) => ({
          ...turn,
          language: turn.kind === "code" ? ("typescript" as const) : null,
        })),
        pendingTurn,
      ],
    };
    const doneBackendSession = {
      ...backendSession,
      status: "DONE" as const,
      turns: [
        ...backendSession.turns.slice(0, 4),
        {
          ...pendingTurn,
          answer: "API auth va validation bilan himoyalanadi",
          score: 65,
          feedback: "Yaxshi",
          answeredAt: now.toISOString(),
        },
      ],
      score: 77,
      summary: "Backend bilimi yaxshi. Kod mashqini davom ettir.",
      strengths: ["API"],
      weaknesses: ["Kod"],
      masteryAfter: null,
      finishedAt: now,
    };
    vi.mocked(interviewRepository.findSession)
      .mockResolvedValueOnce(backendSession)
      .mockResolvedValueOnce(doneBackendSession);
    aiProvider.interviewEvaluate.mockResolvedValue({
      score: 65,
      feedback: "Yaxshi",
      modelAnswer: "Auth va validation ishlating",
    });
    aiProvider.interviewSummary.mockResolvedValue({
      summary: "Backend bilimi yaxshi. Kod mashqini davom ettir.",
      strengths: ["API"],
      weaknesses: ["Kod"],
    });
    vi.mocked(interviewRepository.finishSession).mockResolvedValue({ count: 1 });

    const result = await interviewService.answerInterview("center-1", "student-1", "session-1", {
      answer: "API auth va validation bilan himoyalanadi",
    });

    expect(result.status).toBe("DONE");
    expect(result.result?.masteryAfter).toBeNull();
    expect(sdtService.updateStudentDigitalTwin).not.toHaveBeenCalled();
  });

  it("boshqa markaz sessiyasi uchun 404 qaytaradi", async () => {
    vi.mocked(interviewRepository.findSession).mockResolvedValue(null);

    await expect(
      interviewService.getSession("foreign-center", "student-1", "session-1"),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    expect(interviewRepository.findSession).toHaveBeenCalledWith(
      "foreign-center",
      "student-1",
      "session-1",
    );
  });
});
