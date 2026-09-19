import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui";
import { tashkentYmd } from "./useTeacherDashboard";

interface DeadlineCalendarProps {
  /** Vazifalarning `dueAt` ISO sanalari; ko'rsatilayotgan oy bo'yicha shu yerda guruhlanadi */
  dueDates: string[];
}

const WEEKDAYS = new Intl.DateTimeFormat("uz-UZ", { timeZone: "UTC", weekday: "narrow" });
const MONTH = new Intl.DateTimeFormat("uz-UZ", { timeZone: "UTC", month: "long", year: "numeric" });

/**
 * Referensdagi oy kalendari: muddat (`dueAt`) tushgan kunlar belgilanadi, bugun `brand` doira.
 * Hafta yakshanbadan boshlanadi (referensdagidek). Sana hisoblari UTC Date orqali - hafta kuni
 * timezone'ga bog'liq emas, "bugun" esa Asia/Tashkent bo'yicha.
 */
export function DeadlineCalendar({ dueDates }: DeadlineCalendarProps) {
  const { t } = useTranslation("student");
  const today = tashkentYmd(new Date());
  const [view, setView] = useState({ y: today.y, m: today.m });

  const firstDay = new Date(Date.UTC(view.y, view.m - 1, 1));
  const daysInMonth = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate();
  const leading = firstDay.getUTCDay(); // 0 = yakshanba
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Hafta kunlari sarlavhasi: 2023-01-01 yakshanba
  const weekdayLabels = Array.from({ length: 7 }, (_, i) =>
    WEEKDAYS.format(new Date(Date.UTC(2023, 0, 1 + i))),
  );

  function shift(delta: number) {
    const next = new Date(Date.UTC(view.y, view.m - 1 + delta, 1));
    setView({ y: next.getUTCFullYear(), m: next.getUTCMonth() + 1 });
  }

  const isCurrentMonth = view.y === today.y && view.m === today.m;
  const dueByDay = new Map<number, number>();
  for (const iso of dueDates) {
    const due = tashkentYmd(new Date(iso));
    if (due.y === view.y && due.m === view.m) dueByDay.set(due.d, (dueByDay.get(due.d) ?? 0) + 1);
  }
  const dueCount = [...dueByDay.values()].reduce((s, n) => s + n, 0);

  return (
    <Card
      title={t("teacher.dashboard.calendarTitle")}
      subtitle={t("teacher.dashboard.calendarDue", { count: dueCount })}
      actions={
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-text"
            aria-label="<"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-28 text-center text-xs font-semibold capitalize text-text">
            {MONTH.format(firstDay)}
          </span>
          <button
            type="button"
            onClick={() => shift(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-alt hover:text-text"
            aria-label=">"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdayLabels.map((label, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase text-muted">
            {label}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />;
          const isToday = isCurrentMonth && day === today.d;
          const due = dueByDay.get(day) ?? 0;
          return (
            <span key={i} className="flex items-center justify-center py-0.5">
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                  isToday
                    ? "bg-brand font-bold text-bg"
                    : due > 0
                      ? "border border-brand/60 font-semibold text-text"
                      : "text-muted"
                }`}
                title={due > 0 ? t("teacher.dashboard.calendarDue", { count: due }) : undefined}
              >
                {day}
                {due > 0 && !isToday && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand" />
                )}
              </span>
            </span>
          );
        })}
      </div>
    </Card>
  );
}
