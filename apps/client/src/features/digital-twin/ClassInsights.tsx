import { useTranslation } from "react-i18next";
import { AlertTriangle, Bug, Lightbulb, Target, Users } from "lucide-react";
import type { ClassDigitalTwin } from "@zexn/shared";
import { Badge } from "@/components/ui";

interface ClassInsightsProps {
  data: ClassDigitalTwin;
}

const actionTone = {
  GROUP_LESSON: "brand",
  TARGETED_TASKS: "warn",
  RETEST: "info",
} as const;

export function ClassInsights({ data }: ClassInsightsProps) {
  const { t } = useTranslation("twin");
  const weak = data.commonWeakSkills[0];
  const pattern = data.commonPatterns[0];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-[1.75rem] border border-danger/20 bg-danger-soft p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-muted">{t("class.atRisk")}</p>
              <p className="mt-3 font-mono text-4xl font-black text-text">{data.studentsAtRisk}</p>
              <p className="mt-1 text-xs text-muted">
                {t("class.outOfStudents", { count: data.students.length })}
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger text-text">
              <AlertTriangle className="h-5 w-5" />
            </span>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-line bg-surface-alt p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted">{t("class.weakestSkill")}</p>
              <p className="mt-3 truncate text-xl font-bold text-text">
                {weak?.name ?? t("class.none")}
              </p>
              <p className="mt-1 text-xs text-muted">
                {weak
                  ? t("class.weakSkillMeta", {
                      count: weak.studentCount,
                      mastery: weak.avgMastery,
                    })
                  : t("class.noWeakSkill")}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warn-soft text-warn">
              <Target className="h-5 w-5" />
            </span>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-line bg-surface-alt p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted">{t("class.commonPattern")}</p>
              <p className="mt-3 truncate text-xl font-bold text-text">
                {pattern?.name ?? t("class.none")}
              </p>
              <p className="mt-1 text-xs text-muted">
                {pattern
                  ? t("class.patternMeta", { count: pattern.studentCount })
                  : t("class.noPattern")}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-bg">
              <Bug className="h-5 w-5" />
            </span>
          </div>
        </article>
      </div>

      <div className="rounded-[1.75rem] border border-line bg-surface-alt p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-text">{t("class.actionsTitle")}</h2>
            <p className="text-xs text-muted">{t("class.actionsSubtitle")}</p>
          </div>
        </div>
        {data.recommendedActions.length > 0 ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {data.recommendedActions.map((action, index) => (
              <div
                key={`${action.type}-${action.skillId}-${index}`}
                className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-brand">
                  <Users className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-text">{action.skillName}</p>
                    <Badge tone={actionTone[action.type]}>
                      {t(`class.actionType.${action.type}`)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{action.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("class.noActions")}</p>
        )}
      </div>
    </section>
  );
}
