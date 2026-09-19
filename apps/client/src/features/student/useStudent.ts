import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SubmitAttemptBody } from "@zexn/shared";
import {
  getStudentOverview,
  getStudentTests,
  getTestDetail,
  getTopicDetail,
  markNextStepDone,
  submitTestAttempt,
} from "./student.api";

export function useStudentOverview() {
  return useQuery({
    queryKey: ["student", "overview"],
    queryFn: getStudentOverview,
  });
}

export function useTopicDetail(topicId: string) {
  return useQuery({
    queryKey: ["student", "topics", topicId],
    queryFn: () => getTopicDetail(topicId),
    enabled: Boolean(topicId),
  });
}

export function useStudentTests() {
  return useQuery({
    queryKey: ["student", "tests"],
    queryFn: getStudentTests,
  });
}

export function useTestDetail(testId: string) {
  return useQuery({
    queryKey: ["student", "tests", testId],
    queryFn: () => getTestDetail(testId),
    enabled: Boolean(testId),
  });
}

export function useSubmitTestAttempt(testId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitAttemptBody) => submitTestAttempt(testId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
      void queryClient.invalidateQueries({ queryKey: ["student", "tests"] });
    },
  });
}

export function useMarkNextStepDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNextStepDone(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student", "overview"] });
    },
  });
}
