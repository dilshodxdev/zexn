import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import { ROUTES } from "@/routes";
import { TrackPicker } from "@/features/interview/TrackPicker";
import { InterviewHistory } from "@/features/interview/InterviewHistory";
import { useStudentInterviews } from "@/features/interview/useInterview";

export function InterviewScreen() {
  const { t } = useTranslation("interview");
  const navigate = useNavigate();
  const { data: interviews } = useStudentInterviews();

  // Find any active IN_PROGRESS session
  const activeSession = interviews?.find((i) => i.status === "IN_PROGRESS");

  const activeTrackTitle = activeSession?.skill
    ? `${t(`tracks.${activeSession.track}`)} (${activeSession.skill.name})`
    : activeSession
      ? t(`tracks.${activeSession.track}`)
      : "";

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        {/* Active Session Resume Banner */}
        {activeSession && (
          <Card className="border-brand/40 bg-brand-soft/30 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-bg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-sm font-bold text-text">{t("activeSession.title")}</h2>
                  <p className="text-xs text-muted">
                    {t("activeSession.desc", {
                      track: activeTrackTitle,
                      answered: activeSession.answeredCount,
                      total: activeSession.questionCount,
                    })}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="min-h-[44px] shrink-0"
                onClick={() => navigate(ROUTES.studentInterviewRun(activeSession.id))}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                {t("activeSession.resume")}
              </Button>
            </div>
          </Card>
        )}

        {/* Available Tracks to Interview */}
        <TrackPicker />

        {/* Previous History */}
        <div className="pt-4 border-t border-line">
          <InterviewHistory />
        </div>
      </div>
    </div>
  );
}
