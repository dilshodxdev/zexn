import { beforeEach, describe, expect, it, vi } from "vitest";
import * as assignmentRepository from "./assignments.repository.js";
import * as assignmentService from "./assignments.service.js";

vi.mock("./assignments.repository.js", () => ({
  findManageDetail: vi.fn(),
  findSubmissionContext: vi.fn(),
  reviewSubmission: vi.fn(),
  findStudentAssignment: vi.fn(),
  submitStudentSubmission: vi.fn(),
}));

const now = new Date("2026-09-18T08:00:00.000Z");

function submission(status: "IN_PROGRESS" | "SUBMITTED" | "DONE") {
  return {
    id: "submission-1",
    centerId: "center-2",
    assignmentId: "assignment-1",
    studentId: "student-1",
    status,
    progress: status === "DONE" ? 100 : 40,
    content: "Yechim",
    score: status === "DONE" ? 90 : null,
    feedback: null,
    submittedAt: status === "IN_PROGRESS" ? null : now,
    reviewedAt: status === "DONE" ? now : null,
    reviewedByUserId: status === "DONE" ? "teacher-1" : null,
    createdAt: now,
    updatedAt: now,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("assignments service tenant va holat himoyasi", () => {
  it("boshqa centerId dagi manage detail uchun 404 qaytaradi", async () => {
    vi.mocked(assignmentRepository.findManageDetail).mockResolvedValue({
      assignment: null,
      students: [],
      submissions: [],
    });

    await expect(
      assignmentService.getManageDetail("center-foreign", "assignment-1"),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    expect(assignmentRepository.findManageDetail).toHaveBeenCalledWith(
      "center-foreign",
      "assignment-1",
    );
  });

  it("IN_PROGRESS submission review qilinsa 409 qaytaradi", async () => {
    vi.mocked(assignmentRepository.findSubmissionContext).mockResolvedValue({
      assignment: { id: "assignment-1" },
      student: { id: "student-1", fullName: "Oquvchi", login: "student" },
      submission: submission("IN_PROGRESS"),
    });

    await expect(
      assignmentService.reviewSubmission("center-2", "assignment-1", "student-1", "teacher-1", {
        decision: "accept",
        score: 85,
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
    expect(assignmentRepository.reviewSubmission).not.toHaveBeenCalled();
  });

  it("DONE submission qayta topshirilsa 409 qaytaradi", async () => {
    vi.mocked(assignmentRepository.findStudentAssignment).mockResolvedValue({
      id: "assignment-1",
      centerId: "center-2",
      topicId: null,
      title: "Vazifa",
      description: "Tavsif",
      difficulty: "EASY",
      dueAt: now,
      resources: [],
      createdByUserId: "teacher-1",
      isActive: true,
      createdAt: now,
      updatedAt: now,
      topic: null,
      submissions: [submission("DONE")],
    });

    await expect(
      assignmentService.submitAssignment("center-2", "student-1", "assignment-1", {
        content: "Yangi yechim",
      }),
    ).rejects.toMatchObject({ statusCode: 409, code: "CONFLICT" });
    expect(assignmentRepository.submitStudentSubmission).not.toHaveBeenCalled();
  });
});
