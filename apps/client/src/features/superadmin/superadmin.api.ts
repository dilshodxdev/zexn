import { api } from "@/lib/api";
import { superAdminOverviewSchema, type SuperAdminOverview } from "@zexn/shared";
import { superAdminOverviewFixture } from "@/features/settings/settings.fixture";

const isFixture = import.meta.env.VITE_SETTINGS_FIXTURE === "true";

export async function getSuperAdminOverview(): Promise<SuperAdminOverview> {
  if (isFixture) {
    return Promise.resolve(superAdminOverviewFixture);
  }

  const { data } = await api.get("/superadmin/overview");
  return superAdminOverviewSchema.parse(data);
}
