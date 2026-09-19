import { api } from "@/lib/api";
import {
  assignmentManageDetailSchema,
  assignmentManageItemSchema,
  assignmentTopicSchema,
  createAssignmentBodySchema,
  reviewSubmissionBodySchema,
  saveSubmissionBodySchema,
  studentAssignmentDetailSchema,
  studentAssignmentsResponseSchema,
  submissionDetailSchema,
  updateAssignmentBodySchema,
  type AssignmentManageDetail,
  type AssignmentManageItem,
  type AssignmentTopic,
  type CreateAssignmentBody,
  type ReviewSubmissionBody,
  type SaveSubmissionBody,
  type StudentAssignmentDetail,
  type StudentAssignmentsResponse,
  type SubmissionDetail,
  type UpdateAssignmentBody,
} from "@zexn/shared";
import { z } from "zod";

/* ---------- O'quvchi (STUDENT) ---------- */

export async function getStudentAssignments(): Promise<StudentAssignmentsResponse> {
  const { data } = await api.get("/student/assignments");
  return studentAssignmentsResponseSchema.parse(data);
}

export async function getStudentAssignmentDetail(
  assignmentId: string,
): Promise<StudentAssignmentDetail> {
  const { data } = await api.get(`/student/assignments/${assignmentId}`);
  return studentAssignmentDetailSchema.parse(data);
}

export async function startStudentAssignment(
  assignmentId: string,
): Promise<StudentAssignmentDetail> {
  const { data } = await api.post(`/student/assignments/${assignmentId}/start`);
  return studentAssignmentDetailSchema.parse(data);
}

export async function saveStudentSubmission(
  assignmentId: string,
  body: SaveSubmissionBody,
): Promise<StudentAssignmentDetail> {
  const validBody = saveSubmissionBodySchema.parse(body);
  const { data } = await api.patch(`/student/assignments/${assignmentId}/submission`, validBody);
  return studentAssignmentDetailSchema.parse(data);
}

export async function submitStudentAssignment(
  assignmentId: string,
  content: string,
): Promise<StudentAssignmentDetail> {
  const { data } = await api.post(`/student/assignments/${assignmentId}/submit`, { content });
  return studentAssignmentDetailSchema.parse(data);
}

/* ---------- Boshqaruv (TEACHER / CENTER_ADMIN) ---------- */

export async function getAssignmentTopics(): Promise<AssignmentTopic[]> {
  const { data } = await api.get("/assignments/topics");
  return z.array(assignmentTopicSchema).parse(data);
}

export async function getManageAssignments(): Promise<AssignmentManageItem[]> {
  const { data } = await api.get("/assignments");
  return z.array(assignmentManageItemSchema).parse(data);
}

export async function createAssignment(body: CreateAssignmentBody): Promise<AssignmentManageItem> {
  const validBody = createAssignmentBodySchema.parse(body);
  const { data } = await api.post("/assignments", validBody);
  return assignmentManageItemSchema.parse(data);
}

export async function updateAssignment(
  assignmentId: string,
  body: UpdateAssignmentBody,
): Promise<AssignmentManageItem> {
  const validBody = updateAssignmentBodySchema.parse(body);
  const { data } = await api.patch(`/assignments/${assignmentId}`, validBody);
  return assignmentManageItemSchema.parse(data);
}

export async function getManageAssignmentDetail(
  assignmentId: string,
): Promise<AssignmentManageDetail> {
  const { data } = await api.get(`/assignments/${assignmentId}`);
  return assignmentManageDetailSchema.parse(data);
}

export async function getSubmissionDetail(
  assignmentId: string,
  studentId: string,
): Promise<SubmissionDetail> {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions/${studentId}`);
  return submissionDetailSchema.parse(data);
}

export async function reviewSubmission(
  assignmentId: string,
  studentId: string,
  body: ReviewSubmissionBody,
): Promise<SubmissionDetail> {
  const validBody = reviewSubmissionBodySchema.parse(body);
  const { data } = await api.post(
    `/assignments/${assignmentId}/submissions/${studentId}/review`,
    validBody,
  );
  return submissionDetailSchema.parse(data);
}
