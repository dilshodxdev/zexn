import { z } from "zod";
import { api } from "@/lib/api";
import {
  interviewTrackInfoSchema,
  interviewSkillSchema,
  interviewSessionSchema,
  interviewListItemSchema,
  type InterviewTrackInfo,
  type InterviewSkill,
  type InterviewSession,
  type InterviewListItem,
  type StartInterviewBody,
  type AnswerInterviewBody,
} from "@zexn/shared";
import {
  fixtureGetTracks,
  fixtureGetSkills,
  fixtureGetStudentInterviews,
  fixtureStartInterview,
  fixtureGetInterviewSession,
  fixtureAnswerInterview,
  fixtureAbandonInterview,
  fixtureGetTeacherStudentInterviews,
} from "./interview.fixture";

export const isInterviewFixtureEnabled = import.meta.env.VITE_INTERVIEW_FIXTURE === "true";

export async function getInterviewTracks(): Promise<InterviewTrackInfo[]> {
  if (isInterviewFixtureEnabled) {
    return fixtureGetTracks();
  }
  const { data } = await api.get<InterviewTrackInfo[]>("/student/interviews/tracks");
  return z.array(interviewTrackInfoSchema).parse(data);
}

export async function getInterviewSkills(): Promise<InterviewSkill[]> {
  if (isInterviewFixtureEnabled) {
    return fixtureGetSkills();
  }
  const { data } = await api.get<InterviewSkill[]>("/student/interviews/skills");
  return z.array(interviewSkillSchema).parse(data);
}

export async function getStudentInterviews(): Promise<InterviewListItem[]> {
  if (isInterviewFixtureEnabled) {
    return fixtureGetStudentInterviews();
  }
  const { data } = await api.get<InterviewListItem[]>("/student/interviews");
  return z.array(interviewListItemSchema).parse(data);
}

export async function startInterview(body: StartInterviewBody): Promise<InterviewSession> {
  if (isInterviewFixtureEnabled) {
    return fixtureStartInterview(body);
  }
  const { data } = await api.post<InterviewSession>("/student/interviews", body);
  return interviewSessionSchema.parse(data);
}

export async function getInterviewSession(sessionId: string): Promise<InterviewSession> {
  if (isInterviewFixtureEnabled) {
    return fixtureGetInterviewSession(sessionId);
  }
  const { data } = await api.get<InterviewSession>(`/student/interviews/${sessionId}`);
  return interviewSessionSchema.parse(data);
}

export async function answerInterview(
  sessionId: string,
  body: AnswerInterviewBody,
): Promise<InterviewSession> {
  if (isInterviewFixtureEnabled) {
    return fixtureAnswerInterview(sessionId, body);
  }
  const { data } = await api.post<InterviewSession>(
    `/student/interviews/${sessionId}/answer`,
    body,
  );
  return interviewSessionSchema.parse(data);
}

export async function abandonInterview(sessionId: string): Promise<InterviewSession> {
  if (isInterviewFixtureEnabled) {
    return fixtureAbandonInterview(sessionId);
  }
  const { data } = await api.post<InterviewSession>(`/student/interviews/${sessionId}/abandon`);
  return interviewSessionSchema.parse(data);
}

export async function getTeacherStudentInterviews(studentId: string): Promise<InterviewListItem[]> {
  if (isInterviewFixtureEnabled) {
    return fixtureGetTeacherStudentInterviews(studentId);
  }
  const { data } = await api.get<InterviewListItem[]>(`/digital-twin/${studentId}/interviews`);
  return z.array(interviewListItemSchema).parse(data);
}
