import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ROUTES } from "./routes";
import { HomeScreen } from "./screens/home/HomeScreen";

const router = createBrowserRouter([{ path: ROUTES.home, element: <HomeScreen /> }]);

export default function App() {
  return <RouterProvider router={router} />;
}
