import { QueryClient } from "@tanstack/react-query";

/** Server state uchun bitta client. Zustand faqat client state (UI, sessiya). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
