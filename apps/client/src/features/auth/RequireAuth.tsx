import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "@zexn/shared";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export interface RequireAuthProps {
  children?: ReactNode;
  allowedRoles?: Role[];
  requireSuperAdmin?: boolean;
}

export function RequireAuth({ children, allowedRoles, requireSuperAdmin }: RequireAuthProps) {
  const location = useLocation();
  const { accessToken, user, currentMembership, memberships } = useAuthStore();

  if (!accessToken) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  // Birinchi kirishda parol o'zgartirish majburiy
  if (user?.mustChangePassword && location.pathname !== ROUTES.changePassword) {
    return <Navigate to={ROUTES.changePassword} replace />;
  }

  // Superadmin yo'li uchun
  if (requireSuperAdmin) {
    if (user?.isSuperAdmin) {
      return children ? <>{children}</> : null;
    }
    // Agar superadmin bo'lmasa, o'z rol zonasiga yo'naltirish
    if (currentMembership?.role === "CENTER_ADMIN") {
      return <Navigate to={ROUTES.admin} replace />;
    }
    if (currentMembership?.role === "TEACHER") {
      return <Navigate to={ROUTES.teacher} replace />;
    }
    return <Navigate to={ROUTES.app} replace />;
  }

  // Agar superadmin oddiy zonaga kelsa va membership bo'lmasa, superadminga yo'naltirish
  if (user?.isSuperAdmin && !currentMembership && memberships.length === 0) {
    return <Navigate to={ROUTES.superadmin} replace />;
  }

  // Agar markaz tanlanmagan bo'lsa va bir nechta markaz mavjud bo'lsa
  if (!currentMembership && memberships.length > 1 && location.pathname !== ROUTES.selectCenter) {
    return <Navigate to={ROUTES.selectCenter} replace />;
  }

  // Rol tekshiruvi
  if (allowedRoles && currentMembership && !allowedRoles.includes(currentMembership.role)) {
    if (user?.isSuperAdmin) {
      return <Navigate to={ROUTES.superadmin} replace />;
    }
    if (currentMembership.role === "CENTER_ADMIN") {
      return <Navigate to={ROUTES.admin} replace />;
    }
    if (currentMembership.role === "TEACHER") {
      return <Navigate to={ROUTES.teacher} replace />;
    }
    return <Navigate to={ROUTES.app} replace />;
  }

  return children ? <>{children}</> : null;
}
