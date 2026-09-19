import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Activity, Check, RotateCcw, X } from "lucide-react";
import { Badge, Button, Card, ErrorState, Spinner } from "@/components/ui";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { useReviewSubmission, useSubmissionDetail } from "./useAssignments";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

interface ReviewPanelProps {
  assignmentId: string;
  studentId: string | null;
  onClose: () => void;
}

export function ReviewPanel({ assignmentId, studentId, onClose }: ReviewPanelProps) {
  const { t } = useTranslation("assignments");
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const twinUrl = (sId: string) =>
    isCenterAdmin ? ROUTES.adminStudentTwin(sId) : ROUTES.teacherStudentTwin(sId);

  const {
    data: submission,
    isLoading,
    isError,
    refetch,
  } = useSubmissionDetail(assignmentId, studentId || "", Boolean(studentId));

  const reviewMutation = useReviewSubmission(assignmentId, studentId || "");

  const [score, setScore] = useState<number>(100);
  const [feedback, setFeedback] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? 100);
      setFeedback(submission.feedback ?? "");
    }
    setErrorMsg(null);
  }, [submission]);

  if (!studentId) return null;

  async function handleAccept() {
    if (score < 0 || score > 100 || isNaN(score)) {
      setErrorMsg(t("manage.scoreRequired"));
      return;
    }
    setErrorMsg(null);
    try {
      await reviewMutation.mutateAsync({
        decision: "accept",
        score: Number(score),
        feedback: feedback.trim() ? feedback.trim() : undefined,
      });
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  async function handleReturn() {
    if (!feedback.trim()) {
      setErrorMsg(t("manage.feedbackRequired"));
      return;
    }
    setErrorMsg(null);
    try {
      await reviewMutation.mutateAsync({
        decision: "return",
        feedback: feedback.trim(),
      });
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-bg/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-line bg-surface p-5 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-text">{t("manage.reviewTitle")}</h2>
            {submission && (
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <p className="text-xs text-muted">
                  {t("manage.reviewStudent", {
                    name: submission.fullName,
                    login: submission.login,
                  })}
                </p>
                <span className="text-line">|</span>
                <Link
                  to={twinUrl(submission.studentId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>{t("manage.digitalTwinFull")}</span>
                </Link>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-surface-alt hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : isError || !submission ? (
          <div className="p-4">
            <ErrorState message={t("error.detail")} onRetry={() => void refetch()} />
          </div>
        ) : (
          <div className="flex-1 space-y-5 pt-4">
            {/* Status info */}
            <div className="flex items-center justify-between">
              <SubmissionStatusBadge status={submission.status} />
              {submission.submittedAt && (
                <span className="text-xs text-muted">{formatDateTime(submission.submittedAt)}</span>
              )}
            </div>

            {/* Submission Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text">
                {t("detail.submissionTitle")}
              </label>
              <pre className="max-h-60 overflow-y-auto rounded-xl border border-line bg-surface-alt p-3.5 font-mono text-xs text-text whitespace-pre-wrap">
                {submission.content || "-"}
              </pre>
            </div>

            {/* Existing Feedback if not submitted */}
            {submission.status !== "SUBMITTED" && submission.feedback && (
              <Card className="border-warn/30 bg-warn-soft/10 p-3.5 space-y-1">
                <span className="text-xs font-bold text-warn">{t("detail.teacherFeedback")}</span>
                <p className="text-xs text-text">{submission.feedback}</p>
              </Card>
            )}

            {/* Existing Score */}
            {submission.score !== null && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{t("detail.scoreLabel")}:</span>
                <Badge tone="ok" className="font-mono font-bold text-sm">
                  {submission.score} ball
                </Badge>
              </div>
            )}

            {/* Review Form: Only active for SUBMITTED */}
            {submission.status === "SUBMITTED" && (
              <div className="space-y-4 pt-3 border-t border-line">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    {t("manage.scoreLabel")} *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-32 rounded-xl border border-line bg-surface-alt px-3 py-1.5 font-mono text-xs sm:text-sm text-text focus:border-brand focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    {t("manage.feedbackLabel")}
                  </label>
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={t("manage.feedbackPlaceholder")}
                    className="w-full rounded-xl border border-line bg-surface-alt p-3 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
                  />
                </div>

                {errorMsg && <p className="text-xs text-danger font-medium">{errorMsg}</p>}

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAccept}
                    disabled={reviewMutation.isPending}
                    icon={<Check className="h-4 w-4" />}
                    className="flex-1"
                  >
                    {t("manage.accept")}
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleReturn}
                    disabled={reviewMutation.isPending}
                    icon={<RotateCcw className="h-4 w-4" />}
                    className="flex-1"
                  >
                    {t("manage.return")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
