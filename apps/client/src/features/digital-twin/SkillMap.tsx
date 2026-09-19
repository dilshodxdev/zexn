import { useTranslation } from "react-i18next";
import type { SkillCard } from "@zexn/shared";
import { Badge, Card, ProgressBar } from "@/components/ui";

interface SkillMapProps {
  strongSkills: SkillCard[];
  developingSkills: SkillCard[];
  weakSkills: SkillCard[];
  unassessedSkills: SkillCard[];
}

interface SkillItemProps {
  skill: SkillCard;
  tone: "ok" | "warn" | "danger";
}

function SkillItem({ skill, tone }: SkillItemProps) {
  const toneTextColor = {
    ok: "text-ok",
    warn: "text-warn",
    danger: "text-danger",
  }[tone];

  return (
    <div className="rounded-xl border border-line bg-surface-alt p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-text truncate">{skill.name}</span>
        <span className={`font-mono text-sm font-bold shrink-0 ${toneTextColor}`}>
          {skill.mastery}%
        </span>
      </div>
      <ProgressBar value={skill.mastery} tone={tone} size="sm" />
    </div>
  );
}

export function SkillMap({
  strongSkills,
  developingSkills,
  weakSkills,
  unassessedSkills,
}: SkillMapProps) {
  const { t } = useTranslation("twin");

  return (
    <Card title={t("skillMap.title")} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Strong column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge tone="ok" className="text-xs font-semibold">
              {t("skillMap.strong")}
            </Badge>
            <span className="text-xs font-mono font-semibold text-muted">
              {strongSkills.length}
            </span>
          </div>
          <div className="space-y-2">
            {strongSkills.length > 0 ? (
              strongSkills.map((skill) => <SkillItem key={skill.id} skill={skill} tone="ok" />)
            ) : (
              <p className="text-xs text-muted italic p-2">{t("skillMap.noSkills")}</p>
            )}
          </div>
        </div>

        {/* Developing column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge tone="warn" className="text-xs font-semibold">
              {t("skillMap.developing")}
            </Badge>
            <span className="text-xs font-mono font-semibold text-muted">
              {developingSkills.length}
            </span>
          </div>
          <div className="space-y-2">
            {developingSkills.length > 0 ? (
              developingSkills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} tone="warn" />
              ))
            ) : (
              <p className="text-xs text-muted italic p-2">{t("skillMap.noSkills")}</p>
            )}
          </div>
        </div>

        {/* Weak column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge tone="danger" className="text-xs font-semibold">
              {t("skillMap.weak")}
            </Badge>
            <span className="text-xs font-mono font-semibold text-muted">{weakSkills.length}</span>
          </div>
          <div className="space-y-2">
            {weakSkills.length > 0 ? (
              weakSkills.map((skill) => <SkillItem key={skill.id} skill={skill} tone="danger" />)
            ) : (
              <p className="text-xs text-muted italic p-2">{t("skillMap.noSkills")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Unassessed skills chips */}
      {unassessedSkills.length > 0 && (
        <div className="border-t border-line pt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("skillMap.unassessed")} ({unassessedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unassessedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center rounded-lg border border-line bg-surface-alt px-2.5 py-1 text-xs font-medium text-muted"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
