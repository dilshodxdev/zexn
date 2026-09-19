import { useTranslation } from "react-i18next";
import type { PatternCard } from "@zexn/shared";
import { Badge, Card } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

interface PatternListProps {
  activePatterns: PatternCard[];
  resolvedPatterns?: PatternCard[];
}

export function PatternList({ activePatterns, resolvedPatterns = [] }: PatternListProps) {
  const { t } = useTranslation("twin");
  const allPatterns = [...activePatterns, ...resolvedPatterns];

  const statusTone: Record<PatternCard["status"], "danger" | "warn" | "ok"> = {
    ACTIVE: "danger",
    IMPROVING: "warn",
    RESOLVED: "ok",
  };

  return (
    <Card title={t("patterns.title")} className="space-y-3">
      {allPatterns.length === 0 ? (
        <p className="text-xs text-muted italic p-2">{t("patterns.noPatterns")}</p>
      ) : (
        <div className="space-y-3">
          {allPatterns.map((pattern) => (
            <div
              key={pattern.id}
              className="rounded-xl border border-line bg-surface-alt p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="text-sm font-bold text-text">{pattern.name}</h4>
                  <p className="text-xs text-muted mt-0.5">{pattern.description}</p>
                </div>
                <Badge tone={statusTone[pattern.status]} className="text-xs font-semibold">
                  {t(`patterns.status.${pattern.status}`)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-line/60">
                <span className="font-medium text-warn">
                  {t("patterns.detectedCount", { count: pattern.occurrences })}
                </span>
                <span className="text-line">•</span>
                <span className="text-text font-medium">
                  {t("patterns.affectsSkill", { skill: pattern.skillName })}
                </span>
                <span className="text-line">•</span>
                <span className="text-muted">
                  {t("patterns.lastDetected", {
                    date: formatDateTime(pattern.lastDetectedAt),
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
