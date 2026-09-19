import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Button, EmptyState, ErrorState, Spinner } from "@/components/ui";
import { ActivityChart } from "@/features/teacher-dashboard/ActivityChart";
import { AssignmentsMini } from "@/features/teacher-dashboard/AssignmentsMini";
import { DeadlineCalendar } from "@/features/teacher-dashboard/DeadlineCalendar";
import { PromoCard } from "@/features/teacher-dashboard/PromoCard";
import { RecentAssignments } from "@/features/teacher-dashboard/RecentAssignments";
import { ReviewQueue } from "@/features/teacher-dashboard/ReviewQueue";
import { StatCards } from "@/features/teacher-dashboard/StatCards";
import { useTeacherDashboard } from "@/features/teacher-dashboard/useTeacherDashboard";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

/**
 * O'qituvchi dashboard (Eduplex referensi tartibida). TeacherLayout ichida render bo'ladi (sidebar u yerda).
 * Chap ustun: stat kartalar, faollik chart + tekshirish navbati, vazifalar. O'ng ustun: promo, kalendar, so'nggi vazifalar.
 * Hamma raqam `GET /api/assignments` dan (useTeacherDashboard) - server'da yangi endpoint yo'q.
 */
export function TeacherHomeScreen() {
  const { t } = useTranslation("student");
  const { user, currentMembership } = useAuthStore();
  const [search, setSearch] = useState("");
  const { dashboard, isLoading, isError, refetch } = useTeacherDashboard();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const tasksPath = isCenterAdmin ? ROUTES.adminTasks : ROUTES.teacherTasks;
  const studentsPath = isCenterAdmin ? ROUTES.adminStudents : ROUTES.teacherStudents;
  const taskPath = isCenterAdmin ? ROUTES.adminTask : ROUTES.teacherTask;
  const firstName = (user?.fullName ?? "").trim().split(/\s+/)[0] ?? "";

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !dashboard) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState message={t("teacher.dashboard.errorLoad")} onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Salom + qidiruv (referens: "Welcome back Taylor" + search) */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {t("teacher.dashboard.welcome", { name: firstName })}
          </h1>
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("teacher.dashboard.searchPlaceholder")}
              className="h-11 w-full rounded-full border border-line bg-surface pl-9 pr-4 text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
          </label>
        </header>

        {dashboard.assignments.length === 0 ? (
          <EmptyState
            title={t("teacher.dashboard.emptyTitle")}
            description={t("teacher.dashboard.emptyText")}
            action={
              <Link to={tasksPath}>
                <Button size="sm">{t("teacher.dashboard.createTask")}</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Chap ustun */}
            <div className="min-w-0 space-y-5">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-text">
                    {t("teacher.dashboard.statsTitle")}
                  </h2>
                  <Link
                    to={tasksPath}
                    className="text-xs font-semibold text-muted underline-offset-2 hover:text-text hover:underline"
                  >
                    {t("teacher.dashboard.viewAll")}
                  </Link>
                </div>
                <StatCards totals={dashboard.totals} />
              </section>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <ActivityChart bars={dashboard.activity} />
                <ReviewQueue items={dashboard.reviewQueue} taskPath={taskPath} />
              </div>

              <AssignmentsMini
                items={dashboard.assignments}
                taskPath={taskPath}
                tasksPath={tasksPath}
                search={search}
              />
            </div>

            {/* O'ng ustun */}
            <aside className="space-y-5">
              <PromoCard to={studentsPath} />
              <DeadlineCalendar dueDates={dashboard.dueDates} />
              <RecentAssignments
                items={dashboard.recent}
                taskPath={taskPath}
                tasksPath={tasksPath}
              />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
