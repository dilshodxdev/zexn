import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExternalLink, MessageSquare, RotateCcw, Send, Sparkles } from "lucide-react";
import type { NextStepActionType, TwinNextStep } from "@zexn/shared";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { useAssignNextStep, useCreateNextStep, useSendNote } from "./useDigitalTwin";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/routes";

interface TwinNextStepCardProps {
  studentId: string;
  nextSteps: TwinNextStep[];
}

export function TwinNextStepCard({ studentId, nextSteps }: TwinNextStepCardProps) {
  const { t } = useTranslation("twin");
  const { currentMembership } = useAuthStore();

  const isCenterAdmin = currentMembership?.role === "CENTER_ADMIN";
  const taskLink = (id: string) => (isCenterAdmin ? ROUTES.adminTask(id) : ROUTES.teacherTask(id));

  const assignMutation = useAssignNextStep(studentId);
  const retestMutation = useCreateNextStep(studentId);
  const sendNoteMutation = useSendNote(studentId);

  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [showNoteSuccess, setShowNoteSuccess] = useState(false);

  const primaryStep = nextSteps[0];
  const otherSteps = nextSteps.slice(1);

  if (!primaryStep) {
    return (
      <Card title={t("nextStep.title")}>
        <EmptyState
          title={t("nextStep.empty")}
          icon={<Sparkles className="h-6 w-6 text-brand" />}
        />
      </Card>
    );
  }

  const actionTone: Record<NextStepActionType, "brand" | "warn" | "info"> = {
    TARGETED_TASK: "brand",
    RETEST: "warn",
    REVIEW_MATERIAL: "info",
  };

  async function handleSendNote() {
    if (!noteText.trim() || sendNoteMutation.isPending) return;
    try {
      await sendNoteMutation.mutateAsync({ text: noteText.trim() });
      setNoteText("");
      setIsNoteOpen(false);
      setShowNoteSuccess(true);
      setTimeout(() => {
        setShowNoteSuccess(false);
      }, 2000);
    } catch {
      // Handled by query client / error boundary
    }
  }

  return (
    <Card title={t("nextStep.title")} className="space-y-4">
      {/* Primary recommendation card */}
      <div className="rounded-xl border border-brand/40 bg-brand-soft/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-text">{primaryStep.skillName}</h3>
            <div className="mt-1 text-xs text-muted">
              <span className="font-semibold text-text">{t("nextStep.reasonLabel")}</span>{" "}
              {primaryStep.reason}
            </div>
          </div>
          <Badge tone={actionTone[primaryStep.actionType]} className="text-xs font-semibold">
            {t(`nextStep.actionType.${primaryStep.actionType}`)}
          </Badge>
        </div>

        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">
            {primaryStep.instruction}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {primaryStep.assignmentId ? (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md" className="min-h-[44px]" disabled>
                {t("nextStep.assigned")}
              </Button>
              <Link
                to={taskLink(primaryStep.assignmentId)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline px-2 py-1 min-h-[44px]"
              >
                <span>{t("nextStep.viewTask")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="min-h-[44px]"
              disabled={assignMutation.isPending}
              loading={assignMutation.isPending}
              icon={<Send className="h-4 w-4" />}
              onClick={() => assignMutation.mutate({ nextStepId: primaryStep.id })}
            >
              {t("nextStep.assignTask")}
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            className="min-h-[44px]"
            disabled={retestMutation.isPending}
            loading={retestMutation.isPending}
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() =>
              retestMutation.mutate({
                skillId: primaryStep.skillId,
                actionType: "RETEST",
              })
            }
          >
            {t("nextStep.retest")}
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="min-h-[44px]"
            icon={<MessageSquare className="h-4 w-4" />}
            onClick={() => setIsNoteOpen((prev) => !prev)}
          >
            {t("nextStep.sendNote")}
          </Button>

          {showNoteSuccess && (
            <Badge tone="ok" className="text-xs">
              {t("nextStep.sentSuccess")}
            </Badge>
          )}
        </div>

        {/* Inline note sender textarea */}
        {isNoteOpen && (
          <div className="space-y-3 rounded-xl border border-line bg-surface p-3.5">
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t("nextStep.notePlaceholder")}
              className="w-full rounded-lg border border-line bg-surface-alt p-3 text-xs sm:text-sm text-text placeholder:text-muted focus:border-brand focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                className="min-h-[44px]"
                disabled={!noteText.trim() || sendNoteMutation.isPending}
                loading={sendNoteMutation.isPending}
                onClick={handleSendNote}
              >
                {t("nextStep.send")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px]"
                onClick={() => {
                  setIsNoteOpen(false);
                  setNoteText("");
                }}
              >
                {t("nextStep.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Remaining next steps */}
      {otherSteps.length > 0 && (
        <div className="border-t border-line pt-4 space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t("nextStep.otherSteps")} ({otherSteps.length})
          </h4>
          <div className="space-y-2">
            {otherSteps.map((step) => (
              <div
                key={step.id}
                className="rounded-xl border border-line bg-surface-alt p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-text">{step.skillName}</span>
                  <Badge tone={actionTone[step.actionType]} className="text-[10px]">
                    {t(`nextStep.actionType.${step.actionType}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted">{step.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
