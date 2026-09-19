import { useTranslation } from "react-i18next";
import { Check, FileText, Flame } from "lucide-react";
import { Card, ProgressRing } from "@/components/ui";

interface AssignmentStatsRowProps {
  totalCount: number;
  newCount: number;
  doneCount: number;
  streakDays: number;
  className?: string;
}

export function AssignmentStatsRow({
  totalCount,
  newCount,
  doneCount,
  streakDays,
  className = "",
}: AssignmentStatsRowProps) {
  const { t } = useTranslation("assignments");

  const overallPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${className}`}>
      {/* 1. Overall Progress */}
      <Card className="flex items-center gap-3 border-line bg-surface p-3.5 shadow-sm">
        <ProgressRing value={overallPercent} size={50} strokeWidth={5} tone="brand">
          <span className="font-mono text-xs font-bold text-text">{overallPercent}%</span>
        </ProgressRing>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-text truncate">
            {t("stats.overallProgress")}
          </span>
          <span className="text-[11px] text-muted truncate">
            {t("stats.tasksCount", { done: doneCount, total: totalCount })}
          </span>
        </div>
      </Card>

      {/* 2. Pending Tasks */}
      <Card className="flex items-center gap-3 border-line bg-surface p-3.5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-alt text-brand">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-lg font-bold text-text leading-tight">{newCount}</span>
          <span className="text-xs text-text truncate">{t("stats.pendingTasks")}</span>
          <span className="text-[11px] text-muted truncate">{t("stats.pendingSub")}</span>
        </div>
      </Card>

      {/* 3. Completed Tasks */}
      <Card className="flex items-center gap-3 border-line bg-surface p-3.5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-ok/30 bg-ok-soft text-ok">
          <Check className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-lg font-bold text-text leading-tight">{doneCount}</span>
          <span className="text-xs text-text truncate">{t("stats.completedTasks")}</span>
          <span className="text-[11px] text-muted truncate">{t("stats.completedSub")}</span>
        </div>
      </Card>

      {/* 4. Daily Streak */}
      <Card className="flex items-center gap-3 border-line bg-surface p-3.5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-warn/30 bg-warn-soft text-warn">
          <Flame className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-mono text-lg font-bold text-text leading-tight">{streakDays}</span>
          <span className="text-xs text-text truncate">{t("stats.dailyStreak")}</span>
          <span className="text-[11px] text-muted truncate">{t("stats.streakSub")}</span>
        </div>
      </Card>
    </div>
  );
}
