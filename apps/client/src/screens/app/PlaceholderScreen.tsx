import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { ROUTES } from "@/routes";

interface PlaceholderScreenProps {
  title: string;
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const { t } = useTranslation("student");

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="max-w-md w-full border-line bg-surface p-8 text-center shadow-pop space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-alt text-brand">
          <Clock className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-text">{title}</h1>
          <p className="mt-1 text-xs text-muted">{t("placeholder.underDevelopment")}</p>
        </div>

        <span className="inline-block rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
          {t("placeholder.comingSoon")}
        </span>

        <div className="pt-4 border-t border-line">
          <Link to={ROUTES.app}>
            <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
              {t("placeholder.backToApp")}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
