import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Building2, LayoutDashboard, Settings, Users } from "lucide-react";
import { SidebarShell, type SidebarNavItem } from "@/components/layout/SidebarShell";
import { ROUTES } from "@/routes";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { t } = useTranslation("student");

  const navItems: SidebarNavItem[] = [
    {
      key: "dashboard",
      label: t("superadmin.nav.dashboard"),
      icon: LayoutDashboard,
      path: ROUTES.superadmin,
      match: "exact",
    },
    {
      key: "settings",
      label: t("superadmin.nav.settings"),
      icon: Settings,
      path: ROUTES.superadminSettings,
      match: "prefix",
    },
    {
      key: "centers",
      label: t("superadmin.nav.centers"),
      icon: Building2,
      path: null,
      match: "prefix",
    },
    {
      key: "users",
      label: t("superadmin.nav.users"),
      icon: Users,
      path: null,
      match: "prefix",
    },
  ];

  const promo = {
    title: t("superadmin.promo.sideTitle"),
    text: t("superadmin.promo.sideText"),
    to: ROUTES.superadminSettings,
  };

  return (
    <SidebarShell homePath={ROUTES.superadmin} navItems={navItems} promo={promo}>
      {children}
    </SidebarShell>
  );
}
