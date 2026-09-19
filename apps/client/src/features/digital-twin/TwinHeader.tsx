import { useTranslation } from "react-i18next";
import type { DigitalTwin } from "@zexn/shared";
import { Badge, ProgressRing } from "@/components/ui";

interface TwinHeaderProps {
  student: DigitalTwin["student"];
  course: DigitalTwin["course"];
  overallMastery: DigitalTwin["overallMastery"];
  confidence: DigitalTwin["confidence"];
}

export function TwinHeader({ student, course, overallMastery, confidence }: TwinHeaderProps) {
  const { t } = useTranslation("twin");

  const initial = student.fullName.trim().charAt(0).toUpperCase() || "O";
  const confidencePercent = Math.round(confidence * 100);

  const ringTone =
    overallMastery === null
      ? "brand"
      : overallMastery >= 75
        ? "ok"
        : overallMastery >= 60
          ? "warn"
          : "danger";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between shadow-card">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-brand font-bold text-bg text-lg sm:text-xl shadow-sm">
          {initial}
        </div>
        <div className="space-y-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-text truncate">{student.fullName}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted font-mono">@{student.login}</span>
            <span className="text-line">|</span>
            <Badge tone="neutral" className="text-xs">
              {course.level}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5 border-t border-line pt-3 sm:border-t-0 sm:pt-0">
        <ProgressRing value={overallMastery ?? 0} size={56} strokeWidth={5} tone={ringTone}>
          {overallMastery !== null ? (
            <span className="font-mono text-xs font-bold text-text">{overallMastery}%</span>
          ) : (
            <span className="font-mono text-xs font-semibold text-muted">-</span>
          )}
        </ProgressRing>

        <div className="space-y-0.5">
          <div className="text-xs font-bold text-text">
            {overallMastery !== null
              ? `${overallMastery}% ${t("header.masteryLabel")}`
              : t("header.noEvidence")}
          </div>
          <div className="text-xs text-muted">
            {t("header.confidence", { percent: confidencePercent })}
          </div>
        </div>
      </div>
    </div>
  );
}
