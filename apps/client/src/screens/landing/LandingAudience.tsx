import { GraduationCap, Users, Building2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, Card } from "@/components/ui";

export function LandingAudience() {
  const { t } = useTranslation("landing");

  return (
    <section id="hamkorlik" className="scroll-mt-4 border-t border-line py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <Badge tone="info" className="mb-3">
            {t("audience.badge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl">
            {t("audience.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-muted sm:text-sm">
            {t("audience.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Student */}
          <Card className="flex flex-col gap-4 border-line bg-surface">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text">{t("audience.studentTitle")}</h3>
            </div>
            <ul className="flex flex-col gap-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.studentBenefit1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.studentBenefit2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.studentBenefit3")}</span>
              </li>
            </ul>
          </Card>

          {/* Card 2: Teacher */}
          <Card className="flex flex-col gap-4 border-line bg-surface">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text">{t("audience.teacherTitle")}</h3>
            </div>
            <ul className="flex flex-col gap-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.teacherBenefit1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.teacherBenefit2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.teacherBenefit3")}</span>
              </li>
            </ul>
          </Card>

          {/* Card 3: Center */}
          <Card className="flex flex-col gap-4 border-line bg-surface">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-text">{t("audience.centerTitle")}</h3>
            </div>
            <ul className="flex flex-col gap-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.centerBenefit1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.centerBenefit2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span>{t("audience.centerBenefit3")}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </section>
  );
}
