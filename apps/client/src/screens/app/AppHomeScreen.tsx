import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { useLogout } from "@/features/auth/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export function AppHomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, currentMembership } = useAuthStore();
  const logoutMutation = useLogout();

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate(ROUTES.home, { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <PageHeader
        title={t("placeholder.appTitle")}
        subtitle={
          user
            ? `${user.fullName} (@${user.login}) - ${currentMembership?.centerName || ""}`
            : undefined
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            loading={logoutMutation.isPending}
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => void handleLogout()}
          >
            {t("placeholder.logout")}
          </Button>
        }
      />

      <div className="mt-8">
        <Card className="p-8 text-center border-line bg-surface">
          <Badge tone="brand" className="mb-4">
            {t("placeholder.comingSoon")}
          </Badge>
          <h2 className="text-lg font-bold text-text mb-2">{t("placeholder.appTitle")}</h2>
          <p className="text-sm text-muted max-w-md mx-auto">{t("placeholder.appDesc")}</p>
        </Card>
      </div>
    </div>
  );
}
