import { api } from "@/lib/api";
import type { MentorMessage, SendMentorMessageBody } from "@zexn/shared";

export async function getMentorMessages(limit = 50): Promise<MentorMessage[]> {
  const { data } = await api.get<MentorMessage[]>(`/student/mentor/messages?limit=${limit}`);
  return data;
}

export async function sendMentorMessage(
  body: SendMentorMessageBody,
): Promise<{ student: MentorMessage; mentor: MentorMessage }> {
  const { data } = await api.post<{ student: MentorMessage; mentor: MentorMessage }>(
    "/student/mentor/messages",
    body,
  );
  return data;
}
