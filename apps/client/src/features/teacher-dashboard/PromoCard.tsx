import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

interface PromoCardProps {
  to: string;
}

/** Referensdagi "Go Premium" o'rnida: ZEXN AI mentor - kontrast karta (bg-text/text-bg: temaga teskari), lime CTA. */
export function PromoCard({ to }: PromoCardProps) {
  const { t } = useTranslation("student");
  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-text p-5 text-bg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/30 blur-2xl" />
      <p className="flex items-center gap-2 text-lg font-bold leading-tight">
        <Sparkles className="h-5 w-5 text-brand" />
        {t("teacher.promo.mainTitle")}
      </p>
      <p className="mt-1 max-w-[26ch] text-xs leading-snug opacity-75">
        {t("teacher.promo.mainText")}
      </p>
      <Link
        to={to}
        className="mt-4 inline-flex h-9 items-center rounded-full bg-brand px-4 text-xs font-bold text-bg transition-colors hover:bg-brand-hover"
      >
        {t("teacher.promo.mainCta")}
      </Link>
    </div>
  );
}
