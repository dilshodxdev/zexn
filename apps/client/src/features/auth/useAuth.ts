import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginBody, RegisterCenterBody, SelectCenterBody } from "@zexn/shared";
import { fetchMe, login, logout, registerCenter, selectCenter } from "./auth.api";
import { useAuthStore } from "@/stores/authStore";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (body: LoginBody) => login(body),
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegisterCenter() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (body: RegisterCenterBody) => registerCenter(body),
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useSelectCenter() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (body: SelectCenterBody) => selectCenter(body),
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clear = useAuthStore((state) => state.clear);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
  });
}

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: fetchMe,
    enabled: Boolean(accessToken),
  });
}
