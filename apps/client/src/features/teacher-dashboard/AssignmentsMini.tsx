import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import type { AssignmentManageItem } from "@zexn/shared";
import { Badge, Card, ProgressRing } from "@/components/ui";
import { DifficultyBadge } from "@/features/assignments/DifficultyBadge";
import { daysUntil } from "@/lib/utils";

interface AssignmentsMiniProps {
  items: AssignmentManageItem[];
  taskPath: (assignmentId: string) => string;
  tasksPath: string;
  search: string;
}

/**
 * Referensdagi "Course You're Taking" o'rnida: faol vazifalar, o'ngda bajarilish halqasi
 * (done / studentCount). Qidiruv yuqoridagi inputdan (client filtri).
 */
export function AssignmentsMini({ items, taskPath, tasksPath, search }: AssignmentsMiniProps) {
  const { t } = useTranslation("student");
  const query = search.trim().toLocaleLowerCase("uz");
  const visible = items
    .filter((a) => a.isActive)
    .filter((a) => !query || a.title.toLocaleLowerCase("uz").includes(query))
    .slice(0, 5);

  return (
    <Card
      title={t("teacher.dashboard.tasksTitle")}
      actions={
        <>
          <Badge tone="brand">{t("teacher.dashboard.tasksActive")}</Badge>
          <Link
            to={tasksPath}
            aria-label={t("teacher.dashboard.createTask")}
            title={t("teacher.dashboard.createTask")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-bg transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </>
      }
    >
      {visible.length === 0 ? (
        <p className="py-6 text-center text-xs text-muted">{t("teacher.dashboard.tasksEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((a) => {
            const remaining = Math.max(0, a.studentCount - a.doneCount);
            const percent =
              a.studentCount === 0 ? 0 : Math.round((a.doneCount / a.studentCount) * 100);
            const overdue = daysUntil(a.dueAt) < 0;
            return (
              <li key={a.id}>
                <Link
                  to={taskPath(a.id)}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 py-2 transition-colors hover:border-brand/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text">
                      {a.title}
                    </span>
                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                      <DifficultyBadge difficulty={a.difficulty} />
                      <span className="truncate">{a.topic?.title ?? ""}</span>
                    </span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className="block text-[10px] uppercase tracking-wider text-muted">
                      {t("teacher.dashboard.tasksRemaining")}
                    </span>
                    <span className="block text-xs font-semibold text-text">
                      {t("teacher.dashboard.tasksRemainingValue", { count: remaining })}
                    </span>
                  </span>
                  <ProgressRing
                    value={percent}
                    size={40}
                    strokeWidth={4}
                    tone={overdue ? "danger" : percent === 100 ? "ok" : "brand"}
                  >
                    <span className="font-mono text-[10px] font-bold text-text">{percent}%</span>
                  </ProgressRing>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
