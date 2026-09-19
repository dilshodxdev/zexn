import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/features/auth/useAuth";

export interface SidebarNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  /** null = hali yo'l yo'q ("tez kunda"), bosilmaydi */
  path: string | null;
  /** Aktivlik: prefix bo'yicha yoki aynan */
  match: "prefix" | "exact";
}

export interface SidebarPromo {
  title: string;
  text: string;
  to: string;
}

export interface SidebarShellProps {
  homePath: string;
  navItems: SidebarNavItem[];
  promo?: SidebarPromo;
  children: ReactNode;
}

export function SidebarShell({ homePath, navItems, promo, children }: SidebarShellProps) {
  const { t } = useTranslation("student");
  const location = useLocation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "O";
  const displayName = user?.fullName || "";

  function isActive(item: SidebarNavItem): boolean {
    if (!item.path) return false;
    return item.match === "prefix"
      ? location.pathname.startsWith(item.path)
      : location.pathname === item.path;
  }

  const mobileItems = navItems.filter((item) => item.path !== null);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text antialiased">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-16 items-center px-5">
          <Link to={homePath} className="flex items-center" aria-label="ZEXN">
            <img src="/logo-zexn.png" alt="ZEXN" className="h-7 w-auto object-contain" />
          </Link>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item);
            const base =
              "flex h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors";
            if (!item.path) {
              return (
                <div
                  key={item.key}
                  className={`${base} cursor-default text-muted/60`}
                  aria-disabled="true"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full border border-line px-1.5 py-0.5 text-[10px] text-muted">
                    {t("teacher.nav.soon")}
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`${base} ${
                  active
                    ? "bg-brand font-semibold text-bg shadow-sm"
                    : "text-muted hover:bg-surface-alt hover:text-text"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 p-3">
          {promo && (
            <Link
              to={promo.to}
              className="relative block overflow-hidden rounded-card bg-brand p-4 text-bg transition-opacity hover:opacity-90"
            >
              <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg text-brand">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <p className="pr-10 text-sm font-bold leading-tight">{promo.title}</p>
              <p className="mt-1 pr-6 text-[11px] leading-snug opacity-80">{promo.text}</p>
            </Link>
          )}

          <div className="flex items-center gap-2 rounded-full border border-line bg-surface-alt py-1.5 pl-1.5 pr-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-bg">
              {initial}
            </div>
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text">
              {displayName}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              aria-label={t("teacher.nav.logout")}
              title={t("teacher.nav.logout")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 md:hidden">
          <Link to={homePath} className="flex items-center" aria-label="ZEXN">
            <img src="/logo-zexn.png" alt="ZEXN" className="h-7 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-bg">
              {initial}
            </div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              aria-label={t("teacher.nav.logout")}
              className="flex h-11 w-11 items-center justify-center text-muted transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Kontent */}
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>

        {/* Mobil bottom nav */}
        <nav className="flex h-14 shrink-0 items-center justify-around border-t border-line bg-surface px-2 pb-safe md:hidden">
          {mobileItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.key}
                to={item.path ?? homePath}
                className={`flex h-11 min-w-16 flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active ? "font-bold text-brand" : "text-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
