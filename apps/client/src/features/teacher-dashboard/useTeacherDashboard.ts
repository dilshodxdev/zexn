import { useMemo } from "react";
import type { AssignmentManageItem } from "@zexn/shared";
import { useManageAssignments } from "@/features/assignments/useAssignments";

/** Asia/Tashkent bo'yicha yil/oy/kun (DB UTC, UI Tashkent qoidasi). */
export function tashkentYmd(date: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export interface ActivityBar {
  id: string;
  title: string;
  submitted: number;
  done: number;
}

export interface DashboardData {
  assignments: AssignmentManageItem[];
  totals: { tasks: number; active: number; review: number; students: number; done: number };
  /** Tekshirish kutayotgan ishlar bor vazifalar (submittedCount desc) */
  reviewQueue: AssignmentManageItem[];
  /** Chart uchun eng faol 6 ta vazifa */
  activity: ActivityBar[];
  /** So'nggi yaratilgan 3 ta */
  recent: AssignmentManageItem[];
  /** Kalendar uchun barcha `dueAt` lar */
  dueDates: string[];
}

/**
 * Dashboard ko'rsatkichlari - yangi endpoint yo'q, `GET /api/assignments` dan hisoblanadi.
 * useMemo: ro'yxat o'zgarmasa qayta hisoblanmaydi.
 */
export function useTeacherDashboard() {
  const query = useManageAssignments();

  const data = useMemo<DashboardData | null>(() => {
    if (!query.data) return null;
    const assignments = query.data;
    const totals = assignments.reduce(
      (acc, a) => ({
        tasks: acc.tasks + 1,
        active: acc.active + (a.isActive ? 1 : 0),
        review: acc.review + a.submittedCount,
        students: Math.max(acc.students, a.studentCount),
        done: acc.done + a.doneCount,
      }),
      { tasks: 0, active: 0, review: 0, students: 0, done: 0 },
    );

    const reviewQueue = assignments
      .filter((a) => a.submittedCount > 0)
      .sort((l, r) => r.submittedCount - l.submittedCount);

    const activity = [...assignments]
      .sort((l, r) => r.submittedCount + r.doneCount - (l.submittedCount + l.doneCount))
      .slice(0, 6)
      .map((a) => ({ id: a.id, title: a.title, submitted: a.submittedCount, done: a.doneCount }));

    const recent = [...assignments]
      .sort((l, r) => r.createdAt.localeCompare(l.createdAt))
      .slice(0, 3);

    const dueDates = assignments.map((a) => a.dueAt);

    return { assignments, totals, reviewQueue, activity, recent, dueDates };
  }, [query.data]);

  return { ...query, dashboard: data };
}
