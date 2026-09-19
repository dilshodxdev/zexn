import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import type { ActivityBar } from "./useTeacherDashboard";

interface ActivityChartProps {
  bars: ActivityBar[];
}

/**
 * Referensdagi "Hours Activity" o'rnida: vazifa bo'yicha topshirilgan (kutmoqda) + qabul qilingan ishlar.
 * Kutubxonasiz - oddiy div ustunlar, balandlik foizda. Eng faol vazifa `brand` rangda (referensdagi yorug' ustun).
 */
export function ActivityChart({ bars }: ActivityChartProps) {
  const { t } = useTranslation("student");
  const max = Math.max(1, ...bars.map((b) => b.submitted + b.done));
  const topId = bars[0]?.id;
  const hasData = bars.some((b) => b.submitted + b.done > 0);

  return (
    <Card
      title={t("teacher.dashboard.activityTitle")}
      subtitle={t("teacher.dashboard.activitySub")}
      actions={
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {t("teacher.dashboard.activityLegendDone")}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-warn" />
            {t("teacher.dashboard.activityLegendSubmitted")}
          </span>
        </div>
      }
    >
      {!hasData ? (
        <p className="py-8 text-center text-xs text-muted">
          {t("teacher.dashboard.activityEmpty")}
        </p>
      ) : (
        <div className="flex h-44 items-end gap-2 sm:gap-3">
          {bars.map((bar) => {
            const total = bar.submitted + bar.done;
            const heightPct = Math.round((total / max) * 100);
            const donePct = total === 0 ? 0 : Math.round((bar.done / total) * 100);
            const isTop = bar.id === topId;
            return (
              <div key={bar.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full max-w-10 flex-1 items-end">
                  <div
                    className={`relative w-full overflow-hidden rounded-t-md rounded-b-sm ${
                      isTop ? "bg-brand" : "bg-surface-alt"
                    }`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                    title={`${bar.title}: ${bar.done} / ${total}`}
                  >
                    {/* Qabul qilingan qismi (pastdan) */}
                    <div
                      className={`absolute inset-x-0 bottom-0 ${isTop ? "bg-bg/25" : "bg-brand"}`}
                      style={{ height: `${donePct}%` }}
                    />
                  </div>
                  {isTop && total > 0 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-1.5 py-0.5 font-mono text-[10px] font-bold text-bg">
                      {total}
                    </span>
                  )}
                </div>
                <span
                  className="w-full truncate text-center text-[10px] text-muted"
                  title={bar.title}
                >
                  {bar.title}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
