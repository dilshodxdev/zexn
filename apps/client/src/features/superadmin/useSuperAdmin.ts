import { useQuery } from "@tanstack/react-query";
import { getSuperAdminOverview } from "./superadmin.api";

export const superAdminKeys = {
  all: ["superadmin"] as const,
  overview: () => [...superAdminKeys.all, "overview"] as const,
};

export function useSuperAdminOverview() {
  return useQuery({
    queryKey: superAdminKeys.overview(),
    queryFn: getSuperAdminOverview,
  });
}
