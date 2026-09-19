import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Clock, Cpu, RotateCcw, Send, Sparkles } from "lucide-react";
import { AI_PROMPT_MAX, API_ERROR_CODES, type TestAiPromptResponse } from "@zexn/shared";
import { Badge, Button, Card, ErrorState, Spinner } from "@/components/ui";
import { useAiSettings, useTestAiPrompt, useUpdateAiSettings } from "./useSettings";
import { type SettingsScope } from "./settings.api";
import { ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";

interface AiPromptFormProps {
  scope: SettingsScope;
}

export function AiPromptForm({ scope }: AiPromptFormProps) {
  const { t } = useTranslation("settings");

  const { data: settings, isLoading, isError, refetch } = useAiSettings(scope);
  const updateMutation = useUpdateAiSettings(scope);
  const testMutation = useTestAiPrompt(scope);

  const [prompt, setPrompt] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Test state
  const [testMessage, setTestMessage] = useState("");
  const [testResult, setTestResult] = useState<TestAiPromptResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !hasChanged) {
      setPrompt(settings.prompt);
    }
  }, [settings, hasChanged]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="p-4">
        <ErrorState message={t("errorLoad")} onRetry={() => void refetch()} />
      </div>
    );
  }

  const providerTone = settings.provider === "deepseek" ? "brand" : "neutral";
  const providerLabel =
    settings.provider === "deepseek" ? t("providerDeepseek") : t("providerMock");

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({ prompt: prompt.trim() });
      setHasChanged(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 2000);
    } catch {
      // Handled by query client / error boundary
    }
  }

  async function handleTest() {
    if (!testMessage.trim() || testMutation.isPending) return;
    setTestError(null);
    setTestResult(null);

    try {
      const res = await testMutation.mutateAsync({
        prompt: prompt.trim(),
        message: testMessage.trim(),
      });
      setTestResult(res);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === API_ERROR_CODES.AI_UNAVAILABLE || err.status === 503)
      ) {
        setTestError(t("errorAiUnavailable"));
      } else {
        setTestError((err as Error).message || t("errorTest"));
      }
    }
  }

  const isOverLimit = prompt.length > AI_PROMPT_MAX;

  return (
    <div className="space-y-6">
      {/* Asosiy prompt tahrirlash kartasi */}
      <Card className="space-y-5 p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 flex-wrap border-b border-line pb-4">
          <div>
            <h2 className="text-base font-bold text-text">
              {scope === "platform" ? t("platformTitle") : t("centerTitle")}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {scope === "platform" ? t("platformSubtitle") : t("centerSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge tone={providerTone} className="text-xs font-semibold">
              <Cpu className="h-3.5 w-3.5" />
              <span>{providerLabel}</span>
            </Badge>
          </div>
        </div>

        {/* Textarea + Hisoblagich */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t("promptLabel")}
            </label>
            <span
              className={`text-xs font-mono font-medium ${
                isOverLimit ? "text-danger font-bold" : "text-muted"
              }`}
            >
              {t("charCounter", { current: prompt.length, max: AI_PROMPT_MAX })}
            </span>
          </div>

          <textarea
            rows={7}
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setHasChanged(true);
            }}
            placeholder={t("promptPlaceholder")}
            className="min-h-40 w-full rounded-xl border border-line bg-surface-alt p-3.5 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none font-mono leading-relaxed transition-colors"
          />
        </div>

        {/* Default prompt yordam matni */}
        <div className="rounded-xl border border-line bg-surface-alt p-3.5 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              {t("defaultPromptLabel")}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs text-brand hover:text-brand-hover"
              icon={<RotateCcw className="h-3 w-3" />}
              onClick={() => {
                setPrompt("");
                setHasChanged(true);
              }}
            >
              {t("resetToDefault")}
            </Button>
          </div>
          <p className="text-[11px] text-muted leading-relaxed font-mono whitespace-pre-wrap">
            {settings.defaultPrompt}
          </p>
        </div>

        {/* Oxirgi o'zgarish info + Saqlash tugmasi */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between border-t border-line">
          <div>
            {settings.updatedBy && settings.updatedAt ? (
              <p className="text-xs text-muted font-medium">
                {t("updatedBy", {
                  name: settings.updatedBy.fullName,
                  date: formatDateTime(settings.updatedAt),
                })}
              </p>
            ) : settings.updatedAt ? (
              <p className="text-xs text-muted font-medium">
                {t("updatedAt", { date: formatDateTime(settings.updatedAt) })}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <Badge tone="ok" className="text-xs font-semibold">
                <Check className="h-3.5 w-3.5" />
                <span>{t("saved")}</span>
              </Badge>
            )}

            <Button
              variant="primary"
              size="md"
              className="min-h-[44px] px-6"
              disabled={updateMutation.isPending || isOverLimit}
              loading={updateMutation.isPending}
              onClick={handleSave}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Sinab ko'rish bo'limi */}
      <Card className="space-y-4 p-4 sm:p-6">
        <div>
          <h3 className="text-base font-bold text-text">{t("testSectionTitle")}</h3>
          <p className="mt-0.5 text-xs text-muted">{t("testSectionSubtitle")}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-text">{t("testMessageLabel")}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder={t("testMessagePlaceholder")}
              className="flex-1 rounded-xl border border-line bg-surface-alt px-3.5 py-2.5 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
            <Button
              variant="secondary"
              size="md"
              className="min-h-[44px] shrink-0"
              disabled={!testMessage.trim() || testMutation.isPending}
              loading={testMutation.isPending}
              icon={<Send className="h-4 w-4" />}
              onClick={handleTest}
            >
              {t("testSubmit")}
            </Button>
          </div>
        </div>

        {/* Xato xabari (503 AI_UNAVAILABLE yoki boshqa) */}
        {testError && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft/20 p-3.5 text-xs text-danger font-medium">
            {testError}
          </div>
        )}

        {/* Sinov natijasi */}
        {testResult && (
          <div className="space-y-2 rounded-xl border border-line bg-surface-alt p-4">
            <div className="flex items-center justify-between gap-2 border-b border-line pb-2 flex-wrap">
              <span className="text-xs font-bold text-text">{t("testReply")}</span>
              <div className="flex items-center gap-3 text-xs text-muted font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {t("testLatency", { ms: testResult.latencyMs })}
                </span>
                <Badge tone="neutral" className="text-[10px]">
                  {testResult.provider}
                </Badge>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-text leading-relaxed font-medium whitespace-pre-wrap pt-1">
              {testResult.reply}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
