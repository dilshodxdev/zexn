import type { AiProvider } from "../../lib/ai/AiProvider.js";
import { MockAiProvider } from "../../lib/ai/MockAiProvider.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../lib/ai/index.js", () => ({ createAiProvider: vi.fn() }));
vi.mock("../settings/settings.repository.js", () => ({
  findPlatformPrompt: vi.fn(),
  findCenterPrompt: vi.fn(),
}));
vi.mock("../settings/settings.service.js", () => ({
  DEFAULT_MENTOR_SYSTEM_PROMPT: "Sen mentor yordamchisan.",
}));
vi.mock("./mentor.repository.js", () => ({
  createMessage: vi.fn(),
  findRecentMessages: vi.fn(),
  completeNextStep: vi.fn(),
}));
vi.mock("./student.repository.js", () => ({
  findStudent: vi.fn(),
  findActiveCourse: vi.fn(),
  findLatestNextStep: vi.fn(),
}));

import { createAiProvider } from "../../lib/ai/index.js";
import * as settingsRepository from "../settings/settings.repository.js";
import { getMessages } from "./mentor.service.js";
import * as mentorRepository from "./mentor.repository.js";
import * as studentRepository from "./student.repository.js";

const centerId = "center-1";
const studentId = "student-1";
type StoredMessage = Awaited<ReturnType<typeof mentorRepository.findRecentMessages>>[number];

const aiProvider: AiProvider = {
  name: "mock",
  explainRootCause: vi.fn(),
  suggestNextStep: vi.fn(),
  chat: vi.fn(),
  interviewQuestion: vi.fn(),
  interviewEvaluate: vi.fn(),
  interviewSummary: vi.fn(),
};

function storedMessage(text: string, role: string = "mentor"): StoredMessage {
  return {
    id: "message-1",
    centerId,
    studentId,
    role,
    text,
    createdAt: new Date(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createAiProvider).mockReturnValue(aiProvider);
  vi.mocked(aiProvider.chat).mockResolvedValue("Salom! Bugun nima o'rganamiz?");
  vi.mocked(studentRepository.findStudent).mockResolvedValue({
    id: studentId,
    fullName: "Ali Valiyev",
  } as Awaited<ReturnType<typeof studentRepository.findStudent>>);
  vi.mocked(studentRepository.findActiveCourse).mockResolvedValue({
    id: "course-1",
    slug: "frontend",
    title: "Frontend",
    isActive: true,
    topics: [],
  } as Awaited<ReturnType<typeof studentRepository.findActiveCourse>>);
  vi.mocked(studentRepository.findLatestNextStep).mockResolvedValue(null);
  vi.mocked(settingsRepository.findPlatformPrompt).mockResolvedValue("Platform prompt");
  vi.mocked(settingsRepository.findCenterPrompt).mockResolvedValue("Markaz prompt");
});

afterEach(() => {
  vi.useRealTimers();
});

describe("mentor greeting", () => {
  it("creates one mentor greeting for an empty chat", async () => {
    const expected =
      "Salom, Ali Valiyev! 👋 Ishlar yaxshimi? Bugun nima o'tamiz - o'zing aytasanmi yoki men taklif qilaymi? (Keyingi qadaming: hozircha keyingi qadam belgilanmagan)";
    const greeting = storedMessage(expected);
    vi.mocked(createAiProvider).mockReturnValue(new MockAiProvider());
    vi.mocked(mentorRepository.findRecentMessages)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([greeting]);
    vi.mocked(mentorRepository.createMessage).mockResolvedValue(greeting);

    const messages = await getMessages(centerId, studentId, 50);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.role).toBe("mentor");
    expect(mentorRepository.createMessage).toHaveBeenCalledTimes(1);
    expect(mentorRepository.createMessage).toHaveBeenCalledWith(
      centerId,
      studentId,
      "mentor",
      expected,
    );
  });

  it("does not create a greeting when today's message exists", async () => {
    const todayMessage = storedMessage("Salom", "student");
    vi.mocked(mentorRepository.findRecentMessages).mockResolvedValue([todayMessage]);

    const messages = await getMessages(centerId, studentId, 50);

    expect(messages).toHaveLength(1);
    expect(mentorRepository.createMessage).not.toHaveBeenCalled();
  });

  it("uses the template when AI times out", async () => {
    const fallback =
      "Salom, Ali Valiyev! 👋 Ishlar yaxshimi? Bugun nima o'tamiz - o'zing aytasanmi yoki men taklif qilaymi? (Keyingi qadaming: hozircha keyingi qadam belgilanmagan)";
    const greeting = storedMessage(fallback);
    vi.mocked(mentorRepository.findRecentMessages)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([greeting]);
    vi.mocked(mentorRepository.createMessage).mockResolvedValue(greeting);
    vi.useFakeTimers();
    vi.mocked(aiProvider.chat).mockImplementation(() => new Promise(() => undefined));

    const pending = getMessages(centerId, studentId, 50);
    await vi.advanceTimersByTimeAsync(8_000);
    const messages = await pending;

    expect(messages[0]?.text).toBe(fallback);
    expect(mentorRepository.createMessage).toHaveBeenCalledWith(
      centerId,
      studentId,
      "mentor",
      fallback,
    );
  });
});
