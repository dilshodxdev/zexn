import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "./routes";
import { LandingScreen } from "./screens/landing/LandingScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { RegisterScreen } from "./screens/auth/RegisterScreen";
import { SelectCenterScreen } from "./screens/auth/SelectCenterScreen";
import { AppHomeScreen } from "./screens/app/AppHomeScreen";
import { AdminHomeScreen } from "./screens/admin/AdminHomeScreen";
import { HealthScreen } from "./screens/dev/HealthScreen";
import { UiKitScreen } from "./screens/dev/UiKitScreen";
import { RequireAuth } from "./features/auth/RequireAuth";

const router = createBrowserRouter([
  { path: ROUTES.home, element: <LandingScreen /> },
  { path: ROUTES.login, element: <LoginScreen /> },
  { path: ROUTES.register, element: <RegisterScreen /> },
  {
    path: ROUTES.selectCenter,
    element: (
      <RequireAuth>
        <SelectCenterScreen />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.app,
    element: (
      <RequireAuth allowedRoles={["STUDENT", "TEACHER"]}>
        <AppHomeScreen />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.admin,
    element: (
      <RequireAuth allowedRoles={["CENTER_ADMIN"]}>
        <AdminHomeScreen />
      </RequireAuth>
    ),
  },
  ...(import.meta.env.DEV
    ? [
        { path: ROUTES.dev.health, element: <HealthScreen /> },
        { path: ROUTES.dev.uiKit, element: <UiKitScreen /> },
      ]
    : []),
]);

export default function App() {
  return <RouterProvider router={router} />;
}
