import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { authResponseSchema } from "@zexn/shared";
import "./index.css";
import "./lib/i18n";
import { queryClient } from "./lib/queryClient";
import { API_BASE_URL } from "./lib/api";
import { useAuthStore } from "./stores/authStore";
import { Spinner } from "./components/ui/Spinner";
import App from "./App";

function Root() {
  const [initialized, setInitialized] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true, timeout: 5000 },
        );
        const parsed = authResponseSchema.safeParse(res.data);
        if (parsed.success && active) {
          setSession(parsed.data);
        } else if (active) {
          clear();
        }
      } catch {
        if (active) {
          clear();
        }
      } finally {
        if (active) {
          setInitialized(true);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [setSession, clear]);

  if (!initialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bg text-brand">
        <Spinner size="md" />
      </div>
    );
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>,
);
