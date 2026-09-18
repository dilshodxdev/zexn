import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "./health.api";

/** Query key'lar feature ichida markazlashadi: invalidate qilish oson. */
export const healthKeys = {
  all: ["health"] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });
}
