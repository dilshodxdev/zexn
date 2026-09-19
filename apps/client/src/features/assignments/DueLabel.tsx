import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import type { SubmissionStatus } from "@zexn/shared";
import { daysUntil } from "@/lib/utils";

interface DueLabelProps {
  dueAt: string;
  status?: SubmissionStatus;
  className?: string;
}

export function DueLabel({ dueAt, status, className = "" }: DueLabelProps) {
  const { t } = useTranslation("assignments");

  let formattedDate = dueAt;
  try {
    const d = new Date(dueAt);
    formattedDate = new Intl.DateTimeFormat("uz-UZ", {
      timeZone: "Asia/Tashkent",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    // fallback
  }

  const daysLeft = daysUntil(dueAt);
  const isDone = status === "DONE";

  let statusText = null;
  let statusTone = "text-muted";

  if (!isDone) {
    if (daysLeft < 0) {
      statusText = t("row.overdue");
      statusTone = "text-danger font-semibold";
    } else if (daysLeft === 0) {
      statusText = t("row.dueToday");
      statusTone = "text-danger font-semibold";
    } else if (daysLeft === 1) {
      statusText = t("row.daysLeft", { count: 1 });
      statusTone = "text-danger font-semibold";
    } else {
      statusText = t("row.daysLeft", { count: daysLeft });
      statusTone = "text-muted";
    }
  }

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      <Calendar className="h-4 w-4 shrink-0 text-muted" />
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-text">{formattedDate}</span>
        {statusText && <span className={`text-[11px] ${statusTone}`}>{statusText}</span>}
      </div>
    </div>
  );
}
