import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Boxes,
  Braces,
  ClipboardList,
  Code,
  Cpu,
  FileCode,
  Layers,
  Paperclip,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { StudentAssignmentItem } from "@zexn/shared";
import { Badge, Button, Card, ProgressBar, Spinner } from "@/components/ui";
import { DifficultyBadge } from "./DifficultyBadge";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { DueLabel } from "./DueLabel";
import { useStartStudentAssignment } from "./useAssignments";
import { ROUTES } from "@/routes";

const TOPIC_ICONS = [Code, Layers, Cpu, Boxes, Terminal, FileCode, Braces, Sparkles];

interface AssignmentRowProps {
  item: StudentAssignmentItem;
}

export function AssignmentRow({ item }: AssignmentRowProps) {
  const { t } = useTranslation("assignments");
  const navigate = useNavigate();
  const startMutation = useStartStudentAssignment();

  const iconIndex = Math.abs(item.title.length) % TOPIC_ICONS.length;
  const IconComponent = item.topic ? (TOPIC_ICONS[iconIndex] ?? ClipboardList) : ClipboardList;

  const showProgress = item.status === "IN_PROGRESS" || item.status === "DONE";
  const progressPercent = item.status === "DONE" ? 100 : item.progress;

  async function handleStart() {
    try {
      await startMutation.mutateAsync(item.id);
      navigate(ROUTES.studentTask(item.id));
    } catch {
      // If error or already started, navigate to detail
      navigate(ROUTES.studentTask(item.id));
    }
  }

  function handleActionClick() {
    if (item.status === "NEW") {
      void handleStart();
    } else if (item.status === "IN_PROGRESS" || item.status === "DONE") {
      navigate(ROUTES.studentTask(item.id));
    }
  }

  return (
    <Card className="border-line bg-surface p-4 shadow-sm hover:border-brand/40 transition-all">
      {/* Desktop Layout (hidden on mobile) */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:items-center lg:gap-4">
        {/* Col 1-5: Icon + Title/Description/Badges */}
        <div className="col-span-5 flex items-start gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface-alt text-brand">
            <IconComponent className="h-6 w-6" />
          </div>

          <div className="flex flex-col min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-text truncate">{item.title}</h3>
              {item.isAiRecommended && (
                <Badge tone="brand" className="text-[10px] font-semibold py-0.5">
                  <Sparkles className="h-3 w-3 mr-0.5" />
                  {t("row.aiRecommended")}
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted line-clamp-2 leading-relaxed">{item.description}</p>

            {/* Chips row */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {item.topic && (
                <Badge tone="neutral" className="text-[11px]">
                  {item.topic.title}
                </Badge>
              )}
              <DifficultyBadge difficulty={item.difficulty} />
              {item.resourcesCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{item.resourcesCount}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Col 6-7: Due Date */}
        <div className="col-span-2">
          <DueLabel dueAt={item.dueAt} status={item.status} />
        </div>

        {/* Col 8-9: Progress */}
        <div className="col-span-2">
          {showProgress ? (
            <div className="space-y-1 pr-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted">{t("row.progress")}</span>
                <span className="font-mono font-bold text-text">{progressPercent}%</span>
              </div>
              <ProgressBar
                value={progressPercent}
                tone={item.status === "DONE" ? "ok" : "brand"}
                size="sm"
              />
            </div>
          ) : (
            <span className="text-xs text-muted">{t("row.noProgress")}</span>
          )}
        </div>

        {/* Col 10: Status Badge */}
        <div className="col-span-1 flex justify-center">
          <SubmissionStatusBadge status={item.status} />
        </div>

        {/* Col 11-12: Action Button */}
        <div className="col-span-2 flex justify-end">
          {item.status === "NEW" && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleActionClick}
              disabled={startMutation.isPending}
              icon={
                startMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )
              }
            >
              {t("row.start")}
            </Button>
          )}

          {item.status === "IN_PROGRESS" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleActionClick}
              icon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              {t("row.continue")}
            </Button>
          )}

          {item.status === "SUBMITTED" && (
            <Button variant="secondary" size="sm" disabled>
              {t("row.waitingResult")}
            </Button>
          )}

          {item.status === "DONE" && (
            <Button variant="secondary" size="sm" onClick={handleActionClick}>
              {t("row.viewResult")}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card Layout (lg:hidden) */}
      <div className="flex flex-col space-y-3.5 lg:hidden">
        {/* Top: Icon + Title + AI badge */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface-alt text-brand">
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-text truncate">{item.title}</h3>
              {item.isAiRecommended && (
                <Badge tone="brand" className="text-[9px] py-0.5">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  {t("row.aiRecommended")}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted line-clamp-2">{item.description}</p>
          </div>
        </div>

        {/* Chips row */}
        <div className="flex items-center gap-2 flex-wrap">
          {item.topic && (
            <Badge tone="neutral" className="text-[11px]">
              {item.topic.title}
            </Badge>
          )}
          <DifficultyBadge difficulty={item.difficulty} />
          <SubmissionStatusBadge status={item.status} />
          {item.resourcesCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <Paperclip className="h-3.5 w-3.5" />
              <span>{item.resourcesCount}</span>
            </span>
          )}
        </div>

        {/* Progress if in progress / done */}
        {showProgress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{t("row.progress")}</span>
              <span className="font-mono font-bold text-text">{progressPercent}%</span>
            </div>
            <ProgressBar
              value={progressPercent}
              tone={item.status === "DONE" ? "ok" : "brand"}
              size="sm"
            />
          </div>
        )}

        {/* Bottom row: Due date + Button full width */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-line">
          <DueLabel dueAt={item.dueAt} status={item.status} />

          <div className="w-full sm:w-auto">
            {item.status === "NEW" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleActionClick}
                disabled={startMutation.isPending}
                className="w-full sm:w-auto min-h-[44px]"
                icon={
                  startMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5" />
                  )
                }
              >
                {t("row.start")}
              </Button>
            )}

            {item.status === "IN_PROGRESS" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleActionClick}
                className="w-full sm:w-auto min-h-[44px]"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                {t("row.continue")}
              </Button>
            )}

            {item.status === "SUBMITTED" && (
              <Button
                variant="secondary"
                size="sm"
                disabled
                className="w-full sm:w-auto min-h-[44px]"
              >
                {t("row.waitingResult")}
              </Button>
            )}

            {item.status === "DONE" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleActionClick}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {t("row.viewResult")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
