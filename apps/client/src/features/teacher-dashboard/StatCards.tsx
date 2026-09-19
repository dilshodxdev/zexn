import { useTranslation } from "react-i18next";
import { CheckCircle2, ClipboardList, Inbox, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import type { DashboardData } from "./useTeacherDashboard";

interface StatCardsProps {
  totals: DashboardData["totals"];
}

interface Stat {
  icon: LucideIcon;
  value: number;
  label: string;
  sub: string;
  /** Referensdagi pastel ikon foni; tokenlardan */
  iconClass: string;
  highlight?: boolean;
}

/** Referensdagi "New Courses" kartalari o'rnida: 4 ta asosiy raqam, bir qarashda o'qiladi. */
export function StatCards({ totals }: StatCardsProps) {
  const { t } = useTranslation("student");

  const stats: Stat[] = [
    {
      icon: ClipboardList,
      value: totals.tasks,
      label: t("teacher.dashboard.statTasks"),
      sub: t("teacher.dashboard.statTasksSub", { active: totals.active }),
      iconClass: "bg-brand-soft text-brand",
    },
    {
      icon: Inbox,
      value: totals.review,
      label: t("teacher.dashboard.statReview"),
      sub: t("teacher.dashboard.statReviewSub"),
      iconClass: "bg-warn-soft text-warn",
      highlight: totals.review > 0,
    },
    {
      icon: Users,
      value: totals.students,
      label: t("teacher.dashboard.statStudents"),
      sub: t("teacher.dashboard.statStudentsSub"),
      iconClass: "bg-info-soft text-info",
    },
    {
      icon: CheckCircle2,
      value: totals.done,
      label: t("teacher.dashboard.statDone"),
      sub: t("teacher.dashboard.statDoneSub"),
      iconClass: "bg-ok-soft text-ok",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`p-4 ${stat.highlight ? "border-warn/40" : ""}`}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text">{stat.label}</p>
              <p className="truncate text-[11px] text-muted">{stat.sub}</p>
            </div>
          </div>
          <p className="mt-3 font-mono text-2xl font-bold leading-none text-text">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
