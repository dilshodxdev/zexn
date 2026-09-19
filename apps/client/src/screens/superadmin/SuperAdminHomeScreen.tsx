import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  Building2,
  Cpu,
  GraduationCap,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { Badge, Button, Card, EmptyState, ErrorState, Spinner } from "@/components/ui";
import { useSuperAdminOverview } from "@/features/superadmin/useSuperAdmin";
import { useAuthStore } from "@/stores/authStore";
import { formatDateTime } from "@/lib/utils";
import { ROUTES } from "@/routes";

export function SuperAdminHomeScreen() {
  const { t } = useTranslation("student");
  const { user } = useAuthStore();
  const { data: overview, isLoading, isError, refetch } = useSuperAdminOverview();

  const firstName = (user?.fullName ?? "").trim().split(/\s+/)[0] || "Super Admin";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState message={t("teacher.dashboard.errorLoad")} onRetry={() => void refetch()} />
      </div>
    );
  }

  const statCards = [
    {
      label: t("superadmin.statCenters"),
      sub: t("superadmin.statCentersSub", { active: overview.activeCenters }),
      value: overview.centers,
      icon: Building2,
      iconClass: "bg-brand-soft text-brand",
    },
    {
      label: t("superadmin.statUsers"),
      sub: t("superadmin.statUsersSub"),
      value: overview.users,
      icon: Users,
      iconClass: "bg-info-soft text-info",
    },
    {
      label: t("superadmin.statStudents"),
      sub: t("superadmin.statStudentsSub"),
      value: overview.students,
      icon: GraduationCap,
      iconClass: "bg-warn-soft text-warn",
    },
    {
      label: t("superadmin.statTeachers"),
      sub: t("superadmin.statTeachersSub"),
      value: overview.teachers,
      icon: UserCheck,
      iconClass: "bg-ok-soft text-ok",
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Salom header */}
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              {t("superadmin.welcome", { name: firstName })}
            </h1>
            <p className="text-xs text-muted mt-0.5">{t("superadmin.subtitle")}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Chap ustun */}
          <div className="min-w-0 space-y-5">
            {/* Stat kartalar */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-text">{t("superadmin.statsTitle")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statCards.map((stat, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{stat.label}</p>
                        <p className="truncate text-[11px] text-muted">{stat.sub}</p>
                      </div>
                    </div>
                    <p className="mt-3 font-mono text-2xl font-bold leading-none text-text">
                      {stat.value}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* So'nggi markazlar jadvali */}
            <Card className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-sm font-bold text-text">{t("superadmin.centersTableTitle")}</h3>
                <span className="text-xs font-mono text-muted">
                  {overview.recentCenters.length} ta
                </span>
              </div>

              {overview.recentCenters.length === 0 ? (
                <EmptyState title={t("superadmin.emptyCenters")} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-line text-muted uppercase font-semibold text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">{t("superadmin.colCenterName")}</th>
                        <th className="py-2.5 px-3">{t("superadmin.colSlug")}</th>
                        <th className="py-2.5 px-3">{t("superadmin.colStudents")}</th>
                        <th className="py-2.5 px-3">{t("superadmin.colTeachers")}</th>
                        <th className="py-2.5 px-3">{t("superadmin.colStatus")}</th>
                        <th className="py-2.5 px-3">{t("superadmin.colCreatedAt")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line font-medium text-text">
                      {overview.recentCenters.map((center) => (
                        <tr key={center.id} className="hover:bg-surface-alt transition-colors">
                          <td className="py-3 px-3 font-semibold text-text">{center.name}</td>
                          <td className="py-3 px-3 font-mono text-muted">/{center.slug}</td>
                          <td className="py-3 px-3 font-mono">{center.studentCount}</td>
                          <td className="py-3 px-3 font-mono">{center.teacherCount}</td>
                          <td className="py-3 px-3">
                            <Badge
                              tone={center.isActive ? "ok" : "neutral"}
                              className="text-[10px]"
                            >
                              {center.isActive
                                ? t("teacher.dashboard.statusActive")
                                : t("teacher.dashboard.statusClosed")}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-muted">
                            {formatDateTime(center.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* O'ng ustun: Promo + AI provayder kartasi */}
          <aside className="space-y-5">
            {/* Promo karta */}
            <div className="relative overflow-hidden rounded-card bg-brand p-5 text-bg shadow-card">
              <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-bg text-brand">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-90">
                <Sparkles className="h-4 w-4" />
                <span>AI Tizim</span>
              </div>
              <h3 className="pr-8 text-base font-bold leading-tight">
                {t("superadmin.promo.sideTitle")}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed opacity-85">
                {t("superadmin.promo.sideText")}
              </p>
              <div className="mt-4">
                <Link to={ROUTES.superadminSettings}>
                  <Button
                    size="sm"
                    className="bg-bg text-text hover:bg-surface border-none shadow-sm min-h-[36px]"
                  >
                    Sozlamalarga o'tish
                  </Button>
                </Link>
              </div>
            </div>

            {/* AI provayder holati kartasi */}
            <Card className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">{t("superadmin.aiStatusTitle")}</h3>
                <Cpu className="h-4 w-4 text-brand" />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-alt p-3">
                <span className="text-xs text-muted">{t("superadmin.aiProviderLabel")}</span>
                <Badge
                  tone={overview.aiProvider === "deepseek" ? "brand" : "neutral"}
                  className="text-xs font-bold"
                >
                  {overview.aiProvider === "deepseek" ? "DeepSeek V3" : "Mock Provayder"}
                </Badge>
              </div>

              <div className="pt-1">
                <Link to={ROUTES.superadminSettings} className="block">
                  <Button variant="secondary" size="sm" fullWidth className="min-h-[44px]">
                    System promptni boshqarish
                  </Button>
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
