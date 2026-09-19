import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/routes";

export function LandingCta() {
  const { t } = useTranslation("landing");

  return (
    <section id="biz-haqimizda" className="scroll-mt-4 border-t border-line py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Card className="border-line bg-surface p-6 sm:p-10 shadow-pop">
          <h2 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-muted sm:text-sm">
            {t("cta.subtitle")}
          </p>
          <div className="mt-6 flex justify-center">
            <Link to={ROUTES.register} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="h-4 w-4" />}
                className="w-full min-h-[44px] sm:w-auto"
              >
                {t("cta.button")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
