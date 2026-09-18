import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { registerCenterBodySchema } from "@zexn/shared";
import { Button, Input } from "@/components/ui";
import { useRegisterCenter } from "./useAuth";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/routes";

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegisterCenter();

  const [centerName, setCenterName] = useState("");
  const [fullName, setFullName] = useState("");
  const [loginVal, setLoginVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const clientSchema = registerCenterBodySchema
    .extend({
      passwordConfirm: z.string().min(1, "Parolni tasdiqlash majburiy"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: t("auth:errors.passwordMismatch"),
      path: ["passwordConfirm"],
    });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const validation = clientSchema.safeParse({
      centerName,
      fullName,
      login: loginVal,
      password: passwordVal,
      passwordConfirm,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const path = String(issue.path[0]);
        if (!errors[path]) {
          errors[path] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    try {
      await registerMutation.mutateAsync({
        centerName,
        fullName,
        login: loginVal,
        password: passwordVal,
      });

      // Markaz ro'yxatdan o'tganda birinchi foydalanuvchi CENTER_ADMIN bo'ladi
      navigate(ROUTES.admin, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
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
        label={t("auth:centerNameLabel")}
        placeholder={t("auth:centerNamePlaceholder")}
        value={centerName}
        onChange={(e) => setCenterName(e.target.value)}
        error={fieldErrors.centerName}
        required
      />

      <Input
        label={t("auth:fullNameLabel")}
        placeholder={t("auth:fullNamePlaceholder")}
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        error={fieldErrors.fullName}
        required
      />

      <Input
        label={t("auth:loginLabel")}
        placeholder={t("auth:loginPlaceholder")}
        hint={t("auth:loginHint")}
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
        autoComplete="new-password"
        required
      />

      <Input
        label={t("auth:passwordConfirmLabel")}
        type="password"
        placeholder={t("auth:passwordConfirmPlaceholder")}
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        error={fieldErrors.passwordConfirm}
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={registerMutation.isPending}
        fullWidth
        className="mt-2"
      >
        {t("auth:submitRegister")}
      </Button>
    </form>
  );
}
