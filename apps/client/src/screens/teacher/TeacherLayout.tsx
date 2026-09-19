import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BarChart3, CheckSquare, LayoutDashboard, Settings, Users } from "lucide-react";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/SidebarShell";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

interface TeacherLayoutProps {
  children: ReactNode;
}

/**
 * O'qituvchi va markaz admini uchun umumiy qobiq.
 * SidebarShell orqali boshqariladi, barcha uslub va xatti-harakatlar saqlangan.
 */
export function TeacherLayout({ children }: TeacherLayoutProps) {
  const { t } = useTranslation("student");
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const homePath = isCenterAdmin ? ROUTES.admin : ROUTES.teacher;
  const tasksPath = isCenterAdmin ? ROUTES.adminTasks : ROUTES.teacherTasks;
  const studentsPath = isCenterAdmin ? ROUTES.adminStudents : ROUTES.teacherStudents;
  const settingsPath = isCenterAdmin ? ROUTES.adminSettings : ROUTES.teacherSettings;

  const navItems: SidebarNavItem[] = [
    {
      key: "dashboard",
      label: t("teacher.nav.home"),
      icon: LayoutDashboard,
      path: homePath,
      match: "exact",
    },
    {
      key: "tasks",
      label: t("teacher.nav.tasks"),
      icon: CheckSquare,
      path: tasksPath,
      match: "prefix",
    },
    {
      key: "students",
      label: t("teacher.nav.students"),
      icon: Users,
      path: studentsPath,
      match: "prefix",
    },
    {
      key: "reports",
      label: t("teacher.nav.reports"),
      icon: BarChart3,
      path: null,
      match: "prefix",
    },
    {
      key: "settings",
      label: t("teacher.nav.settings"),
      icon: Settings,
      path: settingsPath,
      match: "prefix",
    },
  ];

  const promo = {
    title: t("teacher.promo.sideTitle"),
    text: t("teacher.promo.sideText"),
    to: studentsPath,
  };

  return (
    <SidebarShell homePath={homePath} navItems={navItems} promo={promo}>
      {children}
    </SidebarShell>
  );
}
