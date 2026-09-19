import { api } from "@/lib/api";
import type {
  AttemptResult,
  NextStep,
  StudentOverview,
  SubmitAttemptBody,
  TestDetail,
  TestListItem,
  TopicDetail,
} from "@zexn/shared";

export async function getStudentOverview(): Promise<StudentOverview> {
  const { data } = await api.get<StudentOverview>("/student/overview");
  return data;
}

export async function getTopicDetail(topicId: string): Promise<TopicDetail> {
  const { data } = await api.get<TopicDetail>(`/student/topics/${topicId}`);
  return data;
}

export async function getStudentTests(): Promise<TestListItem[]> {
  const { data } = await api.get<TestListItem[]>("/student/tests");
  return data;
}

export async function getTestDetail(testId: string): Promise<TestDetail> {
  const { data } = await api.get<TestDetail>(`/student/tests/${testId}`);
  return data;
}

export async function submitTestAttempt(
  testId: string,
  body: SubmitAttemptBody,
): Promise<AttemptResult> {
  const { data } = await api.post<AttemptResult>(`/student/tests/${testId}/attempts`, body);
  return data;
}

export async function markNextStepDone(id: string): Promise<{ nextStep: NextStep }> {
  const { data } = await api.post<{ nextStep: NextStep }>(`/student/next-steps/${id}/done`);
  return data;
}
