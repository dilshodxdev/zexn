import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  BookOpen,
  CheckSquare,
  GraduationCap,
  LogOut,
  MessageSquareMore,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/features/auth/useAuth";
import { ROUTES } from "@/routes";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation("student");
  const location = useLocation();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const initial = user?.fullName?.trim().charAt(0).toUpperCase() || "M";
  const displayName = user?.fullName || "mentor";

  const navItems = [
    { label: t("header.navLesson"), path: ROUTES.app, icon: BookOpen },
    { label: t("header.navTasks"), path: ROUTES.studentTasks, icon: CheckSquare },
    { label: t("header.navExam"), path: ROUTES.studentTests, icon: GraduationCap },
    {
      label: t("header.navInterview"),
      path: ROUTES.studentInterview,
      icon: MessageSquareMore,
    },
    { label: t("header.navProfile"), path: ROUTES.studentProfile, icon: User },
  ];

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text antialiased">
      {/* Main Header (56px) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 z-20">
        {/* Left: Brand logo */}
        <div className="flex items-center space-x-3 w-48 sm:w-64 shrink-0">
          <Link to={ROUTES.app} className="flex items-center">
            <img src="/logo-zexn.png" alt="ZEXN" className="h-7 w-auto object-contain" />
          </Link>
        </div>

        {/* Center: Pill-Nav (Desktop) */}
        <nav className="hidden md:flex items-center rounded-full border border-line bg-bg p-1 text-xs font-medium text-muted">
          {navItems.map((item, idx) => {
            const isActive =
              item.path === ROUTES.app
                ? location.pathname === ROUTES.app
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                  isActive ? "bg-brand font-semibold text-bg shadow-sm" : "hover:text-text"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Notifications + Theme toggle + User Chip */}
        <div className="flex items-center space-x-2.5">
          {/* Notifications button */}
          <button
            type="button"
            aria-label={t("header.notifications")}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface-alt text-muted hover:text-text transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-bg">
              1
            </span>
          </button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User chip */}
          <div className="group relative flex items-center space-x-2 rounded-full border border-line bg-surface-alt py-1 px-2.5 transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand font-bold text-bg text-[10px]">
              {initial}
            </div>
            <div className="hidden sm:block text-left text-xs leading-none">
              <div className="flex items-center gap-1 font-semibold text-text truncate max-w-[90px]">
                {displayName}
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-brand">
                <span className="h-1.5 w-1.5 rounded-full bg-brand inline-block" />
                <span>{t("header.online")}</span>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t("header.logout")}
              title={t("header.logout")}
              className="ml-1 text-muted hover:text-danger transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Mobile Bottom Navigation (md:hidden) */}
      <nav className="flex md:hidden h-14 shrink-0 items-center justify-around border-t border-line bg-surface px-2 pb-safe z-20">
        <Link
          to={ROUTES.app}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            location.pathname === ROUTES.app ? "text-brand font-bold" : "text-muted"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{t("header.navLesson")}</span>
        </Link>

        <Link
          to={ROUTES.studentTests}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            location.pathname.startsWith(ROUTES.studentTests)
              ? "text-brand font-bold"
              : "text-muted"
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>{t("header.navExam")}</span>
        </Link>

        <Link
          to={ROUTES.studentTasks}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            location.pathname === ROUTES.studentTasks ? "text-brand font-bold" : "text-muted"
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>{t("header.navTasks")}</span>
        </Link>

        <Link
          to={ROUTES.studentInterview}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            location.pathname.startsWith(ROUTES.studentInterview)
              ? "text-brand font-bold"
              : "text-muted"
          }`}
        >
          <MessageSquareMore className="h-4 w-4" />
          <span>{t("header.navInterview")}</span>
        </Link>

        <Link
          to={ROUTES.studentProfile}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            location.pathname === ROUTES.studentProfile ? "text-brand font-bold" : "text-muted"
          }`}
        >
          <User className="h-4 w-4" />
          <span>{t("header.navProfile")}</span>
        </Link>
      </nav>
    </div>
  );
}
