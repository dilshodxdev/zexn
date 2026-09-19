import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Paperclip,
  Save,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card, ErrorState, PageHeader, Spinner } from "@/components/ui";
import { DifficultyBadge } from "@/features/assignments/DifficultyBadge";
import { DueLabel } from "@/features/assignments/DueLabel";
import { SubmissionStatusBadge } from "@/features/assignments/SubmissionStatusBadge";
import {
  useSaveStudentSubmission,
  useStartStudentAssignment,
  useStudentAssignmentDetail,
  useSubmitStudentAssignment,
} from "@/features/assignments/useAssignments";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { ROUTES } from "@/routes";

export function TaskDetailScreen() {
  const { t } = useTranslation("assignments");
  const { assignmentId = "" } = useParams<{ assignmentId: string }>();

  const {
    data: assignment,
    isLoading,
    isError,
    error,
    refetch,
  } = useStudentAssignmentDetail(assignmentId);

  const startMutation = useStartStudentAssignment();
  const saveMutation = useSaveStudentSubmission(assignmentId);
  const submitMutation = useSubmitStudentAssignment(assignmentId);

  const [content, setContent] = useState("");
  const [progress, setProgress] = useState(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (assignment) {
      setContent(assignment.submission?.content || "");
      setProgress(assignment.progress || 0);
    }
  }, [assignment]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError || !assignment) {
    const message =
      error instanceof ApiError ? error.message : (error as Error)?.message || t("error.detail");

    return (
      <div className="flex h-full items-center justify-center p-6">
        <ErrorState message={message} onRetry={() => void refetch()} />
      </div>
    );
  }

  const { status, submission } = assignment;

  async function handleStart() {
    await startMutation.mutateAsync(assignmentId);
  }

  async function handleSave() {
    setSaveSuccessMsg(null);
    try {
      await saveMutation.mutateAsync({ content, progress: Number(progress) });
      setSaveSuccessMsg(t("detail.saveSuccess"));
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      if ((err as ApiError)?.status === 409) {
        void refetch();
      }
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    const confirmed = window.confirm(t("detail.confirmSubmit"));
    if (!confirmed) return;

    try {
      await submitMutation.mutateAsync(content.trim());
    } catch (err) {
      if ((err as ApiError)?.status === 409) {
        void refetch();
      }
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Link & Header */}
        <PageHeader
          title={assignment.title}
          subtitle={assignment.topic?.title}
          actions={
            <Link to={ROUTES.studentTasks}>
              <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                {t("detail.backToTasks")}
              </Button>
            </Link>
          }
        />

        {/* Info Card */}
        <Card className="border-line bg-surface p-6 shadow-sm space-y-5">
          {/* Badges row */}
          <div className="flex items-center gap-2.5 flex-wrap border-b border-line pb-4">
            <SubmissionStatusBadge status={status} />
            <DifficultyBadge difficulty={assignment.difficulty} />
            {assignment.topic && (
              <Link
                to={ROUTES.studentTopic(assignment.topic.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                <span>{assignment.topic.title}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            <DueLabel dueAt={assignment.dueAt} status={status} />
            {assignment.isAiRecommended && (
              <Badge tone="brand" className="text-[10px]">
                <Sparkles className="h-3 w-3 mr-0.5" />
                {t("row.aiRecommended")}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              {t("detail.description")}
            </h2>
            <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>
          </div>

          {/* Resources */}
          {assignment.resources.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-line">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{t("detail.materialsTitle")}</span>
              </h3>
              <div className="flex flex-col gap-2">
                {assignment.resources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand hover:underline"
                  >
                    <span>{res.title}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Teacher Feedback Card (if any) */}
        {submission?.feedback && (
          <Card className="border-warn/40 bg-warn-soft/10 p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-warn font-bold text-xs sm:text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{t("detail.teacherFeedback")}</span>
            </div>
            <p className="text-xs sm:text-sm text-text leading-relaxed">{submission.feedback}</p>
          </Card>
        )}

        {/* Response / Submission Section */}
        <Card className="border-line bg-surface p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="text-base font-bold text-text">{t("detail.submissionTitle")}</h2>
            <SubmissionStatusBadge status={status} />
          </div>

          {/* 1. Status: NEW */}
          {status === "NEW" && (
            <div className="py-6 text-center space-y-4">
              <p className="text-xs sm:text-sm text-muted">
                Vazifani boshlash uchun quyidagi tugmani bosing.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={handleStart}
                disabled={startMutation.isPending}
                icon={startMutation.isPending ? <Spinner size="sm" /> : undefined}
              >
                {t("row.start")}
              </Button>
            </div>
          )}

          {/* 2. Status: IN_PROGRESS */}
          {status === "IN_PROGRESS" && (
            <div className="space-y-5">
              {/* Textarea */}
              <div className="space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={8000}
                  rows={8}
                  placeholder={t("detail.answerPlaceholder")}
                  className="w-full rounded-2xl border border-line bg-surface-alt p-4 font-mono text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
                />
                <div className="flex justify-end text-[11px] font-mono text-muted">
                  {content.length} / 8000
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 rounded-2xl border border-line bg-surface-alt p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-text">
                  <span>{t("detail.completionLevel", { value: progress })}</span>
                  <span className="font-mono text-brand">{progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
              </div>

              {saveSuccessMsg && <p className="text-xs text-ok font-medium">{saveSuccessMsg}</p>}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleSave}
                  disabled={saveMutation.isPending || submitMutation.isPending}
                  icon={
                    saveMutation.isPending ? <Spinner size="sm" /> : <Save className="h-4 w-4" />
                  }
                >
                  {saveMutation.isPending ? t("detail.saving") : t("detail.save")}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  disabled={!content.trim() || submitMutation.isPending || saveMutation.isPending}
                  icon={
                    submitMutation.isPending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />
                  }
                >
                  {submitMutation.isPending ? t("detail.submitting") : t("detail.submit")}
                </Button>
              </div>
            </div>
          )}

          {/* 3. Status: SUBMITTED */}
          {status === "SUBMITTED" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-warn/30 bg-warn-soft/10 p-3.5 text-xs text-text flex items-center gap-2">
                <Badge tone="warn">{t("status.SUBMITTED")}</Badge>
                <span>{t("detail.viewOnlySubmitted")}</span>
              </div>

              {submission?.submittedAt && (
                <p className="text-xs text-muted">
                  {t("detail.submittedAt", { date: formatDateTime(submission.submittedAt) })}
                </p>
              )}

              <pre className="max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface-alt p-4 font-mono text-xs sm:text-sm text-text whitespace-pre-wrap">
                {submission?.content || content}
              </pre>
            </div>
          )}

          {/* 4. Status: DONE */}
          {status === "DONE" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-ok/30 bg-ok-soft/10 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-ok" />
                  <span className="text-xs sm:text-sm font-bold text-text">
                    {t("detail.viewOnlyDone")}
                  </span>
                </div>
                {assignment.score !== null && (
                  <div className="font-mono text-xl sm:text-2xl font-black text-ok">
                    {assignment.score} <span className="text-xs font-normal">ball</span>
                  </div>
                )}
              </div>

              {submission?.reviewedAt && (
                <p className="text-xs text-muted">
                  {t("detail.reviewedAt", { date: formatDateTime(submission.reviewedAt) })}
                </p>
              )}

              <pre className="max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface-alt p-4 font-mono text-xs sm:text-sm text-text whitespace-pre-wrap">
                {submission?.content || content}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
