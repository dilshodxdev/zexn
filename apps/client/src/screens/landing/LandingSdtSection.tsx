import { Activity, ShieldAlert, Cpu, RefreshCw, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, Card, ProgressBar } from "@/components/ui";

export function LandingSdtSection() {
  const { t } = useTranslation("landing");

  return (
    <section id="yechimlar" className="scroll-mt-4 border-t border-line py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <Badge tone="brand" className="mb-3">
            {t("sdt.badge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl">
            {t("sdt.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-muted sm:text-sm">
            {t("sdt.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Mini Visual SDT Profile */}
          <div className="lg:col-span-6">
            <Card className="border-line/80 bg-surface shadow-pop">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text">{t("sdt.skillsHeader")}</h3>
                    <p className="text-[11px] text-muted">{t("sdt.studentRole")}</p>
                  </div>
                </div>
                <Badge tone="brand">{t("sdt.previewBadge")}</Badge>
              </div>

              {/* Skills with ProgressBars */}
              <div className="space-y-3 pt-4">
                {/* Skill 1 - Strong */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text">{t("sdt.skill1Name")}</span>
                    <Badge tone="ok">{t("sdt.skill1Status")} (88%)</Badge>
                  </div>
                  <ProgressBar value={88} tone="ok" size="sm" />
                </div>

                {/* Skill 2 - Developing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text">{t("sdt.skill2Name")}</span>
                    <Badge tone="brand">{t("sdt.skill2Status")} (62%)</Badge>
                  </div>
                  <ProgressBar value={62} tone="brand" size="sm" />
                </div>

                {/* Skill 3 - Weak */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text">{t("sdt.skill3Name")}</span>
                    <Badge tone="danger">{t("sdt.skill3Status")} (29%)</Badge>
                  </div>
                  <ProgressBar value={29} tone="danger" size="sm" />
                </div>
              </div>

              {/* Error Pattern Detected Badge */}
              <div className="mt-4 rounded-xl border border-line bg-surface-alt/70 p-3">
                <div className="text-xs font-semibold text-text mb-1.5">
                  {t("sdt.patternTitle")}
                </div>
                <Badge tone="danger" className="py-1 px-2.5 text-xs">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                  <span>{t("sdt.patternBadge")}</span>
                </Badge>
              </div>

              {/* ZEXN Recommendation card */}
              <div className="mt-3 rounded-xl border border-brand/30 bg-brand-soft/40 p-3.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-brand mb-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{t("sdt.recommendationCardTitle")}</span>
                </div>
                <p className="text-muted leading-relaxed">{t("sdt.recommendationCardDesc")}</p>
              </div>
            </Card>
          </div>

          {/* Right Column: 3 Pillars of SDT */}
          <div className="space-y-4 lg:col-span-6">
            <Card className="flex items-start gap-4 border-line">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text">{t("sdt.feature1Title")}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t("sdt.feature1Desc")}</p>
              </div>
            </Card>

            <Card className="flex items-start gap-4 border-line">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-alt text-warn">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text">{t("sdt.feature2Title")}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t("sdt.feature2Desc")}</p>
              </div>
            </Card>

            <Card className="flex items-start gap-4 border-line">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-alt text-ok">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text">{t("sdt.feature3Title")}</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">{t("sdt.feature3Desc")}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
