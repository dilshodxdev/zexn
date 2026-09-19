import { HelpCircle, Clock, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge, Card } from "@/components/ui";

export function LandingProblems() {
  const { t } = useTranslation("landing");

  return (
    <section id="muammo" className="border-t border-line bg-surface/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 text-center">
          <Badge tone="warn" className="mb-3">
            {t("problem.badge")}
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {t("problem.title")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted sm:text-sm">
            {t("problem.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card className="flex flex-col gap-2 border-line">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-alt text-warn">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">{t("problem.card1Title")}</h3>
            <p className="text-xs leading-relaxed text-muted">{t("problem.card1Desc")}</p>
          </Card>

          <Card className="flex flex-col gap-2 border-line">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-alt text-warn">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">{t("problem.card2Title")}</h3>
            <p className="text-xs leading-relaxed text-muted">{t("problem.card2Desc")}</p>
          </Card>

          <Card className="flex flex-col gap-2 border-line sm:col-span-2 md:col-span-1">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-alt text-warn">
              <SearchX className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-text">{t("problem.card3Title")}</h3>
            <p className="text-xs leading-relaxed text-muted">{t("problem.card3Desc")}</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
