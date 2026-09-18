import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "./routes";
import { HomeScreen } from "./screens/home/HomeScreen";
import { UiKitScreen } from "./screens/dev/UiKitScreen";

const routes = [
  { path: ROUTES.home, element: <HomeScreen /> },
  ...(import.meta.env.DEV && "dev" in ROUTES && ROUTES.dev
    ? [{ path: ROUTES.dev.uiKit, element: <UiKitScreen /> }]
    : []),
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}
