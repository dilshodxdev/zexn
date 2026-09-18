import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/StatusDot";
import { useHealth } from "@/features/health/useHealth";
import { formatDateTime } from "@/lib/utils";

/**
 * 1-bosqich ekrani: client -> /api/health -> server. Uch holat: loading / error / success.
 * Har ekran shu uch holatni ko'rsatishi shart (docs/07-screens.md).
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const health = useHealth();

  return (
    <main className="mx-auto flex min-h-full max-w-xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-bold text-brand-600">{t("app.name")}</h1>
        <p className="text-gray-600">{t("app.tagline")}</p>
      </header>

      <Card title={t("health.title")}>
        {health.isPending && <p className="text-gray-500">{t("health.loading")}</p>}

        {health.isError && (
          <div className="flex flex-col gap-2">
            <p className="text-danger">{t("health.error")}</p>
            <p className="text-sm text-gray-500">{health.error.message}</p>
            <button
              type="button"
              onClick={() => void health.refetch()}
              className="w-fit rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
            >
              {t("health.retry")}
            </button>
          </div>
        )}

        {health.isSuccess && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">{t("health.server")}</dt>
            <dd className="flex items-center gap-2">
              <StatusDot ok /> {t("health.ok")}
            </dd>
            <dt className="text-gray-500">{t("health.db")}</dt>
            <dd className="flex items-center gap-2">
              <StatusDot ok={health.data.db === "ok"} />{" "}
              {health.data.db === "ok" ? t("health.ok") : t("health.down")}
            </dd>
            <dt className="text-gray-500">{t("health.uptime")}</dt>
            <dd>{health.data.uptimeSec} s</dd>
            <dt className="text-gray-500">{t("health.time")}</dt>
            <dd>{formatDateTime(health.data.time)}</dd>
          </dl>
        )}
      </Card>
    </main>
  );
}
