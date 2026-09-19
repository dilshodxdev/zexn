import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TestAiPromptBody, UpdateAiSettingsBody } from "@zexn/shared";
import { getAiSettings, testAiPrompt, updateAiSettings, type SettingsScope } from "./settings.api";

export const settingsKeys = {
  all: ["settings"] as const,
  ai: (scope: SettingsScope) => [...settingsKeys.all, "ai", scope] as const,
};

export function useAiSettings(scope: SettingsScope) {
  return useQuery({
    queryKey: settingsKeys.ai(scope),
    queryFn: () => getAiSettings(scope),
  });
}

export function useUpdateAiSettings(scope: SettingsScope) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAiSettingsBody) => updateAiSettings(scope, body),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.ai(scope), updatedSettings);
    },
  });
}

export function useTestAiPrompt(scope: SettingsScope) {
  return useMutation({
    mutationFn: (body: TestAiPromptBody) => testAiPrompt(scope, body),
  });
}
