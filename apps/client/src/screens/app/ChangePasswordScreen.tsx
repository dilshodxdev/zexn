import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound, Lock } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

export function ChangePasswordScreen() {
  const { t } = useTranslation("student");
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Yangi parollar mos kelmadi");
      return;
    }
    if (newPassword.length < 8) {
      setError("Parol kamida 8 ta belgi bo'lishi kerak");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      if (user) {
        user.mustChangePassword = false;
      }
      navigate(ROUTES.app, { replace: true });
    } catch (err: unknown) {
      const msg =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: string }).message === "string"
          ? (err as { message: string }).message
          : "Parolni o'zgartirishda xatolik yuz berdi";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="max-w-md w-full border-line bg-surface p-6 sm:p-8 shadow-pop space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface-alt text-brand">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-text">{t("changePassword.title")}</h1>
          <p className="text-xs text-muted leading-relaxed">{t("changePassword.subtitle")}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            label={t("changePassword.currentPassword")}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Input
            type="password"
            label={t("changePassword.newPassword")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            type="password"
            label={t("changePassword.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              disabled={loading}
              icon={<Lock className="h-4 w-4" />}
            >
              {loading ? "Saqlanmoqda..." : t("changePassword.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
