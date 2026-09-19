import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SendMentorMessageBody } from "@zexn/shared";
import { getMentorMessages, sendMentorMessage } from "./mentor.api";

export function useMentorMessages(limit = 50) {
  return useQuery({
    queryKey: ["student", "mentor", "messages", limit],
    queryFn: () => getMentorMessages(limit),
  });
}

export function useSendMentorMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMentorMessageBody) => sendMentorMessage(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["student", "mentor", "messages"] });
    },
  });
}
