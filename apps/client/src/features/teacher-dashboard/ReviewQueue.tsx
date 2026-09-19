import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight, Inbox } from "lucide-react";
import type { AssignmentManageItem } from "@zexn/shared";
import { Badge, Card } from "@/components/ui";

interface ReviewQueueProps {
  items: AssignmentManageItem[];
  taskPath: (assignmentId: string) => string;
}

/** Referensdagi "Daily Schedule" o'rnida: tekshirish kutayotgan ishlar - o'qituvchining bugungi navbati. */
export function ReviewQueue({ items, taskPath }: ReviewQueueProps) {
  const { t } = useTranslation("student");
  const total = items.reduce((sum, a) => sum + a.submittedCount, 0);

  return (
    <Card
      title={t("teacher.dashboard.queueTitle")}
      subtitle={t("teacher.dashboard.queueSub", { count: total })}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Inbox className="h-6 w-6 text-muted" />
          <p className="text-xs text-muted">{t("teacher.dashboard.queueEmpty")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.slice(0, 4).map((a) => (
            <li key={a.id}>
              <Link
                to={taskPath(a.id)}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface-alt px-3 py-2 transition-colors hover:border-brand/50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warn-soft font-mono text-xs font-bold text-warn">
                  {a.submittedCount}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text">{a.title}</span>
                  <span className="block truncate text-[11px] text-muted">
                    {a.topic?.title ??
                      t("teacher.dashboard.queueItem", { count: a.submittedCount })}
                  </span>
                </span>
                <Badge tone="warn" className="hidden sm:inline-flex">
                  {t("teacher.dashboard.queueItem", { count: a.submittedCount })}
                </Badge>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
