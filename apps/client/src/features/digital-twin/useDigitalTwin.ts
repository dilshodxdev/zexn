import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AssignNextStepBody, CreateTwinNextStepBody, SendTwinNoteBody } from "@zexn/shared";
import {
  assignNextStep,
  createTwinNextStep,
  getClassDigitalTwin,
  getDigitalTwin,
  getStudentProgress,
  sendTwinNote,
} from "./digitalTwin.api";

export const twinKeys = {
  all: ["digital-twin"] as const,
  class: () => [...twinKeys.all, "class"] as const,
  detail: (studentId: string) => [...twinKeys.all, "detail", studentId] as const,
  progress: (studentId: string) => [...twinKeys.all, "progress", studentId] as const,
};

export function useClassDigitalTwin() {
  return useQuery({
    queryKey: twinKeys.class(),
    queryFn: getClassDigitalTwin,
  });
}

export function useDigitalTwin(studentId: string) {
  return useQuery({
    queryKey: twinKeys.detail(studentId),
    queryFn: () => getDigitalTwin(studentId),
    enabled: Boolean(studentId),
  });
}

export function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: twinKeys.progress(studentId),
    queryFn: () => getStudentProgress(studentId),
    enabled: Boolean(studentId),
  });
}

export function useAssignNextStep(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nextStepId, body }: { nextStepId: string; body?: AssignNextStepBody }) =>
      assignNextStep(studentId, nextStepId, body),
    onSuccess: (updatedTwin) => {
      queryClient.setQueryData(twinKeys.detail(studentId), updatedTwin);
    },
  });
}

export function useCreateNextStep(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTwinNextStepBody) => createTwinNextStep(studentId, body),
    onSuccess: (updatedTwin) => {
      queryClient.setQueryData(twinKeys.detail(studentId), updatedTwin);
    },
  });
}

export function useSendNote(studentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendTwinNoteBody) => sendTwinNote(studentId, body),
    onSuccess: (updatedTwin) => {
      queryClient.setQueryData(twinKeys.detail(studentId), updatedTwin);
    },
  });
}
