import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AnswerInterviewBody, StartInterviewBody } from "@zexn/shared";
import {
  getInterviewTracks,
  getInterviewSkills,
  getStudentInterviews,
  startInterview,
  getInterviewSession,
  answerInterview,
  abandonInterview,
  getTeacherStudentInterviews,
} from "./interview.api";

export const interviewKeys = {
  all: ["interviews"] as const,
  tracks: () => [...interviewKeys.all, "tracks"] as const,
  skills: () => [...interviewKeys.all, "skills"] as const,
  studentList: () => [...interviewKeys.all, "student-list"] as const,
  session: (id: string) => [...interviewKeys.all, "session", id] as const,
  teacherList: (studentId: string) => [...interviewKeys.all, "teacher", studentId] as const,
};

export function useInterviewTracks() {
  return useQuery({
    queryKey: interviewKeys.tracks(),
    queryFn: getInterviewTracks,
  });
}

export function useInterviewSkills() {
  return useQuery({
    queryKey: interviewKeys.skills(),
    queryFn: getInterviewSkills,
  });
}

export function useStudentInterviews() {
  return useQuery({
    queryKey: interviewKeys.studentList(),
    queryFn: getStudentInterviews,
  });
}

export function useInterviewSession(sessionId: string) {
  return useQuery({
    queryKey: interviewKeys.session(sessionId),
    queryFn: () => getInterviewSession(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useStartInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: StartInterviewBody) => startInterview(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: interviewKeys.studentList() });
      void queryClient.invalidateQueries({ queryKey: interviewKeys.tracks() });
      void queryClient.invalidateQueries({ queryKey: interviewKeys.skills() });
    },
  });
}

export function useAnswerInterview(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AnswerInterviewBody) => answerInterview(sessionId, body),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(interviewKeys.session(sessionId), updatedSession);
      void queryClient.invalidateQueries({ queryKey: interviewKeys.studentList() });
    },
  });
}

export function useAbandonInterview(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => abandonInterview(sessionId),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(interviewKeys.session(sessionId), updatedSession);
      void queryClient.invalidateQueries({ queryKey: interviewKeys.studentList() });
    },
  });
}

export function useTeacherStudentInterviews(studentId: string) {
  return useQuery({
    queryKey: interviewKeys.teacherList(studentId),
    queryFn: () => getTeacherStudentInterviews(studentId),
    enabled: Boolean(studentId),
  });
}
