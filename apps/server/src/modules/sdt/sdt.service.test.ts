import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyEvidence } from "./mastery.js";
import { detectPatterns } from "./pattern-detector.js";
import * as sdtRepository from "./sdt.repository.js";
import * as sdtService from "./sdt.service.js";

vi.mock("./sdt.repository.js", () => ({
  findStudent: vi.fn(),
  findActiveCourse: vi.fn(),
  findAssignment: vi.fn(),
  findSkillsByIds: vi.fn(),
  findSkillsByTopicIds: vi.fn(),
  findPatternSkills: vi.fn(),
  findClassDigitalTwinData: vi.fn(),
  createManualNextStep: vi.fn(),
  assignNextStep: vi.fn(),
  createTeacherNote: vi.fn(),
  updateDigitalTwin: vi.fn(),
  generateNextSteps: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("mastery", () => {
  it("oddiy va maqsadli dalil og'irligini qo'llaydi", () => {
    expect(applyEvidence({ oldMastery: 42, attempts: 3, evidence: 30 })).toBe(38);
    expect(applyEvidence({ oldMastery: 38, attempts: 4, evidence: 90, targeted: true })).toBe(59);
  });
});

describe("pattern detector", () => {
  it("to'g'ridan-to'g'ri state mutatsiyasini topadi", () => {
    expect(detectPatterns('const u = user; u.name = "Namur"; setUser(u);')).toContain(
      "DIRECT_STATE_MUTATION",
    );
  });

  it("map ichidagi key yo'qligini topadi", () => {
    expect(detectPatterns("items.map(item => <Card name={item.name} />)")).toContain(
      "MISSING_KEY_PROP",
    );
  });

  it("index key sifatida ishlatilganini topadi", () => {
    expect(detectPatterns("items.map((item, index) => <Card key={index} />)")).toContain(
      "INDEX_AS_KEY",
    );
  });

  it("useEffect dependency ro'yxati yo'qligini topadi", () => {
    expect(detectPatterns("useEffect(() => { loadData(); })")).toContain("MISSING_EFFECT_DEPS");
  });

  it("raqam && bilan render qilinganini topadi", () => {
    expect(detectPatterns("return <div>{items.length && <List />}</div>")).toContain(
      "NUMBER_AND_RENDER",
    );
  });
});

describe("SDT tenant va pipeline", () => {
  it("boshqa markaz o'quvchisi uchun 404 qaytaradi", async () => {
    vi.mocked(sdtRepository.findStudent).mockResolvedValue(null);
    vi.mocked(sdtRepository.findActiveCourse).mockResolvedValue({
      id: "course-1",
      title: "React",
    });

    await expect(sdtService.getDigitalTwin("foreign-center", "student-1")).rejects.toMatchObject({
      statusCode: 404,
      code: "NOT_FOUND",
    });
    expect(sdtRepository.findStudent).toHaveBeenCalledWith("foreign-center", "student-1");
  });

  it("biriktirilgan next step qayta yuborilsa 409 qaytaradi", async () => {
    vi.mocked(sdtRepository.assignNextStep).mockResolvedValue({ kind: "conflict" });

    await expect(
      sdtService.assignNextStep("center-1", "student-1", "step-1", "teacher-1", { dueInDays: 2 }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
  });

  it("sinf ko'rinishida xavfdagi o'quvchini birinchi chiqaradi", async () => {
    const now = new Date("2026-09-19T08:00:00.000Z");
    const skill = {
      id: "skill-1",
      key: "state-immutability",
      name: "State immutability",
      description: "Immutable state",
      topicId: "topic-1",
      order: 7,
      remediationTitle: "Mashq",
      remediationDescription: "Mashq tavsifi",
    };
    vi.mocked(sdtRepository.findClassDigitalTwinData).mockResolvedValue({
      memberships: [
        { user: { id: "student-safe", fullName: "Ali", login: "ali" } },
        { user: { id: "student-risk", fullName: "Vali", login: "vali" } },
      ],
      studentSkills: [
        {
          id: "student-skill-safe",
          centerId: "center-1",
          studentId: "student-safe",
          skillId: "skill-1",
          masteryScore: 80,
          confidence: 0.8,
          attempts: 4,
          correctAttempts: 4,
          lastActivityAt: now,
          updatedAt: now,
          skill,
        },
        {
          id: "student-skill-risk",
          centerId: "center-1",
          studentId: "student-risk",
          skillId: "skill-1",
          masteryScore: 40,
          confidence: 0.4,
          attempts: 2,
          correctAttempts: 0,
          lastActivityAt: now,
          updatedAt: now,
          skill,
        },
      ],
      studentPatterns: [],
    });

    const result = await sdtService.getClassDigitalTwin("center-1");

    expect(result.students.map((student) => student.id)).toEqual(["student-risk", "student-safe"]);
    expect(result.studentsAtRisk).toBe(1);
  });

  it("toza review patternni yechish va next stepni tugatish inputini yuboradi", async () => {
    vi.mocked(sdtRepository.findAssignment).mockResolvedValue({
      id: "assignment-1",
      title: "State ni immutable yangilash",
      topicId: "topic-1",
      skillId: "skill-1",
      targetStudentId: "student-1",
    });
    vi.mocked(sdtRepository.findSkillsByIds).mockResolvedValue([
      {
        id: "skill-1",
        key: "state-immutability",
        name: "State immutability",
        description: "Immutable state",
        topicId: "topic-1",
        order: 7,
        remediationTitle: "Mashq",
        remediationDescription: "Mashq tavsifi",
        topic: {
          id: "topic-1",
          subjectId: "subject-1",
          title: "Obyekt va massiv state",
          slug: "obyekt-massiv-state",
          order: 11,
          description: "State",
        },
      },
    ]);
    vi.mocked(sdtRepository.findPatternSkills).mockResolvedValue([]);
    vi.mocked(sdtRepository.updateDigitalTwin).mockResolvedValue();

    await sdtService.onSubmissionReviewed("center-1", "student-1", {
      submissionId: "submission-1",
      assignmentId: "assignment-1",
      content: "setUser({ ...user, name: 'Namur' });",
      score: 90,
      skillId: "skill-1",
      topicId: "topic-1",
      targeted: true,
    });

    expect(sdtRepository.updateDigitalTwin).toHaveBeenCalledWith(
      "center-1",
      "student-1",
      expect.objectContaining({
        detectedPatternCodes: [],
        cleanSkillIds: ["skill-1"],
        completeNextStepAssignmentId: "assignment-1",
      }),
    );
  });
});
