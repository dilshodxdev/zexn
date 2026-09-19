import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";

interface CurrentStateCardProps {
  fullName: string;
  level: string;
  overallMastery: number | null;
  summary: string;
}

export function CurrentStateCard({
  fullName,
  level,
  overallMastery,
  summary,
}: CurrentStateCardProps) {
  const { t } = useTranslation("twin");
  const firstName = fullName.trim().split(" ")[0] || fullName;

  return (
    <Card
      title={t("currentState.title", { name: firstName })}
      subtitle={t("currentState.level", { level })}
      className="space-y-4"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-black font-mono text-brand">
          {overallMastery !== null ? `${overallMastery}%` : "-"}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t("currentState.mastery")}
        </span>
      </div>

      <div className="rounded-xl border border-line bg-surface-alt p-3.5">
        <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">{summary}</p>
      </div>
    </Card>
  );
}
