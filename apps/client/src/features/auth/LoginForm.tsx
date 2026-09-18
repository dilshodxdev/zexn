import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ERROR_CODES } from "@zexn/shared";
import { Button, Input } from "@/components/ui";
import { useLogin } from "./useAuth";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/routes";

export function LoginForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [loginVal, setLoginVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    try {
      const data = await loginMutation.mutateAsync({
        login: loginVal,
        password: passwordVal,
      });

      if (data.user.mustChangePassword) {
        navigate("/app/change-password", { replace: true });
        return;
      }

      if (!data.currentMembership && data.memberships.length > 1) {
        navigate(ROUTES.selectCenter, { replace: true });
        return;
      }

      const role = data.currentMembership?.role;
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

      if (fromPath && fromPath !== ROUTES.login && fromPath !== ROUTES.register) {
        navigate(fromPath, { replace: true });
      } else if (role === "CENTER_ADMIN") {
        navigate(ROUTES.admin, { replace: true });
      } else {
        navigate(ROUTES.app, { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === API_ERROR_CODES.INVALID_CREDENTIALS) {
          setGeneralError(t("auth:errors.invalidCredentials"));
          return;
        }

        if (err.meta?.issues && Array.isArray(err.meta.issues)) {
          const errors: Record<string, string> = {};
          for (const issue of err.meta.issues) {
            if (
              typeof issue === "object" &&
              issue !== null &&
              "path" in issue &&
              "message" in issue
            ) {
              const path = String((issue as { path: unknown }).path);
              errors[path] = String((issue as { message: unknown }).message);
            }
          }
          setFieldErrors(errors);
          return;
        }

        setGeneralError(err.message || t("auth:errors.genericError"));
      } else {
        setGeneralError(t("auth:errors.networkError"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {generalError && (
        <div className="rounded-md border border-danger/30 bg-danger-soft/20 p-3 text-xs text-danger">
          {generalError}
        </div>
      )}

      <Input
        label={t("auth:loginLabel")}
        placeholder={t("auth:loginPlaceholder")}
        value={loginVal}
        onChange={(e) => setLoginVal(e.target.value)}
        error={fieldErrors.login}
        autoComplete="username"
        required
      />

      <Input
        label={t("auth:passwordLabel")}
        type="password"
        placeholder={t("auth:passwordPlaceholder")}
        value={passwordVal}
        onChange={(e) => setPasswordVal(e.target.value)}
        error={fieldErrors.password}
        autoComplete="current-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={loginMutation.isPending}
        fullWidth
        className="mt-2"
      >
        {t("auth:submitLogin")}
      </Button>
    </form>
  );
}
