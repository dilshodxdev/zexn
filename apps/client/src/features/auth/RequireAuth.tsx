import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Role } from "@zexn/shared";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export interface RequireAuthProps {
  children?: ReactNode;
  allowedRoles?: Role[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const location = useLocation();
  const { accessToken, currentMembership, memberships } = useAuthStore();

  if (!accessToken) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  // Agar markaz tanlanmagan bo'lsa va tanlash imkoni bo'lsa
  if (!currentMembership && memberships.length > 1) {
    return <Navigate to={ROUTES.selectCenter} replace />;
  }

  // Agar aniq rollar talab qilingan bo'lsa va foydalanuvchi roli mos kelmasa
  if (allowedRoles && currentMembership && !allowedRoles.includes(currentMembership.role)) {
    if (currentMembership.role === "CENTER_ADMIN") {
      return <Navigate to={ROUTES.admin} replace />;
    }
    return <Navigate to={ROUTES.app} replace />;
  }

  return children ? <>{children}</> : null;
}
