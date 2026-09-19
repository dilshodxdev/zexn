import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, ChevronRight } from "lucide-react";
import { Badge, Card, Spinner, ErrorState } from "@/components/ui";
import { ROUTES } from "@/routes";
import { formatDateTime } from "@/lib/utils";
import { useStudentInterviews } from "./useInterview";

export function InterviewHistory() {
  const { t } = useTranslation("interview");
  const navigate = useNavigate();
  const { data: interviews, isLoading, error, refetch } = useStudentInterviews();

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : t("error")}
        onRetry={() => void refetch()}
      />
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <Card className="border-line bg-surface p-6 text-center">
        <p className="text-xs text-muted italic">{t("history.empty")}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-text sm:text-base">{t("history.title")}</h2>

      <div className="space-y-2.5">
        {interviews.map((item) => {
          const statusTone =
            item.status === "DONE" ? "ok" : item.status === "IN_PROGRESS" ? "brand" : "neutral";

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(ROUTES.studentInterviewRun(item.id))}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5 sm:p-4 text-left transition-colors hover:border-brand/40 hover:bg-surface-alt/60 min-h-[44px]"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text sm:text-sm">
                    {item.skill
                      ? `${t(`tracks.${item.track}`)} (${item.skill.name})`
                      : t(`tracks.${item.track}`)}
                  </span>
                  <Badge tone={statusTone}>{t(`history.status.${item.status}`)}</Badge>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatDateTime(item.startedAt)}</span>
                  <span>•</span>
                  <span>
                    {t("history.questionsProgress", {
                      answered: item.answeredCount,
                      total: item.questionCount,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {item.score !== null ? (
                  <span className="font-mono text-xs sm:text-sm font-black text-brand">
                    {t("history.score", { score: item.score })}
                  </span>
                ) : (
                  <span className="text-[11px] text-muted">{t("history.noScore")}</span>
                )}
                <ChevronRight className="h-4 w-4 text-muted" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
