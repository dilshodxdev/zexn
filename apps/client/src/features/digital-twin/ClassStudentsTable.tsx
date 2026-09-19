import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowUpRight, Search, UserRound, Users } from "lucide-react";
import type { ClassStudentRow } from "@zexn/shared";
import { Badge, EmptyState, ProgressBar } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

interface ClassStudentsTableProps {
  students: ClassStudentRow[];
}

export function ClassStudentsTable({ students }: ClassStudentsTableProps) {
  const { t } = useTranslation("twin");
  const { currentMembership } = useAuthStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "risk">("all");
  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";

  const visibleStudents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("uz");
    return students.filter((student) => {
      const matchesFilter = filter === "all" || student.atRisk;
      const matchesSearch =
        !query ||
        student.fullName.toLocaleLowerCase("uz").includes(query) ||
        student.login.toLocaleLowerCase("uz").includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, search, students]);

  const twinUrl = (studentId: string) =>
    isCenterAdmin ? ROUTES.adminStudentTwin(studentId) : ROUTES.teacherStudentTwin(studentId);

  return (
    <section className="rounded-[2rem] border border-line bg-surface-alt p-4 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-bg">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text">{t("class.studentsTitle")}</h2>
              <p className="text-xs text-muted">
                {t("class.studentsCount", { count: students.length })}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-2xl">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("class.searchPlaceholder")}
              className="h-12 w-full rounded-full border border-line bg-surface pl-12 pr-4 text-sm text-text placeholder:text-muted outline-none focus:border-brand"
            />
          </label>
          <div className="flex rounded-full border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`min-h-10 flex-1 rounded-full px-4 text-xs font-semibold sm:flex-none ${
                filter === "all" ? "bg-brand text-bg" : "text-muted"
              }`}
            >
              {t("class.filterAll")}
            </button>
            <button
              type="button"
              onClick={() => setFilter("risk")}
              className={`min-h-10 flex-1 rounded-full px-4 text-xs font-semibold sm:flex-none ${
                filter === "risk" ? "bg-danger text-text" : "text-muted"
              }`}
            >
              {t("class.filterRisk")}
            </button>
          </div>
        </div>
      </div>

      {visibleStudents.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title={search.trim() || filter === "risk" ? t("class.searchEmpty") : t("class.empty")}
            icon={<UserRound className="h-6 w-6 text-muted" />}
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleStudents.map((student, index) => {
            const initial = student.fullName.trim().charAt(0).toUpperCase() || "O";
            const mastery = student.overallMastery;
            const tone =
              mastery === null ? "brand" : mastery < 50 ? "danger" : mastery < 75 ? "warn" : "ok";
            return (
              <Link
                key={student.id}
                to={twinUrl(student.id)}
                className={`group relative min-h-56 overflow-hidden rounded-[1.75rem] border p-5 transition-transform hover:-translate-y-0.5 ${
                  student.atRisk
                    ? "border-danger/30 bg-danger-soft"
                    : index % 3 === 1
                      ? "border-brand/20 bg-brand-soft"
                      : "border-line bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-black text-bg shadow-sm">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold text-text">{student.fullName}</h3>
                      <p className="truncate font-mono text-xs text-muted">@{student.login}</p>
                    </div>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-alt text-text transition-colors group-hover:bg-brand group-hover:text-bg">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-4xl font-black text-text">
                      {mastery === null ? t("class.none") : `${mastery}%`}
                    </p>
                    <p className="mt-1 text-xs text-muted">{t("class.overallMastery")}</p>
                  </div>
                  {student.atRisk ? (
                    <Badge tone="danger" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("class.riskBadge")}
                    </Badge>
                  ) : (
                    <Badge tone="ok">{t("class.stableBadge")}</Badge>
                  )}
                </div>

                <div className="mt-4">
                  <ProgressBar value={mastery ?? 0} tone={tone} size="sm" />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs">
                  <div className="min-w-0">
                    <p className="text-muted">{t("class.weakestSkillShort")}</p>
                    <p className="truncate font-semibold text-text">
                      {student.weakestSkill?.name ?? t("class.none")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-muted">{t("class.patternsShort")}</p>
                    <p className="font-mono font-bold text-text">{student.activePatternCount}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
