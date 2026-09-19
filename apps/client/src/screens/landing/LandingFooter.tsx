import { useTranslation } from "react-i18next";

export function LandingFooter() {
  const { t } = useTranslation("landing");

  return (
    <footer className="mt-auto border-t border-line py-8 text-center text-xs text-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8">
        <p className="font-mono text-xs text-brand font-medium">{t("footer.pilot")}</p>
        <p className="font-mono text-xs text-muted">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
