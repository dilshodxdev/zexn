import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Plus } from "lucide-react";
import type { AssignmentManageItem } from "@zexn/shared";
import { Badge, Card } from "@/components/ui";
import { DueLabel } from "@/features/assignments/DueLabel";
import { daysUntil } from "@/lib/utils";

interface RecentAssignmentsProps {
  items: AssignmentManageItem[];
  taskPath: (assignmentId: string) => string;
  tasksPath: string;
}

/** Referensdagi o'ng ustun "Assignments": so'nggi 3 vazifa, holat badge (faol / muddati o'tgan / yopiq). */
export function RecentAssignments({ items, taskPath, tasksPath }: RecentAssignmentsProps) {
  const { t } = useTranslation("student");

  function status(a: AssignmentManageItem): { tone: "ok" | "danger" | "neutral"; label: string } {
    if (!a.isActive) return { tone: "neutral", label: t("teacher.dashboard.statusClosed") };
    if (daysUntil(a.dueAt) < 0)
      return { tone: "danger", label: t("teacher.dashboard.statusOverdue") };
    return { tone: "ok", label: t("teacher.dashboard.statusActive") };
  }

  return (
    <Card
      title={t("teacher.dashboard.recentTitle")}
      actions={
        <Link
          to={tasksPath}
          aria-label={t("teacher.dashboard.createTask")}
          title={t("teacher.dashboard.createTask")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-bg transition-colors hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
        </Link>
      }
    >
      {items.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted">{t("teacher.dashboard.recentEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => {
            const s = status(a);
            return (
              <li key={a.id}>
                <Link
                  to={taskPath(a.id)}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 py-2 transition-colors hover:border-brand/50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-alt text-muted">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text">
                      {a.title}
                    </span>
                    <DueLabel dueAt={a.dueAt} className="text-[11px]" />
                  </span>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
