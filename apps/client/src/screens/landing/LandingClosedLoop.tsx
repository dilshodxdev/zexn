import { useTranslation } from "react-i18next";
import { Badge, Card } from "@/components/ui";

export function LandingClosedLoop() {
  const { t } = useTranslation("landing");

  const steps = [
    {
      num: t("closedLoop.step1Num"),
      title: t("closedLoop.step1Title"),
      desc: t("closedLoop.step1Desc"),
    },
    {
      num: t("closedLoop.step2Num"),
      title: t("closedLoop.step2Title"),
      desc: t("closedLoop.step2Desc"),
    },
    {
      num: t("closedLoop.step3Num"),
      title: t("closedLoop.step3Title"),
      desc: t("closedLoop.step3Desc"),
    },
    {
      num: t("closedLoop.step4Num"),
      title: t("closedLoop.step4Title"),
      desc: t("closedLoop.step4Desc"),
    },
    {
      num: t("closedLoop.step5Num"),
      title: t("closedLoop.step5Title"),
      desc: t("closedLoop.step5Desc"),
    },
    {
      num: t("closedLoop.step6Num"),
      title: t("closedLoop.step6Title"),
      desc: t("closedLoop.step6Desc"),
    },
  ];

  return (
    <section className="border-t border-line bg-surface/30 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 text-center sm:mb-14">
          <Badge tone="brand" className="mb-3">
            {t("closedLoop.badge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl lg:text-4xl">
            {t("closedLoop.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs text-muted sm:text-sm">
            {t("closedLoop.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.num} className="flex flex-col gap-2.5 border-line bg-surface">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-brand">{step.num}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand/50" />
              </div>
              <h3 className="text-sm font-bold text-text">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{step.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
