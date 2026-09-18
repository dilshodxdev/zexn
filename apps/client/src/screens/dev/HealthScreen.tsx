import { useTranslation } from "react-i18next";
import { Card, ErrorState, PageHeader, Spinner, StatusDot } from "@/components/ui";
import { useHealth } from "@/features/health/useHealth";
import { formatDateTime } from "@/lib/utils";

/**
 * 1-bosqich ekrani: client -> /api/health -> server. Uch holat: loading / error / success.
 * Har ekran shu uch holatni ko'rsatishi shart (docs/07-screens.md).
 */
export function HealthScreen() {
  const { t } = useTranslation();
  const health = useHealth();

  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col gap-6 px-4 py-12">
      <PageHeader title={t("app.name")} subtitle={t("app.tagline")} />

      <Card title={t("health.title")}>
        {health.isPending && (
          <div className="flex items-center gap-2 py-4 text-muted">
            <Spinner size="sm" />
            <span className="text-sm">{t("health.loading")}</span>
          </div>
        )}

        {health.isError && (
          <ErrorState
            message={health.error.message || t("health.error")}
            onRetry={() => void health.refetch()}
          />
        )}

        {health.isSuccess && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">{t("health.server")}</dt>
            <dd className="flex items-center gap-2 text-text">
              <StatusDot ok /> {t("health.ok")}
            </dd>
            <dt className="text-muted">{t("health.db")}</dt>
            <dd className="flex items-center gap-2 text-text">
              <StatusDot ok={health.data.db === "ok"} />{" "}
              {health.data.db === "ok" ? t("health.ok") : t("health.down")}
            </dd>
            <dt className="text-muted">{t("health.uptime")}</dt>
            <dd className="text-text">{health.data.uptimeSec} s</dd>
            <dt className="text-muted">{t("health.time")}</dt>
            <dd className="text-text">{formatDateTime(health.data.time)}</dd>
          </dl>
        )}
      </Card>
    </main>
  );
}
