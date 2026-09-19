import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button, EmptyState, ErrorState, Spinner } from "@/components/ui";
import { ROUTES } from "@/routes";
import { InterviewChat } from "@/features/interview/InterviewChat";
import { InterviewResult } from "@/features/interview/InterviewResult";
import { useInterviewSession } from "@/features/interview/useInterview";

export function InterviewRunScreen() {
  const { t } = useTranslation("interview");
  const { sessionId = "" } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading, error, refetch } = useInterviewSession(sessionId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState
          message={error instanceof Error ? error.message : t("error")}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title={t("error")}
          action={
            <Button
              variant="secondary"
              size="sm"
              className="min-h-[44px]"
              onClick={() => navigate(ROUTES.studentInterview)}
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              {t("result.again")}
            </Button>
          }
        />
      </div>
    );
  }

  if (session.status === "IN_PROGRESS") {
    return <InterviewChat session={session} />;
  }

  return <InterviewResult session={session} />;
}
