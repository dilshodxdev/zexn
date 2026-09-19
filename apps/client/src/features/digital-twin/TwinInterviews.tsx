import { useTranslation } from "react-i18next";
import { MessageSquareMore, Clock } from "lucide-react";
import { Badge, Card, Spinner, ErrorState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { useTeacherStudentInterviews } from "@/features/interview/useInterview";

interface TwinInterviewsProps {
  studentId: string;
}

export function TwinInterviews({ studentId }: TwinInterviewsProps) {
  const { t } = useTranslation("twin");
  const { data: interviews, isLoading, error, refetch } = useTeacherStudentInterviews(studentId);

  if (isLoading) {
    return (
      <Card title={t("interviews.title")} subtitle={t("interviews.subtitle")}>
        <div className="flex h-24 items-center justify-center">
          <Spinner size="sm" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={t("interviews.title")} subtitle={t("interviews.subtitle")}>
        <ErrorState
          message={error instanceof Error ? error.message : t("errorLoad")}
          onRetry={() => void refetch()}
        />
      </Card>
    );
  }

  return (
    <Card title={t("interviews.title")} subtitle={t("interviews.subtitle")} className="space-y-3">
      {!interviews || interviews.length === 0 ? (
        <p className="text-xs text-muted italic p-2">{t("interviews.empty")}</p>
      ) : (
        <div className="space-y-2.5">
          {interviews.map((item) => {
            const statusTone =
              item.status === "DONE" ? "ok" : item.status === "IN_PROGRESS" ? "brand" : "neutral";

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-alt p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquareMore className="h-4 w-4 text-brand shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-text">
                      {item.skill ? `${item.skill.name} (${item.track})` : item.track}
                    </span>
                    <Badge tone={statusTone}>{t(`interviews.status.${item.status}`)}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-muted font-mono">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{formatDateTime(item.startedAt)}</span>
                    <span>•</span>
                    <span>
                      {item.answeredCount}/{item.questionCount}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {item.score !== null ? (
                    <span className="font-mono text-sm font-black text-brand">
                      {t("interviews.score", { score: item.score })}
                    </span>
                  ) : (
                    <span className="text-xs text-muted font-mono">{t("interviews.noScore")}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
