import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAssignmentBody,
  ReviewSubmissionBody,
  SaveSubmissionBody,
  UpdateAssignmentBody,
} from "@zexn/shared";
import {
  createAssignment,
  getAssignmentTopics,
  getManageAssignmentDetail,
  getManageAssignments,
  getStudentAssignmentDetail,
  getStudentAssignments,
  getSubmissionDetail,
  reviewSubmission,
  saveStudentSubmission,
  startStudentAssignment,
  submitStudentAssignment,
  updateAssignment,
} from "./assignments.api";

export const assignmentKeys = {
  all: ["assignments"] as const,
  studentList: () => [...assignmentKeys.all, "student", "list"] as const,
  studentDetail: (id: string) => [...assignmentKeys.all, "student", "detail", id] as const,
  topics: () => [...assignmentKeys.all, "topics"] as const,
  manageList: () => [...assignmentKeys.all, "manage", "list"] as const,
  manageDetail: (id: string) => [...assignmentKeys.all, "manage", "detail", id] as const,
  submissionDetail: (assignmentId: string, studentId: string) =>
    [...assignmentKeys.all, "manage", "submission", assignmentId, studentId] as const,
};

/* ---------- Student Hooks ---------- */

export function useStudentAssignments() {
  return useQuery({
    queryKey: assignmentKeys.studentList(),
    queryFn: getStudentAssignments,
  });
}

export function useStudentAssignmentDetail(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.studentDetail(assignmentId),
    queryFn: () => getStudentAssignmentDetail(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useStartStudentAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assignmentId: string) => startStudentAssignment(assignmentId),
    onSuccess: (_data, assignmentId) => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentDetail(assignmentId) });
    },
  });
}

export function useSaveStudentSubmission(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaveSubmissionBody) => saveStudentSubmission(assignmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentDetail(assignmentId) });
    },
  });
}

export function useSubmitStudentAssignment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => submitStudentAssignment(assignmentId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentDetail(assignmentId) });
      void queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
    },
  });
}

/* ---------- Manage (Teacher / Admin) Hooks ---------- */

export function useAssignmentTopics() {
  return useQuery({
    queryKey: assignmentKeys.topics(),
    queryFn: getAssignmentTopics,
  });
}

export function useManageAssignments() {
  return useQuery({
    queryKey: assignmentKeys.manageList(),
    queryFn: getManageAssignments,
  });
}

export function useManageAssignmentDetail(assignmentId: string) {
  return useQuery({
    queryKey: assignmentKeys.manageDetail(assignmentId),
    queryFn: () => getManageAssignmentDetail(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useSubmissionDetail(assignmentId: string, studentId: string, enabled = true) {
  return useQuery({
    queryKey: assignmentKeys.submissionDetail(assignmentId, studentId),
    queryFn: () => getSubmissionDetail(assignmentId, studentId),
    enabled: enabled && Boolean(assignmentId) && Boolean(studentId),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAssignmentBody) => createAssignment(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.manageList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
    },
  });
}

export function useUpdateAssignment(assignmentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAssignmentBody) => updateAssignment(assignmentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.manageList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.manageDetail(assignmentId) });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
    },
  });
}

export function useReviewSubmission(assignmentId: string, studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewSubmissionBody) => reviewSubmission(assignmentId, studentId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.manageDetail(assignmentId) });
      void queryClient.invalidateQueries({
        queryKey: assignmentKeys.submissionDetail(assignmentId, studentId),
      });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.manageList() });
      void queryClient.invalidateQueries({ queryKey: assignmentKeys.studentList() });
      void queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
    },
  });
}
