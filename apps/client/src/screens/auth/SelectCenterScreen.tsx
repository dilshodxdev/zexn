import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { School } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useSelectCenter } from "@/features/auth/useAuth";
import { ROUTES } from "@/routes";

export function SelectCenterScreen() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const { accessToken, memberships } = useAuthStore();
  const selectCenterMutation = useSelectCenter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace />;
  }

  async function handleSelect(centerId: string) {
    setSelectedId(centerId);
    try {
      const data = await selectCenterMutation.mutateAsync({ centerId });
      if (data.currentMembership?.role === "CENTER_ADMIN") {
        navigate(ROUTES.admin, { replace: true });
      } else {
        navigate(ROUTES.app, { replace: true });
      }
    } catch {
      setSelectedId(null);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center p-4 bg-bg py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-brand border border-line">
            <School className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-text">{t("selectCenterTitle")}</h1>
          <p className="mt-1 text-xs text-muted">{t("selectCenterSubtitle")}</p>
        </div>

        <div className="flex flex-col gap-3">
          {memberships.map((m) => (
            <Card key={m.id} className="border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text">{m.centerName}</h3>
                    <Badge tone="neutral">{m.role}</Badge>
                  </div>
                  <p className="font-mono text-[10px] text-muted">@{m.centerSlug}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  loading={selectCenterMutation.isPending && selectedId === m.centerId}
                  onClick={() => void handleSelect(m.centerId)}
                >
                  {t("selectCenterBtn")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
