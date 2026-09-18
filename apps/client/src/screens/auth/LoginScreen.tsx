import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components/ui";
import { LoginForm } from "@/features/auth/LoginForm";
import { ROUTES } from "@/routes";

export function LoginScreen() {
  const { t } = useTranslation("auth");

  return (
    <div className="flex min-h-full flex-col bg-bg text-text">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to={ROUTES.home} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-alt text-brand border border-line font-bold">
              Z
            </div>
            <span className="text-base font-bold tracking-wide text-text">ZEXN</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={ROUTES.register}>
              <Button variant="primary" size="sm">
                {t("submitRegister")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-text">{t("loginTitle")}</h1>
            <p className="mt-1 text-xs text-muted">{t("loginSubtitle")}</p>
          </div>

          <Card className="border-line bg-surface p-6 shadow-pop">
            <LoginForm />

            <div className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
              <span>{t("noAccount")} </span>
              <Link to={ROUTES.register} className="font-semibold text-brand hover:underline">
                {t("registerLink")}
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
